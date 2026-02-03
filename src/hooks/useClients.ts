import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClientStatus = 'Active' | 'Hold' | 'Inactive';

export interface Client {
  id: string;
  name: string;
  account_manager_id: string | null;
  billing_type: string;
  payment_terms: string;
  status: ClientStatus;
  last_payment_date: string | null;
  outstanding: number;
  created_at: string;
  updated_at: string;
  // Joined data
  account_manager?: { id: string; name: string } | null;
}

export interface ClientInsert {
  name: string;
  account_manager_id?: string | null;
  billing_type?: string;
  payment_terms?: string;
  status?: ClientStatus;
  outstanding?: number;
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          account_manager:employees!clients_account_manager_id_fkey(id, name)
        `)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          account_manager:employees!clients_account_manager_id_fkey(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
