import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CustomFieldType = 'date' | 'currency' | 'percentage' | 'text' | 'number';

export interface CustomKPIField {
  id: string;
  department: string;
  field_name: string;
  field_type: CustomFieldType;
  field_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomKPIFieldInsert {
  department: string;
  field_name: string;
  field_type: CustomFieldType;
  field_order?: number;
}

export interface CustomKPIFieldUpdate {
  id: string;
  field_name?: string;
  field_type?: CustomFieldType;
  field_order?: number;
  is_active?: boolean;
}

export function useCustomFields(department?: string) {
  return useQuery({
    queryKey: ['custom_kpi_fields', department],
    queryFn: async () => {
      let query = supabase
        .from('custom_kpi_fields')
        .select('*')
        .eq('is_active', true);
      
      if (department) {
        query = query.eq('department', department);
      }
      
      const { data, error } = await query.order('field_order');
      
      if (error) throw error;
      return data as CustomKPIField[];
    },
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (field: CustomKPIFieldInsert) => {
      // First get the max field_order for this department
      const { data: existing } = await supabase
        .from('custom_kpi_fields')
        .select('field_order')
        .eq('department', field.department)
        .order('field_order', { ascending: false })
        .limit(1);
      
      const maxOrder = existing && existing.length > 0 ? existing[0].field_order : -1;
      
      const { data, error } = await supabase
        .from('custom_kpi_fields')
        .insert({ ...field, field_order: field.field_order ?? maxOrder + 1 })
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomKPIField;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_kpi_fields'] });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CustomKPIFieldUpdate) => {
      const { data, error } = await supabase
        .from('custom_kpi_fields')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CustomKPIField;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_kpi_fields'] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_kpi_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_kpi_fields'] });
    },
  });
}

export function useCustomFieldCount(department: string) {
  return useQuery({
    queryKey: ['custom_kpi_fields_count', department],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('custom_kpi_fields')
        .select('*', { count: 'exact', head: true })
        .eq('department', department)
        .eq('is_active', true);
      
      if (error) throw error;
      return count ?? 0;
    },
  });
}
