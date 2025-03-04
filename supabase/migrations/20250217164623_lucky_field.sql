/*
  # Configuration des administrateurs

  1. Nouvelles Tables
    - `admin_users` pour stocker les administrateurs
  2. Sécurité
    - Activation de RLS sur la table admin_users
    - Politique de sécurité pour admin_users
    - Fonction is_admin() pour vérifier les droits
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
CREATE POLICY "Only admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;

-- Créer la nouvelle politique
CREATE POLICY "Allow profile access"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR 
    (SELECT EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE user_id = auth.uid()
    ))
  );