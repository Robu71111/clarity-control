import { DataTable } from '@/components/dashboard/DataTable';
import { CustomFieldsDisplay } from '@/components/dashboard/CustomFieldsDisplay';
import { KPICardsSkeleton, TableSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { useAMActivities } from '@/hooks/useActivities';
import { useEmployeesByRole } from '@/hooks/useEmployees';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';

export function AccountManagersView() {
  const { data: amEmployees, isLoading: employeesLoading } = useEmployeesByRole('Account Manager');
  const { data: clients } = useClients();
  const { data: jobs } = useJobs();
  const { data: activities, isLoading: activitiesLoading } = useAMActivities();

  const isLoading = employeesLoading;

  const amKPIs = (amEmployees || []).map(am => {
    const managedClients = clients?.filter(c => c.account_manager_id === am.id) || [];
    const clientIds = managedClients.map(c => c.id);
    const clientJobs = jobs?.filter(j => clientIds.includes(j.client_id)) || [];
    
    return {
      ...am,
      activeClients: managedClients.filter(c => c.status === 'Active').length,
      totalClients: managedClients.length,
      newJobs: clientJobs.filter(j => j.status === 'Open').length,
      jobsFilled: clientJobs.filter(j => j.status === 'Filled').length,
      followUps: activities?.filter(a => a.employee_id === am.id).length || 0,
      outstanding: managedClients.reduce((sum, c) => sum + Number(c.outstanding), 0),
    };
  });

  const activityColumns = [
    { header: 'Date', accessor: 'activity_date' as any },
    { header: 'Account Manager', accessor: (item: any) => item.employee?.name || 'Unknown' },
    { header: 'Client', accessor: (item: any) => item.client?.name || 'Unknown' },
    { header: 'Action Taken', accessor: 'action_taken' as any },
    { header: 'Outcome', accessor: (item: any) => item.outcome || '-' },
    { header: 'Next Step', accessor: (item: any) => item.next_step || '-' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Manager Performance</h1>
        <p className="text-muted-foreground">Client health, job flow, and payment follow-up tracking</p>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="text-xs text-muted-foreground">Open Jobs</p>
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
                  <span className="text-muted-foreground">Follow-ups</span>
                  <span className="font-medium">{am.followUps}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomFieldsDisplay department="Account Manager" />

      <div>
        <h3 className="font-semibold mb-4">Activity Report</h3>
        {activitiesLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <DataTable columns={activityColumns} data={activities || []} keyField="id" />
        )}
      </div>
    </div>
  );
}
