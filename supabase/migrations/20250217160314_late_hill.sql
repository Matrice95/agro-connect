/*
  # Fix user registration

  1. Changes
    - Update handle_new_user function to handle null values
    - Add error handling for profile creation
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle null values and add error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify that required metadata fields are present
  IF NEW.raw_user_meta_data IS NULL OR
     NEW.raw_user_meta_data->>'first_name' IS NULL OR
     NEW.raw_user_meta_data->>'last_name' IS NULL OR
     NEW.raw_user_meta_data->>'position' IS NULL OR
     NEW.raw_user_meta_data->>'organization' IS NULL OR
     NEW.raw_user_meta_data->>'phone' IS NULL THEN
    RAISE EXCEPTION 'Missing required profile information';
  END IF;

  -- Verify registration code
  IF NEW.raw_user_meta_data->>'registration_code' != '483445@' THEN
    RAISE EXCEPTION 'Invalid registration code';
  END IF;

  -- Insert the profile
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
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'position',
    NEW.raw_user_meta_data->>'organization',
    NEW.raw_user_meta_data->>'phone'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (in a real production system)
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();