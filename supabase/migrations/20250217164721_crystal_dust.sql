/*
  # Configuration des administrateurs

  1. Nouvelles Tables
    - `admin_users` pour stocker les administrateurs
  2. Sécurité
    - Activation de RLS sur la table admin_users
    - Politique de sécurité pour admin_users
    - Fonction is_admin() pour vérifier les droits
    - Politique d'accès aux profils utilisateurs
*/

-- Créer la table des administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour admin_users
CREATE POLICY "Admin users can view admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile access" ON user_profiles;

-- Créer la nouvelle politique d'accès aux profils
CREATE POLICY "Profile access policy"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );