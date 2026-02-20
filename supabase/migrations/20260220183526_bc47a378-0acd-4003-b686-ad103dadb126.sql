ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS department_edit_access text[] DEFAULT '{}';