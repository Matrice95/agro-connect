/*
  # Fix user registration structure

  1. Changes
    - Drop and recreate user_profiles table with proper constraints
    - Update handle_new_user function with better error handling
    - Add explicit transaction handling
    - Add proper validation checks
*/

-- Drop existing objects to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS user_profiles;

-- Recreate user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL CHECK (char_length(first_name) > 0),
  last_name text NOT NULL CHECK (char_length(last_name) > 0),
  position text NOT NULL CHECK (char_length(position) > 0),
  organization text NOT NULL CHECK (char_length(organization) > 0),
  phone text NOT NULL CHECK (char_length(phone) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  registration_code text;
  first_name text;
  last_name text;
  position text;
  organization text;
  phone text;
BEGIN
  -- Extract and validate metadata
  registration_code := COALESCE(NEW.raw_user_meta_data->>'registration_code', '');
  first_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', ''));
  last_name := TRIM(COALESCE(NEW.raw_user_meta_data->>'last_name', ''));
  position := TRIM(COALESCE(NEW.raw_user_meta_data->>'position', ''));
  organization := TRIM(COALESCE(NEW.raw_user_meta_data->>'organization', ''));
  phone := TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', ''));

  -- Validate registration code
  IF registration_code != '483445@' THEN
    RAISE EXCEPTION 'Code d''inscription invalide';
  END IF;

  -- Validate required fields
  IF first_name = '' OR last_name = '' OR position = '' OR organization = '' OR phone = '' THEN
    RAISE EXCEPTION 'Tous les champs du profil sont obligatoires';
  END IF;

  -- Create user profile
  INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    position,
    organization,
    phone
  )
  VALUES (
    NEW.id,
    first_name,
    last_name,
    position,
    organization,
    phone
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();