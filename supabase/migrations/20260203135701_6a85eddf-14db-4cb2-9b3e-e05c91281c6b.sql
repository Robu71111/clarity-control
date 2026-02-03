-- Create enum types for statuses
CREATE TYPE public.job_status AS ENUM ('Open', 'On Hold', 'Interviewing', 'Offer Made', 'Filled', 'Closed - No Hire');
CREATE TYPE public.client_status AS ENUM ('Active', 'Hold', 'Inactive');
CREATE TYPE public.invoice_status AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue');
CREATE TYPE public.bd_stage AS ENUM ('Lead', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost');
CREATE TYPE public.employee_role AS ENUM ('Account Manager', 'Recruiter', 'Business Development', 'Operations Manager', 'Owner');
CREATE TYPE public.priority_level AS ENUM ('High', 'Medium', 'Low');

-- Create employees table (staff members)
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role public.employee_role NOT NULL,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    account_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    billing_type TEXT NOT NULL DEFAULT 'Monthly',
    payment_terms TEXT NOT NULL DEFAULT 'Net 30',
    status public.client_status NOT NULL DEFAULT 'Active',
    last_payment_date DATE,
    outstanding NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    priority public.priority_level NOT NULL DEFAULT 'Medium',
    open_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submissions INTEGER NOT NULL DEFAULT 0,
    interviews INTEGER NOT NULL DEFAULT 0,
    offers INTEGER NOT NULL DEFAULT 0,
    starts INTEGER NOT NULL DEFAULT 0,
    status public.job_status NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_recruiters junction table (many-to-many)
CREATE TABLE public.job_recruiters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(job_id, employee_id)
);

-- Create recruiter_activities table
CREATE TABLE public.recruiter_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    resumes_sourced INTEGER NOT NULL DEFAULT 0,
    submitted INTEGER NOT NULL DEFAULT 0,
    feedback_received INTEGER NOT NULL DEFAULT 0,
    interviews_scheduled INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create am_activities table (Account Manager activities)
CREATE TABLE public.am_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    outcome TEXT,
    next_step TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bd_prospects table (Business Development pipeline)
CREATE TABLE public.bd_prospects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    industry TEXT,
    stage public.bd_stage NOT NULL DEFAULT 'Lead',
    last_follow_up DATE,
    next_action TEXT,
    probability INTEGER NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    bd_owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_no TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    billing_month TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    sent_date DATE,
    due_date DATE,
    status public.invoice_status NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date_received DATE NOT NULL DEFAULT CURRENT_DATE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'Wire Transfer',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_scores table (performance scorecards)
CREATE TABLE public.employee_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    score_month TEXT NOT NULL,
    productivity INTEGER NOT NULL DEFAULT 3 CHECK (productivity >= 1 AND productivity <= 5),
    quality INTEGER NOT NULL DEFAULT 3 CHECK (quality >= 1 AND quality <= 5),
    discipline INTEGER NOT NULL DEFAULT 3 CHECK (discipline >= 1 AND discipline <= 5),
    ownership INTEGER NOT NULL DEFAULT 3 CHECK (ownership >= 1 AND ownership <= 5),
    final_score NUMERIC(3, 2) GENERATED ALWAYS AS ((productivity + quality + discipline + ownership)::NUMERIC / 4) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(employee_id, score_month)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create update triggers for all tables with updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bd_prospects_updated_at BEFORE UPDATE ON public.bd_prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_scores_updated_at BEFORE UPDATE ON public.employee_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.am_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing authenticated users full access for now - can be refined later)
-- Employees policies
CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON public.employees FOR DELETE TO authenticated USING (true);

-- Clients policies
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- Jobs policies
CREATE POLICY "Authenticated users can view jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (true);

-- Job recruiters policies
CREATE POLICY "Authenticated users can view job_recruiters" ON public.job_recruiters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert job_recruiters" ON public.job_recruiters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update job_recruiters" ON public.job_recruiters FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete job_recruiters" ON public.job_recruiters FOR DELETE TO authenticated USING (true);

-- Recruiter activities policies
CREATE POLICY "Authenticated users can view recruiter_activities" ON public.recruiter_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert recruiter_activities" ON public.recruiter_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update recruiter_activities" ON public.recruiter_activities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete recruiter_activities" ON public.recruiter_activities FOR DELETE TO authenticated USING (true);

-- AM activities policies
CREATE POLICY "Authenticated users can view am_activities" ON public.am_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert am_activities" ON public.am_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update am_activities" ON public.am_activities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete am_activities" ON public.am_activities FOR DELETE TO authenticated USING (true);

-- BD prospects policies
CREATE POLICY "Authenticated users can view bd_prospects" ON public.bd_prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bd_prospects" ON public.bd_prospects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bd_prospects" ON public.bd_prospects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete bd_prospects" ON public.bd_prospects FOR DELETE TO authenticated USING (true);

-- Invoices policies
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

-- Payments policies
CREATE POLICY "Authenticated users can view payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments" ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete payments" ON public.payments FOR DELETE TO authenticated USING (true);

-- Employee scores policies
CREATE POLICY "Authenticated users can view employee_scores" ON public.employee_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employee_scores" ON public.employee_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employee_scores" ON public.employee_scores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employee_scores" ON public.employee_scores FOR DELETE TO authenticated USING (true);