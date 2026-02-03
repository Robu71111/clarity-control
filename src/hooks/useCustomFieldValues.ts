import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomKPIValue {
  id: string;
  custom_field_id: string;
  employee_id: string;
  period: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomKPIValueInsert {
  custom_field_id: string;
  employee_id: string;
  period: string;
  value: string;
}

export interface CustomKPIValueUpdate {
  id: string;
  value: string;
}

export function useCustomFieldValues(period?: string, employeeId?: string) {
  return useQuery({
    queryKey: ['custom_kpi_values', period, employeeId],
    queryFn: async () => {
      let query = supabase.from('custom_kpi_values').select('*');
      
      if (period) {
        query = query.eq('period', period);
      }
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CustomKPIValue[];
    },
  });
}

export function useUpsertCustomFieldValue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (value: CustomKPIValueInsert) => {
      const { data, error } = await supabase
        .from('custom_kpi_values')
        .upsert(value, { onConflict: 'custom_field_id,employee_id,period' })
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomKPIValue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_kpi_values'] });
    },
  });
}

export function useBulkUpsertCustomFieldValues() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: CustomKPIValueInsert[]) => {
      const { data, error } = await supabase
        .from('custom_kpi_values')
        .upsert(values, { onConflict: 'custom_field_id,employee_id,period' })
        .select();
      
      if (error) throw error;
      return data as CustomKPIValue[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_kpi_values'] });
    },
  });
}
