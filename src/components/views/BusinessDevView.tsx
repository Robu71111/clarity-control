import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { bdProspects, employeeScores } from '@/data/mockData';
import { BDProspect } from '@/types/staffing';
import { Target, TrendingUp, Users, Percent } from 'lucide-react';

export function BusinessDevView() {
  const bdTeam = employeeScores.filter(e => e.role === 'Business Development');

  const columns = [
    { header: 'Prospect', accessor: 'prospect' as keyof BDProspect, className: 'font-medium' },
    { header: 'Contact', accessor: 'contact' as keyof BDProspect },
    { header: 'Industry', accessor: 'industry' as keyof BDProspect },
    { 
      header: 'Stage', 
      accessor: (item: BDProspect) => <StatusBadge status={item.stage} />
    },
    { header: 'Last Follow-up', accessor: 'lastFollowUp' as keyof BDProspect },
    { header: 'Next Action', accessor: 'nextAction' as keyof BDProspect },
    { 
      header: 'Probability', 
      accessor: (item: BDProspect) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-16">
            <div 
              className="h-full bg-accent rounded-full"
              style={{ width: `${item.probability}%` }}
            />
          </div>
          <span className="text-sm font-medium">{item.probability}%</span>
        </div>
      )
    },
    { header: 'BD Owner', accessor: 'bdOwner' as keyof BDProspect },
  ];

  const pipelineValue = bdProspects.reduce((sum, p) => sum + (p.probability * 5000), 0);
  const highProbability = bdProspects.filter(p => p.probability >= 60).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business Development</h1>
        <p className="text-muted-foreground">Pipeline tracking and lead management</p>
      </div>

      {/* BD Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{bdProspects.length}</p>
            <p className="text-sm text-muted-foreground">Active Leads</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{highProbability}</p>
            <p className="text-sm text-muted-foreground">High Probability (60%+)</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Meetings This Week</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
            <Percent className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(pipelineValue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
          </div>
        </div>
      </div>

      {/* BD KPI Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">BD Team KPIs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b border-border">
                <th className="px-4 py-3 text-left">KPI</th>
                <th className="px-4 py-3 text-center">Target</th>
                <th className="px-4 py-3 text-center">Actual</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3">New Leads Generated</td>
                <td className="px-4 py-3 text-center">10</td>
                <td className="px-4 py-3 text-center font-medium text-success">12</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Above Target</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Meetings Done</td>
                <td className="px-4 py-3 text-center">8</td>
                <td className="px-4 py-3 text-center font-medium text-success">9</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Above Target</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Clients Onboarded</td>
                <td className="px-4 py-3 text-center">2</td>
                <td className="px-4 py-3 text-center font-medium">2</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">On Target</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3">Conversion Rate (%)</td>
                <td className="px-4 py-3 text-center">20%</td>
                <td className="px-4 py-3 text-center font-medium text-warning">16.7%</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">Below Target</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Tracker */}
      <div>
        <h3 className="font-semibold mb-4">Pipeline Tracker</h3>
        <DataTable columns={columns} data={bdProspects} keyField="id" />
      </div>

      {/* BD Team Performance */}
      <div className="grid grid-cols-2 gap-4">
        {bdTeam.map(bd => (
          <div key={bd.id} className="kpi-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="font-semibold text-accent">{bd.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <p className="font-medium">{bd.name}</p>
                <p className="text-xs text-muted-foreground">Business Development</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="font-bold">{bdProspects.filter(p => p.bdOwner === bd.name).length}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="font-bold">{bdProspects.filter(p => p.bdOwner === bd.name && p.probability >= 60).length}</p>
                <p className="text-xs text-muted-foreground">Hot Leads</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="font-bold">{bd.finalScore}/5</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
