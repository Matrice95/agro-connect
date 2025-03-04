/*
  # Add registration code validation

  1. Changes
    - Add registration code validation function
    - Update registration codes table to include a specific code

  2. Security
    - Function is SECURITY DEFINER to ensure proper access control
*/

-- Update registration codes table with our specific code
INSERT INTO registration_codes (code, expires_at)
VALUES ('483445@', '2026-12-31 23:59:59'::timestamptz)
ON CONFLICT (code) DO NOTHING;

-- Create or replace the validation function to check for our specific code
CREATE OR REPLACE FUNCTION validate_registration_code(code_to_validate text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow the specific code
  RETURN code_to_validate = '483445@';
END;
$$;