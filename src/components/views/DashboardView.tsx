import { KPICard } from '@/components/dashboard/KPICard';
import { ownerKPIs, jobs, clients, receivablesAging } from '@/data/mockData';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/PriorityBadge';
import { AlertCircle, Clock, CheckCircle2, Users } from 'lucide-react';

export function DashboardView() {
  const activeJobs = jobs.filter(j => j.status !== 'Filled' && j.status !== 'Closed - No Hire');
  const highPriorityJobs = activeJobs.filter(j => j.priority === 'High');
  const overdueReceivables = receivablesAging.reduce((sum, r) => sum + r.days60plus + r.days31to60, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
        <p className="text-muted-foreground">Weekly KPI snapshot • Last updated: Feb 2, 2025</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clients.filter(c => c.status === 'Active').length}</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'Filled').length}</p>
            <p className="text-sm text-muted-foreground">Filled This Month</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(overdueReceivables / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Overdue (30+ days)</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          {ownerKPIs.map((kpi, idx) => (
            <KPICard
              key={idx}
              label={kpi.label}
              thisWeek={kpi.thisWeek}
              lastWeek={kpi.lastWeek}
              format={kpi.format}
            />
          ))}
        </div>
      </div>

      {/* Priority Jobs & Receivables */}
      <div className="grid grid-cols-2 gap-6">
        {/* High Priority Jobs */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            High Priority Jobs ({highPriorityJobs.length})
          </h3>
          <div className="space-y-3">
            {highPriorityJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receivables Aging */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Receivables Aging Summary</h3>
          <div className="space-y-3">
            {receivablesAging.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Total: ${item.total.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {item.days60plus > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      ${item.days60plus.toLocaleString()} (60+)
                    </span>
                  )}
                  {item.days31to60 > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning ml-1">
                      ${item.days31to60.toLocaleString()} (31-60)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
