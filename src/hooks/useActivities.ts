import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Recruiter Activities
export interface RecruiterActivity {
  id: string;
  activity_date: string;
  employee_id: string;
  job_id: string;
  resumes_sourced: number;
  submitted: number;
  feedback_received: number;
  interviews_scheduled: number;
  created_at: string;
  // Joined data
  employee?: { id: string; name: string } | null;
  job?: { id: string; title: string; client: { name: string } } | null;
}

export interface RecruiterActivityInsert {
  employee_id: string;
  job_id: string;
  activity_date?: string;
  resumes_sourced?: number;
  submitted?: number;
  feedback_received?: number;
  interviews_scheduled?: number;
}

export function useRecruiterActivities() {
  return useQuery({
    queryKey: ['recruiter_activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruiter_activities')
        .select(`
          *,
          employee:employees(id, name),
          job:jobs(id, title, client:clients(name))
        `)
        .order('activity_date', { ascending: false });
      
      if (error) throw error;
      return data as RecruiterActivity[];
    },
  });
}

export function useRecruiterActivitiesByEmployee(employeeId: string) {
  return useQuery({
    queryKey: ['recruiter_activities', 'employee', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruiter_activities')
        .select(`
          *,
          employee:employees(id, name),
          job:jobs(id, title, client:clients(name))
        `)
        .eq('employee_id', employeeId)
        .order('activity_date', { ascending: false });
      
      if (error) throw error;
      return data as RecruiterActivity[];
    },
    enabled: !!employeeId,
  });
}

export function useCreateRecruiterActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activity: RecruiterActivityInsert) => {
      const { data, error } = await supabase
        .from('recruiter_activities')
        .insert(activity)
        .select()
        .single();
      
      if (error) throw error;
      return data as RecruiterActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter_activities'] });
    },
  });
}

// AM Activities
export interface AMActivity {
  id: string;
  activity_date: string;
  employee_id: string;
  client_id: string;
  action_taken: string;
  outcome: string | null;
  next_step: string | null;
  created_at: string;
  // Joined data
  employee?: { id: string; name: string } | null;
  client?: { id: string; name: string } | null;
}

export interface AMActivityInsert {
  employee_id: string;
  client_id: string;
  action_taken: string;
  activity_date?: string;
  outcome?: string | null;
  next_step?: string | null;
}

export function useAMActivities() {
  return useQuery({
    queryKey: ['am_activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('am_activities')
        .select(`
          *,
          employee:employees(id, name),
          client:clients(id, name)
        `)
        .order('activity_date', { ascending: false });
      
      if (error) throw error;
      return data as AMActivity[];
    },
  });
}

export function useCreateAMActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activity: AMActivityInsert) => {
      const { data, error } = await supabase
        .from('am_activities')
        .insert(activity)
        .select()
        .single();
      
      if (error) throw error;
      return data as AMActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['am_activities'] });
    },
  });
}
