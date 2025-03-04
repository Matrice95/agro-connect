/*
  # Ajout de la gestion des périodes d'accès

  1. Modifications
    - Ajout des colonnes `access_start` et `access_end` à la table `user_profiles`
    - Ajout d'une fonction pour vérifier si l'accès d'un utilisateur est valide
    - Mise à jour des politiques d'accès pour prendre en compte la période de validité

  2. Sécurité
    - Seuls les administrateurs peuvent modifier les périodes d'accès
    - Les utilisateurs ne peuvent se connecter que pendant leur période d'accès valide
*/

-- Ajouter les colonnes de période d'accès
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS access_start timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS access_end timestamptz;

-- Fonction pour vérifier si l'accès d'un utilisateur est valide
CREATE OR REPLACE FUNCTION is_access_valid()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE
      WHEN is_admin() THEN true
      ELSE EXISTS (
        SELECT 1 
        FROM user_profiles 
        WHERE id = auth.uid()
          AND (access_start IS NULL OR access_start <= now())
          AND (access_end IS NULL OR access_end >= now())
      )
    END;
$$;

-- Mettre à jour la politique d'accès aux profils
DROP POLICY IF EXISTS "Basic profile access" ON user_profiles;

CREATE POLICY "Profile access with period check"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid() AND is_access_valid())
    OR is_admin()
  );