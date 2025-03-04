/*
  # Authentication System Setup

  1. Security
    - Enable Row Level Security (RLS) for authentication
    - Add policies for user profile management
    - Set up registration code validation

  2. Tables
    - `registration_codes` table for managing unique signup codes
      - `code` (text, primary key): The unique registration code
      - `used` (boolean): Whether the code has been used
      - `created_at` (timestamp): When the code was created
      - `used_at` (timestamp): When the code was used
      - `expires_at` (timestamp): When the code expires
*/

-- Create registration codes table
CREATE TABLE IF NOT EXISTS registration_codes (
  code text PRIMARY KEY,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading registration codes during signup
CREATE POLICY "Allow reading valid registration codes"
  ON registration_codes
  FOR SELECT
  TO authenticated, anon
  USING (
    NOT used 
    AND (expires_at > now())
  );

-- Function to validate and mark registration code as used
CREATE OR REPLACE FUNCTION validate_registration_code(code_to_validate text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  valid boolean;
BEGIN
  UPDATE registration_codes
  SET 
    used = true,
    used_at = now()
  WHERE 
    code = code_to_validate
    AND NOT used
    AND expires_at > now()
  RETURNING true INTO valid;
  
  RETURN COALESCE(valid, false);
END;
$$;