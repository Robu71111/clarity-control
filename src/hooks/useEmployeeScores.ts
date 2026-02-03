import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeScore {
  id: string;
  employee_id: string;
  score_month: string;
  productivity: number;
  quality: number;
  discipline: number;
  ownership: number;
  final_score: number;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: { id: string; name: string; role: string } | null;
}

export interface EmployeeScoreInsert {
  employee_id: string;
  score_month: string;
  productivity?: number;
  quality?: number;
  discipline?: number;
  ownership?: number;
}

export function useEmployeeScores(month?: string) {
  return useQuery({
    queryKey: ['employee_scores', month],
    queryFn: async () => {
      let query = supabase
        .from('employee_scores')
        .select(`
          *,
          employee:employees(id, name, role)
        `)
        .order('final_score', { ascending: false });
      
      if (month) {
        query = query.eq('score_month', month);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EmployeeScore[];
    },
  });
}

export function useCreateEmployeeScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (score: EmployeeScoreInsert) => {
      const { data, error } = await supabase
        .from('employee_scores')
        .insert(score)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmployeeScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_scores'] });
    },
  });
}

export function useUpdateEmployeeScore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeScore> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_scores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmployeeScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_scores'] });
    },
  });
}

// Get scores with employee role for performance view
export function useScoresByRole() {
  const { data: scores, isLoading } = useEmployeeScores();
  
  if (!scores) return { data: null, isLoading };
  
  const byRole = scores.reduce((acc, score) => {
    const role = score.employee?.role || 'Unknown';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(score);
    return acc;
  }, {} as Record<string, EmployeeScore[]>);
  
  return { data: byRole, isLoading: false };
}
