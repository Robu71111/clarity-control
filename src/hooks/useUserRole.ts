import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'account_manager' | 'recruiter' | 'business_dev' | 'operations' | 'finance' | 'viewer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  department_access: string[];
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserRole | null;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole?.role === 'admin';
  const role = userRole?.role ?? null;
  const departmentAccess = userRole?.department_access ?? [];

  const canAccessView = (viewId: string): boolean => {
    if (isAdmin) return true;
    if (!role) return false;

    const viewPermissions: Record<string, AppRole[]> = {
      'dashboard': ['admin', 'account_manager', 'recruiter', 'business_dev', 'operations', 'finance', 'viewer'],
      'clients': ['admin', 'account_manager', 'finance'],
      'jobs': ['admin', 'account_manager', 'recruiter'],
      'recruiters': ['admin', 'recruiter', 'operations'],
      'account-managers': ['admin', 'account_manager', 'operations'],
      'business-dev': ['admin', 'business_dev'],
      'operations': ['admin', 'operations'],
      'finance': ['admin', 'finance'],
      'performance': ['admin', 'operations'],
      'admin': ['admin'],
    };

    const allowedRoles = viewPermissions[viewId] ?? [];
    return allowedRoles.includes(role);
  };

  const canEdit = (tableName: string): boolean => {
    if (isAdmin) return true;
    if (!role) return false;

    const editPermissions: Record<string, AppRole[]> = {
      'employees': ['admin'],
      'clients': ['admin', 'account_manager'],
      'jobs': ['admin', 'account_manager'],
      'job_recruiters': ['admin', 'account_manager'],
      'recruiter_activities': ['admin', 'recruiter'],
      'am_activities': ['admin', 'account_manager'],
      'bd_prospects': ['admin', 'business_dev'],
      'invoices': ['admin', 'finance'],
      'payments': ['admin', 'finance'],
      'employee_scores': ['admin', 'operations'],
      'kpi_targets': ['admin'],
      'custom_kpi_fields': ['admin'],
      'custom_kpi_values': ['admin'],
      'user_roles': ['admin'],
    };

    const allowedRoles = editPermissions[tableName] ?? [];
    return allowedRoles.includes(role);
  };

  const canDelete = (tableName: string): boolean => {
    // Only admins can delete records
    return isAdmin;
  };

  return {
    userRole,
    role,
    isAdmin,
    departmentAccess,
    isLoading,
    error,
    canAccessView,
    canEdit,
    canDelete,
  };
}
