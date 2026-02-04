-- Fix overly permissive RLS policies by adding role-based checks
-- Drop existing permissive policies and replace with role-based ones

-- ===== EMPLOYEES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON public.employees;

CREATE POLICY "All authenticated can view employees"
ON public.employees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert employees"
ON public.employees FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update employees"
ON public.employees FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete employees"
ON public.employees FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== CLIENTS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

CREATE POLICY "All authenticated can view clients"
ON public.clients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and AMs can insert clients"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins and AMs can update clients"
ON public.clients FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== JOBS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public.jobs;

CREATE POLICY "All authenticated can view jobs"
ON public.jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and AMs can insert jobs"
ON public.jobs FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins and AMs can update jobs"
ON public.jobs FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins can delete jobs"
ON public.jobs FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== JOB_RECRUITERS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view job_recruiters" ON public.job_recruiters;
DROP POLICY IF EXISTS "Authenticated users can insert job_recruiters" ON public.job_recruiters;
DROP POLICY IF EXISTS "Authenticated users can update job_recruiters" ON public.job_recruiters;
DROP POLICY IF EXISTS "Authenticated users can delete job_recruiters" ON public.job_recruiters;

CREATE POLICY "All authenticated can view job_recruiters"
ON public.job_recruiters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and AMs can insert job_recruiters"
ON public.job_recruiters FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins and AMs can update job_recruiters"
ON public.job_recruiters FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins can delete job_recruiters"
ON public.job_recruiters FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== RECRUITER_ACTIVITIES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view recruiter_activities" ON public.recruiter_activities;
DROP POLICY IF EXISTS "Authenticated users can insert recruiter_activities" ON public.recruiter_activities;
DROP POLICY IF EXISTS "Authenticated users can update recruiter_activities" ON public.recruiter_activities;
DROP POLICY IF EXISTS "Authenticated users can delete recruiter_activities" ON public.recruiter_activities;

CREATE POLICY "All authenticated can view recruiter_activities"
ON public.recruiter_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and recruiters can insert recruiter_activities"
ON public.recruiter_activities FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Admins and recruiters can update recruiter_activities"
ON public.recruiter_activities FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'recruiter'));

CREATE POLICY "Admins can delete recruiter_activities"
ON public.recruiter_activities FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== AM_ACTIVITIES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view am_activities" ON public.am_activities;
DROP POLICY IF EXISTS "Authenticated users can insert am_activities" ON public.am_activities;
DROP POLICY IF EXISTS "Authenticated users can update am_activities" ON public.am_activities;
DROP POLICY IF EXISTS "Authenticated users can delete am_activities" ON public.am_activities;

CREATE POLICY "All authenticated can view am_activities"
ON public.am_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and AMs can insert am_activities"
ON public.am_activities FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins and AMs can update am_activities"
ON public.am_activities FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'account_manager'));

CREATE POLICY "Admins can delete am_activities"
ON public.am_activities FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== BD_PROSPECTS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view bd_prospects" ON public.bd_prospects;
DROP POLICY IF EXISTS "Authenticated users can insert bd_prospects" ON public.bd_prospects;
DROP POLICY IF EXISTS "Authenticated users can update bd_prospects" ON public.bd_prospects;
DROP POLICY IF EXISTS "Authenticated users can delete bd_prospects" ON public.bd_prospects;

CREATE POLICY "All authenticated can view bd_prospects"
ON public.bd_prospects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and BD can insert bd_prospects"
ON public.bd_prospects FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'business_dev'));

CREATE POLICY "Admins and BD can update bd_prospects"
ON public.bd_prospects FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'business_dev'));

CREATE POLICY "Admins can delete bd_prospects"
ON public.bd_prospects FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== INVOICES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;

CREATE POLICY "Admins and Finance can view invoices"
ON public.invoices FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins and Finance can insert invoices"
ON public.invoices FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins and Finance can update invoices"
ON public.invoices FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== PAYMENTS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can delete payments" ON public.payments;

CREATE POLICY "Admins and Finance can view payments"
ON public.payments FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins and Finance can insert payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins and Finance can update payments"
ON public.payments FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== EMPLOYEE_SCORES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view employee_scores" ON public.employee_scores;
DROP POLICY IF EXISTS "Authenticated users can insert employee_scores" ON public.employee_scores;
DROP POLICY IF EXISTS "Authenticated users can update employee_scores" ON public.employee_scores;
DROP POLICY IF EXISTS "Authenticated users can delete employee_scores" ON public.employee_scores;

CREATE POLICY "All authenticated can view employee_scores"
ON public.employee_scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Operations can insert employee_scores"
ON public.employee_scores FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'operations'));

CREATE POLICY "Admins and Operations can update employee_scores"
ON public.employee_scores FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'operations'));

CREATE POLICY "Admins can delete employee_scores"
ON public.employee_scores FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== KPI_TARGETS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view kpi_targets" ON public.kpi_targets;
DROP POLICY IF EXISTS "Authenticated users can insert kpi_targets" ON public.kpi_targets;
DROP POLICY IF EXISTS "Authenticated users can update kpi_targets" ON public.kpi_targets;
DROP POLICY IF EXISTS "Authenticated users can delete kpi_targets" ON public.kpi_targets;

CREATE POLICY "All authenticated can view kpi_targets"
ON public.kpi_targets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert kpi_targets"
ON public.kpi_targets FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update kpi_targets"
ON public.kpi_targets FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete kpi_targets"
ON public.kpi_targets FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== CUSTOM_KPI_FIELDS TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view custom_kpi_fields" ON public.custom_kpi_fields;
DROP POLICY IF EXISTS "Authenticated users can insert custom_kpi_fields" ON public.custom_kpi_fields;
DROP POLICY IF EXISTS "Authenticated users can update custom_kpi_fields" ON public.custom_kpi_fields;
DROP POLICY IF EXISTS "Authenticated users can delete custom_kpi_fields" ON public.custom_kpi_fields;

CREATE POLICY "All authenticated can view custom_kpi_fields"
ON public.custom_kpi_fields FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert custom_kpi_fields"
ON public.custom_kpi_fields FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update custom_kpi_fields"
ON public.custom_kpi_fields FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete custom_kpi_fields"
ON public.custom_kpi_fields FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ===== CUSTOM_KPI_VALUES TABLE =====
DROP POLICY IF EXISTS "Authenticated users can view custom_kpi_values" ON public.custom_kpi_values;
DROP POLICY IF EXISTS "Authenticated users can insert custom_kpi_values" ON public.custom_kpi_values;
DROP POLICY IF EXISTS "Authenticated users can update custom_kpi_values" ON public.custom_kpi_values;
DROP POLICY IF EXISTS "Authenticated users can delete custom_kpi_values" ON public.custom_kpi_values;

CREATE POLICY "All authenticated can view custom_kpi_values"
ON public.custom_kpi_values FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert custom_kpi_values"
ON public.custom_kpi_values FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update custom_kpi_values"
ON public.custom_kpi_values FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete custom_kpi_values"
ON public.custom_kpi_values FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));