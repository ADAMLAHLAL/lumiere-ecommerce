/*
# Make first user admin automatically

## Overview
Updates the handle_new_user() trigger so that the very first user to sign up
becomes an admin automatically. Subsequent users default to 'customer' role.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count integer;
  assigned_role text;
BEGIN
  SELECT count(*) INTO user_count FROM profiles;
  IF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), assigned_role);
  RETURN NEW;
END;
$$;
