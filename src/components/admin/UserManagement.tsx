import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { RoleSelect } from './RoleSelect';
import { DepartmentAccessEditor } from './DepartmentAccessEditor';
import { Users, Shield, RefreshCw } from 'lucide-react';
import type { AppRole } from '@/hooks/useUserRole';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: AppRole | null;
  department_access: string[];
  role_id: string | null;
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Fetch all users with their roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role info
      const roleMap = new Map(roles?.map(r => [r.user_id, r]) || []);

      // Get unique user IDs from roles
      const userIds = [...new Set(roles?.map(r => r.user_id) || [])];

      // Since we can't query auth.users directly, we'll work with what we have
      // Users without roles won't appear here - they need to be assigned a role first
      return userIds.map(userId => {
        const roleInfo = roleMap.get(userId);
        return {
          id: userId,
          email: 'User ' + userId.slice(0, 8), // Placeholder - in production, join with profiles table
          created_at: roleInfo?.created_at || new Date().toISOString(),
          role: roleInfo?.role as AppRole || null,
          department_access: roleInfo?.department_access || [],
          role_id: roleInfo?.id || null,
        };
      }) as UserWithRole[];
    },
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, departmentAccess }: { userId: string; role: AppRole; departmentAccess: string[] }) => {
      // Check if user already has a role entry
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role, department_access: departmentAccess })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role, department_access: departmentAccess });
        if (error) throw error;
      }

      // Log audit event
      await supabase.rpc('log_audit_event', {
        _action: 'role_updated',
        _table_name: 'user_roles',
        _record_id: userId,
        _new_values: { role, department_access: departmentAccess },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role updated successfully' });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete user role
  const deleteRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        _action: 'role_deleted',
        _table_name: 'user_roles',
        _record_id: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User role removed' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatRole = (role: AppRole | null) => {
    if (!role) return 'No Role';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getRoleBadgeVariant = (role: AppRole | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'account_manager': return 'secondary';
      case 'recruiter': return 'outline';
      case 'business_dev': return 'secondary';
      case 'finance': return 'outline';
      case 'operations': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>User Management</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Manage user roles and department access permissions. Users appear here after their first sign-in and role assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !users?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No users with roles yet.</p>
            <p className="text-sm">Users will appear here after signing up and being assigned a role.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department Access</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <RoleSelect
                        value={user.role}
                        onChange={(role) => {
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role,
                            departmentAccess: user.department_access,
                          });
                        }}
                      />
                    ) : (
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {formatRole(user.role)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser === user.id ? (
                      <DepartmentAccessEditor
                        value={user.department_access}
                        onChange={(departments) => {
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: user.role || 'viewer',
                            departmentAccess: departments,
                          });
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.department_access.length > 0 ? (
                          user.department_access.map((dept) => (
                            <Badge key={dept} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingUser === user.id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(null)}
                      >
                        Done
                      </Button>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Remove this user\'s role? They will lose all access.')) {
                              deleteRoleMutation.mutate(user.id);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
