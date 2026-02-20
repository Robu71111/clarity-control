import { useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { CustomFieldsDisplay } from '@/components/dashboard/CustomFieldsDisplay';
import { CommentsPanel } from '@/components/shared/CommentsPanel';
import { useBDProspects } from '@/hooks/useBDProspects';
import { useEmployeesByRole } from '@/hooks/useEmployees';
import { Target, TrendingUp, Users, Percent, MessageSquare } from 'lucide-react';
import { KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { Button } from '@/components/ui/button';

export function BusinessDevView() {
  const { data: prospects, isLoading } = useBDProspects();
  const { data: bdTeam } = useEmployeesByRole('Business Development');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<{ id: string; name: string } | null>(null);

  const bdProspects = prospects || [];

  const columns = [
    { header: 'Prospect', accessor: 'prospect_name' as any, className: 'font-medium' },
    { header: 'Contact', accessor: 'contact_name' as any },
    { header: 'Industry', accessor: 'industry' as any },
    { header: 'Stage', accessor: (item: any) => <StatusBadge status={item.stage} /> },
    { header: 'Last Follow-up', accessor: 'last_follow_up' as any },
    { header: 'Next Action', accessor: 'next_action' as any },
    { 
      header: 'Probability', 
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-16">
            <div className="h-full bg-accent rounded-full" style={{ width: `${item.probability}%` }} />
          </div>
          <span className="text-sm font-medium">{item.probability}%</span>
        </div>
      )
    },
    { header: 'BD Owner', accessor: (item: any) => item.bd_owner?.name || 'Unassigned' },
    {
      header: '',
      accessor: (item: any) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedProspect({ id: item.id, name: item.prospect_name }); setCommentsOpen(true); }}>
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const pipelineValue = bdProspects.reduce((sum, p) => sum + (p.probability * 5000), 0);
  const highProbability = bdProspects.filter(p => p.probability >= 60).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business Development</h1>
        <p className="text-muted-foreground">Pipeline tracking and lead management</p>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center"><Target className="h-6 w-6 text-accent" /></div>
            <div><p className="text-2xl font-bold">{bdProspects.length}</p><p className="text-sm text-muted-foreground">Active Leads</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-bold">{highProbability}</p><p className="text-sm text-muted-foreground">High Probability (60%+)</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center"><Users className="h-6 w-6 text-chart-4" /></div>
            <div><p className="text-2xl font-bold">{bdTeam?.length || 0}</p><p className="text-sm text-muted-foreground">BD Team Members</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"><Percent className="h-6 w-6 text-warning" /></div>
            <div><p className="text-2xl font-bold">${(pipelineValue / 1000).toFixed(0)}K</p><p className="text-sm text-muted-foreground">Weighted Pipeline</p></div>
          </div>
        </div>
      )}

      <CustomFieldsDisplay department="Business Development" />

      <div>
        <h3 className="font-semibold mb-4">Pipeline Tracker</h3>
        <DataTable columns={columns} data={bdProspects} keyField="id" />
      </div>

      {bdTeam && bdTeam.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bdTeam.map(bd => (
            <div key={bd.id} className="kpi-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="font-semibold text-accent">{bd.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div><p className="font-medium">{bd.name}</p><p className="text-xs text-muted-foreground">Business Development</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-muted/30 rounded"><p className="font-bold">{bdProspects.filter(p => p.bd_owner_id === bd.id).length}</p><p className="text-xs text-muted-foreground">Leads</p></div>
                <div className="text-center p-2 bg-muted/30 rounded"><p className="font-bold">{bdProspects.filter(p => p.bd_owner_id === bd.id && p.probability >= 60).length}</p><p className="text-xs text-muted-foreground">Hot Leads</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProspect && (
        <CommentsPanel open={commentsOpen} onOpenChange={setCommentsOpen} tableName="bd_prospects" recordId={selectedProspect.id} recordTitle={selectedProspect.name} />
      )}
    </div>
  );
}
