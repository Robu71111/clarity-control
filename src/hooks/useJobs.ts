import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type JobStatus = 'Open' | 'On Hold' | 'Interviewing' | 'Offer Made' | 'Filled' | 'Closed - No Hire';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Job {
  id: string;
  client_id: string;
  title: string;
  priority: Priority;
  open_date: string;
  submissions: number;
  interviews: number;
  offers: number;
  starts: number;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: { id: string; name: string } | null;
  recruiters?: { employee_id: string; employee: { id: string; name: string } }[];
}

export interface JobInsert {
  client_id: string;
  title: string;
  priority?: Priority;
  open_date?: string;
  status?: JobStatus;
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(id, name),
          recruiters:job_recruiters(
            employee_id,
            employee:employees(id, name)
          )
        `)
        .order('open_date', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useJobsByClient(clientId: string) {
  return useQuery({
    queryKey: ['jobs', 'client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(id, name),
          recruiters:job_recruiters(
            employee_id,
            employee:employees(id, name)
          )
        `)
        .eq('client_id', clientId)
        .order('open_date', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!clientId,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: JobInsert) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useAssignRecruiter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, employeeId }: { jobId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('job_recruiters')
        .insert({ job_id: jobId, employee_id: employeeId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useRemoveRecruiter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, employeeId }: { jobId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('job_recruiters')
        .delete()
        .eq('job_id', jobId)
        .eq('employee_id', employeeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
