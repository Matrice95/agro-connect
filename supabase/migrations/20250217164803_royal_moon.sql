/*
  # Configuration finale des administrateurs

  1. Nouvelles Tables
    - `admin_users` pour stocker les administrateurs
  2. Sécurité
    - Activation de RLS sur la table admin_users
    - Politique de sécurité simplifiée
    - Fonction is_admin() optimisée
    - Politique d'accès aux profils utilisateurs simplifiée
*/

-- Supprimer les tables et politiques existantes pour un départ propre
DROP TABLE IF EXISTS admin_users CASCADE;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile access" ON user_profiles;
DROP POLICY IF EXISTS "Profile access policy" ON user_profiles;

-- Créer la table des administrateurs
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique simple pour admin_users
CREATE POLICY "Basic admin access"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true);

-- Fonction optimisée pour vérifier si un utilisateur est administrateur
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

-- Politique simple pour user_profiles
CREATE POLICY "Basic profile access"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR is_admin()
  );