import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecordComment {
  id: string;
  table_name: string;
  record_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export function useComments(tableName: string, recordId: string) {
  return useQuery({
    queryKey: ['comments', tableName, recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('record_comments')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RecordComment[];
    },
    enabled: !!recordId,
  });
}

export function useCreateComment() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ table_name, record_id, comment }: { table_name: string; record_id: string; comment: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('record_comments')
        .insert({ table_name, record_id, user_id: user.id, comment })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.table_name, vars.record_id] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, table_name, record_id }: { id: string; table_name: string; record_id: string }) => {
      const { error } = await supabase.from('record_comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.table_name, vars.record_id] });
    },
  });
}
