/*
  # Structure de la base de données pour les prévisions saisonnières

  1. Nouvelles Tables
    - `seasonal_forecasts`
      - `id` (uuid, primary key)
      - `location_id` (text, référence à la localité)
      - `year` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, référence à l'utilisateur admin)

    - `seasonal_periods`
      - `id` (uuid, primary key)
      - `forecast_id` (uuid, référence à seasonal_forecasts)
      - `start_date` (date)
      - `end_date` (date)
      - `type` (text: 'rainy' ou 'dry')

    - `dry_sequences`
      - `id` (uuid, primary key)
      - `period_id` (uuid, référence à seasonal_periods)
      - `start_date` (date)
      - `end_date` (date)
      - `intensity` (text: 'light', 'moderate', 'severe')

    - `forecast_recommendations`
      - `id` (uuid, primary key)
      - `forecast_id` (uuid, référence à seasonal_forecasts)
      - `recommendation` (text)
      - `order` (integer)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour lecture publique
    - Policies pour modification par les admins uniquement
*/

-- Créer la table des prévisions saisonnières
CREATE TABLE seasonal_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  UNIQUE(location_id, year)
);

-- Créer la table des périodes saisonnières
CREATE TABLE seasonal_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id uuid REFERENCES seasonal_forecasts ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('rainy', 'dry')),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Créer la table des séquences sèches
CREATE TABLE dry_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid REFERENCES seasonal_periods ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('light', 'moderate', 'severe')),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Créer la table des recommandations
CREATE TABLE forecast_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id uuid REFERENCES seasonal_forecasts ON DELETE CASCADE NOT NULL,
  recommendation text NOT NULL,
  "order" integer NOT NULL,
  UNIQUE(forecast_id, "order")
);

-- Activer Row Level Security
ALTER TABLE seasonal_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dry_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_recommendations ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
CREATE POLICY "Tout le monde peut lire les prévisions"
  ON seasonal_forecasts
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les prévisions"
  ON seasonal_forecasts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Tout le monde peut lire les périodes"
  ON seasonal_periods
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les périodes"
  ON seasonal_periods
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Tout le monde peut lire les séquences sèches"
  ON dry_sequences
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les séquences sèches"
  ON dry_sequences
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Tout le monde peut lire les recommandations"
  ON forecast_recommendations
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les recommandations"
  ON forecast_recommendations
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seasonal_forecasts_updated_at
  BEFORE UPDATE ON seasonal_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour récupérer une prévision complète
CREATE OR REPLACE FUNCTION get_complete_forecast(p_location_id text, p_year integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  forecast_data json;
BEGIN
  SELECT json_build_object(
    'id', f.id,
    'location', f.location_id,
    'year', f.year,
    'periods', (
      SELECT json_agg(json_build_object(
        'id', p.id,
        'startDate', p.start_date,
        'endDate', p.end_date,
        'type', p.type,
        'drySequences', (
          SELECT COALESCE(json_agg(json_build_object(
            'id', ds.id,
            'startDate', ds.start_date,
            'endDate', ds.end_date,
            'intensity', ds.intensity
          )), '[]'::json)
          FROM dry_sequences ds
          WHERE ds.period_id = p.id
        )
      ))
      FROM seasonal_periods p
      WHERE p.forecast_id = f.id
      ORDER BY p.start_date
    ),
    'recommendations', (
      SELECT json_agg(r.recommendation ORDER BY r."order")
      FROM forecast_recommendations r
      WHERE r.forecast_id = f.id
    )
  ) INTO forecast_data
  FROM seasonal_forecasts f
  WHERE f.location_id = p_location_id
  AND f.year = p_year;

  RETURN forecast_data;
END;
$$;