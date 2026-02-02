import { DataTable } from '@/components/dashboard/DataTable';
import { amActivities, employeeScores, clients, jobs } from '@/data/mockData';
import { AMActivity } from '@/types/staffing';

export function AccountManagersView() {
  const accountManagers = employeeScores.filter(e => e.role === 'Account Manager');

  // Calculate KPIs per AM
  const amKPIs = accountManagers.map(am => {
    const managedClients = clients.filter(c => c.accountManager === am.name);
    const clientJobs = jobs.filter(j => managedClients.some(c => c.id === j.clientId));
    
    return {
      ...am,
      activeClients: managedClients.filter(c => c.status === 'Active').length,
      totalClients: managedClients.length,
      newJobs: clientJobs.filter(j => new Date(j.openDate) >= new Date('2025-01-01')).length,
      jobsFilled: clientJobs.filter(j => j.status === 'Filled').length,
      followUps: amActivities.filter(a => a.amName === am.name).length,
      outstanding: managedClients.reduce((sum, c) => sum + c.outstanding, 0),
    };
  });

  const activityColumns = [
    { header: 'Date', accessor: 'date' as keyof AMActivity },
    { header: 'Account Manager', accessor: 'amName' as keyof AMActivity },
    { header: 'Client', accessor: 'clientName' as keyof AMActivity },
    { header: 'Action Taken', accessor: 'actionTaken' as keyof AMActivity },
    { header: 'Outcome', accessor: 'outcome' as keyof AMActivity },
    { header: 'Next Step', accessor: 'nextStep' as keyof AMActivity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Manager Performance</h1>
        <p className="text-muted-foreground">Client health, job flow, and payment follow-up tracking</p>
      </div>

      {/* AM KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {amKPIs.map(am => (
          <div key={am.id} className="kpi-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="font-semibold text-lg text-accent">{am.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <p className="font-semibold">{am.name}</p>
                <p className="text-sm text-muted-foreground">Account Manager</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-2 bg-muted/30 rounded text-center">
                <p className="font-bold text-lg">{am.activeClients}</p>
                <p className="text-xs text-muted-foreground">Active Clients</p>
              </div>
              <div className="p-2 bg-muted/30 rounded text-center">
                <p className="font-bold text-lg">{am.newJobs}</p>
                <p className="text-xs text-muted-foreground">New Jobs</p>
              </div>
              <div className="p-2 bg-muted/30 rounded text-center">
                <p className="font-bold text-lg">{am.jobsFilled}</p>
                <p className="text-xs text-muted-foreground">Jobs Filled</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium">${am.outstanding.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Follow-ups This Week</span>
                <span className="font-medium">{am.followUps}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Performance Score</span>
                <span className="font-medium">{am.finalScore}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AM KPI Target Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Team KPI Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b border-border">
                <th className="px-4 py-3 text-left">KPI</th>
                <th className="px-4 py-3 text-center">Target</th>
                <th className="px-4 py-3 text-center">Actual</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3">Active Clients Managed</td>
                <td className="px-4 py-3 text-center">20</td>
                <td className="px-4 py-3 text-center font-medium text-success">24</td>
                <td className="px-4 py-3 text-muted-foreground">Exceeding target</td>
              </tr>
              <tr>
                <td className="px-4 py-3">New Jobs Received</td>
                <td className="px-4 py-3 text-center">15</td>
                <td className="px-4 py-3 text-center font-medium text-success">18</td>
                <td className="px-4 py-3 text-muted-foreground">Strong pipeline</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Jobs Closed (Filled)</td>
                <td className="px-4 py-3 text-center">8</td>
                <td className="px-4 py-3 text-center font-medium">8</td>
                <td className="px-4 py-3 text-muted-foreground">On target</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Client Follow-ups Done</td>
                <td className="px-4 py-3 text-center">25</td>
                <td className="px-4 py-3 text-center font-medium text-warning">22</td>
                <td className="px-4 py-3 text-muted-foreground">Needs improvement</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Payment Follow-ups</td>
                <td className="px-4 py-3 text-center">10</td>
                <td className="px-4 py-3 text-center font-medium text-success">12</td>
                <td className="px-4 py-3 text-muted-foreground">Good collections focus</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Client Satisfaction (1-5)</td>
                <td className="px-4 py-3 text-center">4.0</td>
                <td className="px-4 py-3 text-center font-medium text-success">4.3</td>
                <td className="px-4 py-3 text-muted-foreground">Excellent feedback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Activity Report */}
      <div>
        <h3 className="font-semibold mb-4">Weekly Activity Report</h3>
        <DataTable columns={activityColumns} data={amActivities} keyField="id" />
      </div>
    </div>
  );
}
