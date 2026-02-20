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

// Maps department_access values to which views they unlock
const DEPARTMENT_VIEW_MAP: Record<string, string[]> = {
  'Recruiter': ['recruiters'],
  'Account Manager': ['clients', 'jobs', 'account-managers'],
  'Business Development': ['business-dev'],
  'Operations Manager': ['operations', 'performance'],
  'Finance': ['finance'],
};

// Maps department_access values to which tables they can edit
const DEPARTMENT_EDIT_MAP: Record<string, string[]> = {
  'Recruiter': ['recruiter_activities'],
  'Account Manager': ['clients', 'jobs', 'job_recruiters', 'am_activities'],
  'Business Development': ['bd_prospects'],
  'Operations Manager': ['employee_scores'],
  'Finance': ['invoices', 'payments'],
};

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

    // Dashboard is always accessible
    if (viewId === 'dashboard') return true;
    // Admin view is only for admin role
    if (viewId === 'admin') return false;

    // Check if any of the user's department_access grants access to this view
    return departmentAccess.some(dept => {
      const allowedViews = DEPARTMENT_VIEW_MAP[dept] ?? [];
      return allowedViews.includes(viewId);
    });
  };

  const canEdit = (tableName: string): boolean => {
    if (isAdmin) return true;
    if (!role) return false;

    // Check if any of the user's department_access grants edit rights to this table
    return departmentAccess.some(dept => {
      const allowedTables = DEPARTMENT_EDIT_MAP[dept] ?? [];
      return allowedTables.includes(tableName);
    });
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
