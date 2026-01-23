-- Update handle_new_user trigger to read role and department from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'reception')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;