import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomChart {
  id: string;
  title: string;
  chart_type: string;
  data_source: string;
  metric_field: string;
  group_by: string | null;
  aggregate: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useCustomCharts() {
  return useQuery({
    queryKey: ['custom_charts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_charts')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as CustomChart[];
    },
  });
}

export function useAllCustomCharts() {
  return useQuery({
    queryKey: ['custom_charts_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_charts')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as CustomChart[];
    },
  });
}

export function useCreateCustomChart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chart: Omit<CustomChart, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('custom_charts').insert(chart).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom_charts'] }); qc.invalidateQueries({ queryKey: ['custom_charts_all'] }); },
  });
}

export function useUpdateCustomChart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomChart> & { id: string }) => {
      const { data, error } = await supabase.from('custom_charts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom_charts'] }); qc.invalidateQueries({ queryKey: ['custom_charts_all'] }); },
  });
}

export function useDeleteCustomChart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_charts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom_charts'] }); qc.invalidateQueries({ queryKey: ['custom_charts_all'] }); },
  });
}
