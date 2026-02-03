import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KPITarget {
  id: string;
  department: string;
  kpi_name: string;
  target_value: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface KPITargetInsert {
  department: string;
  kpi_name: string;
  target_value: number;
  period?: string;
}

export interface KPITargetUpdate {
  id: string;
  target_value: number;
}

export function useKPITargets(department?: string) {
  return useQuery({
    queryKey: ['kpi_targets', department],
    queryFn: async () => {
      let query = supabase.from('kpi_targets').select('*');
      
      if (department) {
        query = query.eq('department', department);
      }
      
      const { data, error } = await query.order('kpi_name');
      
      if (error) throw error;
      return data as KPITarget[];
    },
  });
}

export function useUpdateKPITarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, target_value }: KPITargetUpdate) => {
      const { data, error } = await supabase
        .from('kpi_targets')
        .update({ target_value })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as KPITarget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi_targets'] });
    },
  });
}

export function useUpsertKPITarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (target: KPITargetInsert) => {
      const { data, error } = await supabase
        .from('kpi_targets')
        .upsert(target, { onConflict: 'department,kpi_name,period' })
        .select()
        .single();
      
      if (error) throw error;
      return data as KPITarget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi_targets'] });
    },
  });
}
