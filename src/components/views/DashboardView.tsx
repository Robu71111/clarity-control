import { KPICard } from '@/components/dashboard/KPICard';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { useOwnerKPIs, useQuickStats } from '@/hooks/useKPIs';
import { useJobs } from '@/hooks/useJobs';
import { useReceivablesAging } from '@/hooks/useFinance';
import { AlertCircle, Clock, CheckCircle2, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardView() {
  const { data: kpis, isLoading: kpisLoading } = useOwnerKPIs();
  const { data: stats, isLoading: statsLoading } = useQuickStats();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: agingData, isLoading: agingLoading } = useReceivablesAging();

  const highPriorityJobs = jobs?.filter(j => 
    j.priority === 'High' && j.status !== 'Filled' && j.status !== 'Closed - No Hire'
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
        <p className="text-muted-foreground">Weekly KPI snapshot • Live data</p>
      </div>

      {statsLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeClients || 0}</p>
              <p className="text-sm text-muted-foreground">Active Clients</p>
            </div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeJobs || 0}</p>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.filledJobs || 0}</p>
              <p className="text-sm text-muted-foreground">Filled This Month</p>
            </div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">${((stats?.overdueAmount || 0) / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Overdue (30+ days)</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        {kpisLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="kpi-card">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis?.map((kpi, idx) => (
              <KPICard key={idx} label={kpi.label} thisWeek={kpi.thisWeek} lastWeek={kpi.lastWeek} format={kpi.format} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            High Priority Jobs ({highPriorityJobs.length})
          </h3>
          {jobsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {highPriorityJobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.client?.name || 'Unknown Client'}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
              {highPriorityJobs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No high priority jobs</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Receivables Aging Summary</h3>
          {agingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {agingData?.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.clientName}</p>
                    <p className="text-xs text-muted-foreground">Total: ${item.total.toLocaleString()}</p>
                  </div>
                  <div className="text-right flex flex-wrap gap-1 justify-end">
                    {item.days60plus > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        ${item.days60plus.toLocaleString()} (60+)
                      </span>
                    )}
                    {item.days31to60 > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                        ${item.days31to60.toLocaleString()} (31-60)
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!agingData || agingData.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No outstanding receivables</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
