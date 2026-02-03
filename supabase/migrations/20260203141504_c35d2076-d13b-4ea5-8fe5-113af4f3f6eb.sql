-- Add new columns to recruiter_activities for enhanced KPIs
ALTER TABLE public.recruiter_activities
ADD COLUMN am_submissions integer NOT NULL DEFAULT 0,
ADD COLUMN end_client_submissions integer NOT NULL DEFAULT 0,
ADD COLUMN hired integer NOT NULL DEFAULT 0;

-- Create KPI targets table for editable targets
CREATE TABLE public.kpi_targets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department text NOT NULL,
  kpi_name text NOT NULL,
  target_value numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'weekly',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(department, kpi_name, period)
);

-- Enable RLS on kpi_targets
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;

-- RLS policies for kpi_targets
CREATE POLICY "Authenticated users can view kpi_targets"
ON public.kpi_targets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert kpi_targets"
ON public.kpi_targets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kpi_targets"
ON public.kpi_targets FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete kpi_targets"
ON public.kpi_targets FOR DELETE
TO authenticated
USING (true);

-- Add trigger for updated_at on kpi_targets
CREATE TRIGGER update_kpi_targets_updated_at
BEFORE UPDATE ON public.kpi_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create enum for custom field types
CREATE TYPE public.custom_field_type AS ENUM (
  'date',
  'currency',
  'percentage',
  'text',
  'number'
);

-- Create custom_kpi_fields table
CREATE TABLE public.custom_kpi_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department text NOT NULL,
  field_name text NOT NULL,
  field_type public.custom_field_type NOT NULL DEFAULT 'text',
  field_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on custom_kpi_fields
ALTER TABLE public.custom_kpi_fields ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_kpi_fields
CREATE POLICY "Authenticated users can view custom_kpi_fields"
ON public.custom_kpi_fields FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert custom_kpi_fields"
ON public.custom_kpi_fields FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom_kpi_fields"
ON public.custom_kpi_fields FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete custom_kpi_fields"
ON public.custom_kpi_fields FOR DELETE
TO authenticated
USING (true);

-- Add trigger for updated_at on custom_kpi_fields
CREATE TRIGGER update_custom_kpi_fields_updated_at
BEFORE UPDATE ON public.custom_kpi_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create custom_kpi_values table
CREATE TABLE public.custom_kpi_values (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_field_id uuid NOT NULL REFERENCES public.custom_kpi_fields(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period text NOT NULL,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(custom_field_id, employee_id, period)
);

-- Enable RLS on custom_kpi_values
ALTER TABLE public.custom_kpi_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_kpi_values
CREATE POLICY "Authenticated users can view custom_kpi_values"
ON public.custom_kpi_values FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert custom_kpi_values"
ON public.custom_kpi_values FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom_kpi_values"
ON public.custom_kpi_values FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete custom_kpi_values"
ON public.custom_kpi_values FOR DELETE
TO authenticated
USING (true);

-- Add trigger for updated_at on custom_kpi_values
CREATE TRIGGER update_custom_kpi_values_updated_at
BEFORE UPDATE ON public.custom_kpi_values
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default KPI targets for Recruiters
INSERT INTO public.kpi_targets (department, kpi_name, target_value, period) VALUES
('Recruiter', 'Open Positions Worked On', 15, 'weekly'),
('Recruiter', 'Job Coverage Ratio', 80, 'weekly'),
('Recruiter', 'AM Submissions', 50, 'weekly'),
('Recruiter', 'End Client Submissions', 40, 'weekly'),
('Recruiter', 'Interviews', 30, 'weekly'),
('Recruiter', 'Hired', 8, 'weekly');