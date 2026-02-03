import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BDStage = 'Lead' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface BDProspect {
  id: string;
  prospect_name: string;
  contact_name: string | null;
  contact_email: string | null;
  industry: string | null;
  stage: BDStage;
  last_follow_up: string | null;
  next_action: string | null;
  probability: number;
  bd_owner_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  bd_owner?: { id: string; name: string } | null;
}

export interface BDProspectInsert {
  prospect_name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  industry?: string | null;
  stage?: BDStage;
  last_follow_up?: string | null;
  next_action?: string | null;
  probability?: number;
  bd_owner_id?: string | null;
}

export function useBDProspects() {
  return useQuery({
    queryKey: ['bd_prospects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_prospects')
        .select(`
          *,
          bd_owner:employees!bd_prospects_bd_owner_id_fkey(id, name)
        `)
        .order('probability', { ascending: false });
      
      if (error) throw error;
      return data as BDProspect[];
    },
  });
}

export function useCreateBDProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prospect: BDProspectInsert) => {
      const { data, error } = await supabase
        .from('bd_prospects')
        .insert(prospect)
        .select()
        .single();
      
      if (error) throw error;
      return data as BDProspect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bd_prospects'] });
    },
  });
}

export function useUpdateBDProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BDProspect> & { id: string }) => {
      const { data, error } = await supabase
        .from('bd_prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BDProspect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bd_prospects'] });
    },
  });
}

export function useDeleteBDProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bd_prospects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bd_prospects'] });
    },
  });
}

// Calculate weighted pipeline value
export function usePipelineValue() {
  const { data: prospects } = useBDProspects();
  
  if (!prospects) return { data: null, isLoading: true };
  
  const pipelineByStage = prospects.reduce((acc, p) => {
    if (!acc[p.stage]) {
      acc[p.stage] = { count: 0, avgProbability: 0 };
    }
    acc[p.stage].count++;
    acc[p.stage].avgProbability += p.probability;
    return acc;
  }, {} as Record<string, { count: number; avgProbability: number }>);
  
  Object.keys(pipelineByStage).forEach(stage => {
    pipelineByStage[stage].avgProbability = 
      pipelineByStage[stage].avgProbability / pipelineByStage[stage].count;
  });
  
  return { data: pipelineByStage, isLoading: false };
}
