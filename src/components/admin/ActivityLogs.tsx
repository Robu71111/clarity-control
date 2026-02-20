import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollText, RefreshCw, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { computeDiff, summarizeDiff } from '@/lib/diffUtils';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  created_at: string;
}

export function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(50);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  // Fetch user emails from admin-users edge function
  const { data: userEmails } = useQuery({
    queryKey: ['admin_user_emails'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return {};
      const response = await supabase.functions.invoke('admin-users');
      const users = response.data?.users || [];
      const map: Record<string, string> = {};
      users.forEach((u: any) => { map[u.id] = u.email; });
      return map;
    },
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.includes(searchTerm) ||
      (userEmails?.[log.user_id || ''] || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  }) || [];

  const uniqueActions = [...new Set(logs?.map(l => l.action) || [])];

  const getActionBadge = (action: string) => {
    if (action.includes('delete') || action.includes('removed')) return 'destructive';
    if (action.includes('create') || action.includes('insert')) return 'default';
    if (action.includes('update') || action.includes('role')) return 'secondary';
    return 'outline';
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Track all user actions with before/after diffs</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, table, user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.slice(0, visibleCount).map(log => {
                      const isExpanded = expandedRows.has(log.id);
                      const diffs = computeDiff(log.old_values, log.new_values);
                      const summary = summarizeDiff(log.old_values, log.new_values);
                      const userEmail = userEmails?.[log.user_id || ''] || log.user_id?.slice(0, 8) || 'System';

                      return (
                        <Collapsible key={log.id} asChild open={isExpanded} onOpenChange={() => toggleRow(log.id)}>
                          <>
                            <CollapsibleTrigger asChild>
                              <TableRow className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="w-8">
                                  {diffs.length > 0 && (
                                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                  )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs">{userEmail}</TableCell>
                                <TableCell>
                                  <Badge variant={getActionBadge(log.action) as any}>{log.action}</Badge>
                                </TableCell>
                                <TableCell className="text-sm">{log.table_name || '-'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                                  {summary}
                                </TableCell>
                              </TableRow>
                            </CollapsibleTrigger>
                            {diffs.length > 0 && (
                              <CollapsibleContent asChild>
                                <TableRow>
                                  <TableCell colSpan={6} className="bg-muted/30 p-4">
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2">Field Changes</p>
                                      <div className="grid gap-1">
                                        {diffs.map((d, i) => (
                                          <div key={i} className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-border/50 last:border-0">
                                            <span className="font-medium">{d.field.replace(/_/g, ' ')}</span>
                                            <span className="text-destructive line-through">{d.oldValue}</span>
                                            <span className="text-success font-medium">{d.newValue}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </CollapsibleContent>
                            )}
                          </>
                        </Collapsible>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredLogs.length > visibleCount && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => setVisibleCount(prev => prev + 50)}>
                  Load More ({filteredLogs.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
