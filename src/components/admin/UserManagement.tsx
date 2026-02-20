import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DepartmentAccessEditor } from './DepartmentAccessEditor';
import { Users, Shield, RefreshCw, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import type { AppRole } from '@/hooks/useUserRole';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: AppRole | null;
  department_access: string[];
  department_edit_access: string[];
  role_id: string | null;
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [accessDialogUser, setAccessDialogUser] = useState<UserWithRole | null>(null);

  // Fetch auth users via edge function
  const { data: authUsers } = useQuery({
    queryKey: ['admin-auth-users'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return [];

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) return [];
      return (await res.json()) as AuthUser[];
    },
  });

  // Fetch user roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;

      const authMap = new Map((authUsers || []).map(u => [u.id, u]));
      const roleMap = new Map(roles?.map(r => [r.user_id, r]) || []);
      const allUserIds = [...new Set([...roleMap.keys(), ...(authUsers || []).map(u => u.id)])];

      return allUserIds.map(userId => {
        const roleInfo = roleMap.get(userId);
        const authInfo = authMap.get(userId);
        return {
          id: userId,
          email: authInfo?.email || 'User ' + userId.slice(0, 8),
          created_at: roleInfo?.created_at || authInfo?.created_at || new Date().toISOString(),
          role: (roleInfo?.role as AppRole) || null,
          department_access: roleInfo?.department_access || [],
          department_edit_access: (roleInfo as any)?.department_edit_access || [],
          role_id: roleInfo?.id || null,
        } as UserWithRole;
      });
    },
    enabled: authUsers !== undefined,
  });

  // Make/Remove admin mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();
      const newRole = makeAdmin ? 'admin' : 'viewer';
      const allDepts = makeAdmin ? ['Dashboard', 'Recruiter', 'Account Manager', 'Account Manager View', 'Business Development', 'Operations Manager', 'Finance', 'Performance'] : [];

      if (existing) {
        const { error } = await supabase.from('user_roles').update({ role: newRole, department_access: allDepts, department_edit_access: allDepts } as any).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole, department_access: allDepts, department_edit_access: allDepts } as any);
        if (error) throw error;
      }

      await supabase.rpc('log_audit_event', { _action: makeAdmin ? 'made_admin' : 'removed_admin', _table_name: 'user_roles', _record_id: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role updated successfully' });
    },
    onError: (e: Error) => toast({ title: 'Failed to update role', description: e.message, variant: 'destructive' }),
  });

  // Save access mutation
  const saveAccessMutation = useMutation({
    mutationFn: async ({ userId, viewAccess, editAccess }: { userId: string; viewAccess: string[]; editAccess: string[] }) => {
      const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();

      if (existing) {
        const { error } = await supabase.from('user_roles').update({ department_access: viewAccess, department_edit_access: editAccess } as any).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'viewer', department_access: viewAccess, department_edit_access: editAccess } as any);
        if (error) throw error;
      }

      await supabase.rpc('log_audit_event', { _action: 'access_updated', _table_name: 'user_roles', _record_id: userId, _new_values: { department_access: viewAccess, department_edit_access: editAccess } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Access updated successfully' });
    },
    onError: (e: Error) => toast({ title: 'Failed to update access', description: e.message, variant: 'destructive' }),
  });

  const filtered = (users || []).filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatRole = (role: AppRole | null) => {
    if (!role) return 'No Role';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const MAX_BADGES = 3;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and department access</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-48" />
            </div>
            <Button variant="outline" size="icon" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-auth-users'] }); refetch(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{user.email}</div>
                        <div className="text-xs text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.department_access.length === 0 ? (
                          <span className="text-xs text-muted-foreground">None</span>
                        ) : (
                          <>
                            {user.department_access.slice(0, MAX_BADGES).map(dept => (
                              <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                            ))}
                            {user.department_access.length > MAX_BADGES && (
                              <Badge variant="outline" className="text-xs">+{user.department_access.length - MAX_BADGES} more</Badge>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {user.role === 'admin' ? (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleAdminMutation.mutate({ userId: user.id, makeAdmin: false })}>
                            <ShieldOff className="h-3 w-3 mr-1" /> Remove Admin
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleAdminMutation.mutate({ userId: user.id, makeAdmin: true })}>
                            <ShieldCheck className="h-3 w-3 mr-1" /> Make Admin
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAccessDialogUser(user)}>
                          Edit Access
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {accessDialogUser && (
        <DepartmentAccessEditor
          open={!!accessDialogUser}
          onOpenChange={(o) => { if (!o) setAccessDialogUser(null); }}
          userName={accessDialogUser.email}
          viewAccess={accessDialogUser.department_access}
          editAccess={accessDialogUser.department_edit_access}
          onSave={(viewAccess, editAccess) => {
            saveAccessMutation.mutate({ userId: accessDialogUser.id, viewAccess, editAccess });
            setAccessDialogUser(null);
          }}
        />
      )}
    </Card>
  );
}
