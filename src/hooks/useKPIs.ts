import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KPIMetric {
  label: string;
  thisWeek: number;
  lastWeek: number;
  format?: 'number' | 'currency' | 'percent' | 'days';
}

export function useOwnerKPIs() {
  return useQuery({
    queryKey: ['owner_kpis'],
    queryFn: async () => {
      // Get clients count
      const { count: activeClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');
      
      // Get active jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, status, submissions, interviews, offers, starts');
      
      const activeJobs = jobs?.filter(j => 
        j.status !== 'Filled' && j.status !== 'Closed - No Hire'
      ) || [];
      
      const totalSubmissions = jobs?.reduce((sum, j) => sum + (j.submissions || 0), 0) || 0;
      const totalInterviews = jobs?.reduce((sum, j) => sum + (j.interviews || 0), 0) || 0;
      const totalStarts = jobs?.reduce((sum, j) => sum + (j.starts || 0), 0) || 0;
      
      // Get invoices for revenue
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, status');
      
      const totalInvoiced = invoices?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      
      // Get payments received
      const { data: payments } = await supabase
        .from('payments')
        .select('amount');
      
      const totalReceived = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      // Get outstanding
      const { data: clients } = await supabase
        .from('clients')
        .select('outstanding');
      
      const totalOutstanding = clients?.reduce((sum, c) => sum + Number(c.outstanding), 0) || 0;
      
      const kpis: KPIMetric[] = [
        { label: 'Active Clients', thisWeek: activeClientsCount || 0, lastWeek: 0, format: 'number' },
        { label: 'Active Jobs', thisWeek: activeJobs.length, lastWeek: 0, format: 'number' },
        { label: 'Submissions', thisWeek: totalSubmissions, lastWeek: 0, format: 'number' },
        { label: 'Interviews', thisWeek: totalInterviews, lastWeek: 0, format: 'number' },
        { label: 'Starts / Placements', thisWeek: totalStarts, lastWeek: 0, format: 'number' },
        { label: 'Revenue Invoiced', thisWeek: totalInvoiced, lastWeek: 0, format: 'currency' },
        { label: 'Payment Received', thisWeek: totalReceived, lastWeek: 0, format: 'currency' },
        { label: 'Outstanding Receivable', thisWeek: totalOutstanding, lastWeek: 0, format: 'currency' },
        { label: 'Avg Collection Days', thisWeek: 30, lastWeek: 30, format: 'days' },
      ];
      
      return kpis;
    },
  });
}

export function useQuickStats() {
  return useQuery({
    queryKey: ['quick_stats'],
    queryFn: async () => {
      const [
        { count: activeClients },
        { data: jobs },
        { data: invoices },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('jobs').select('id, status'),
        supabase.from('invoices').select('amount, status, due_date'),
      ]);
      
      const activeJobs = jobs?.filter(j => 
        j.status !== 'Filled' && j.status !== 'Closed - No Hire'
      ).length || 0;
      
      const filledJobs = jobs?.filter(j => j.status === 'Filled').length || 0;
      
      const today = new Date();
      const overdueAmount = invoices?.filter(inv => {
        if (inv.status === 'Paid' || !inv.due_date) return false;
        const dueDate = new Date(inv.due_date);
        const daysPast = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysPast > 30;
      }).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      
      return {
        activeClients: activeClients || 0,
        activeJobs,
        filledJobs,
        overdueAmount,
      };
    },
  });
}
