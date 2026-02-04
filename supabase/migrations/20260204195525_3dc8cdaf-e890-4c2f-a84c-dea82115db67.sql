-- Insert admin role for existing user niramay@mintextech.com
INSERT INTO public.user_roles (user_id, role, department_access)
SELECT id, 'admin', ARRAY['Recruiter', 'Account Manager', 'Business Development', 'Operations Manager', 'Finance']
FROM auth.users
WHERE email = 'niramay@mintextech.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to niramay@mintextech.com
  IF NEW.email = 'niramay@mintextech.com' THEN
    INSERT INTO public.user_roles (user_id, role, department_access)
    VALUES (NEW.id, 'admin', ARRAY['Recruiter', 'Account Manager', 'Business Development', 'Operations Manager', 'Finance'])
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'Failed to assign admin role: %', SQLERRM;
  RETURN NEW;
END;
$$;