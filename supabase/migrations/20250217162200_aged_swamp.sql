/*
  # Configuration de l'interface d'administration

  1. Nouvelles Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence vers auth.users)
      - `created_at` (timestamp)

  2. Nouvelles Politiques
    - Permettre aux administrateurs de voir tous les profils utilisateurs
    - Permettre aux administrateurs de gérer les codes d'inscription

  3. Fonctions
    - Fonction pour vérifier si un utilisateur est administrateur
*/

-- Créer la table des administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour que seuls les administrateurs puissent voir la table admin_users
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- Fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- Mettre à jour la politique de user_profiles pour permettre aux administrateurs de voir tous les profils
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );