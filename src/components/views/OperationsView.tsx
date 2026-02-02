import { jobs, recruiterActivities, employeeScores } from '@/data/mockData';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

export function OperationsView() {
  const opsManager = employeeScores.find(e => e.role === 'Operations Manager');
  
  // Calculate operational metrics
  const activeJobs = jobs.filter(j => j.status !== 'Filled' && j.status !== 'Closed - No Hire');
  const agingJobs = activeJobs.filter(j => {
    const daysSinceOpen = Math.floor((new Date().getTime() - new Date(j.openDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceOpen > 30;
  });

  const recruiterCount = employeeScores.filter(e => e.role === 'Recruiter').length;
  const activeRecruiters = new Set(recruiterActivities.map(a => a.recruiterId)).size;
  const utilizationRate = ((activeRecruiters / recruiterCount) * 100).toFixed(0);

  const operationalKPIs = [
    { 
      label: 'Daily Reports Updated', 
      value: 'Yes', 
      status: 'good',
      icon: CheckCircle2,
      description: 'All team reports submitted on time'
    },
    { 
      label: 'Job Tracker Accuracy', 
      value: '94%', 
      status: 'good',
      icon: CheckCircle2,
      description: 'Data validation passed'
    },
    { 
      label: 'Recruiter Utilization', 
      value: `${utilizationRate}%`, 
      status: Number(utilizationRate) >= 80 ? 'good' : 'warning',
      icon: Number(utilizationRate) >= 80 ? CheckCircle2 : AlertTriangle,
      description: `${activeRecruiters} of ${recruiterCount} recruiters active`
    },
    { 
      label: 'Aging Jobs (>30 days)', 
      value: agingJobs.length.toString(), 
      status: agingJobs.length <= 2 ? 'good' : agingJobs.length <= 5 ? 'warning' : 'critical',
      icon: agingJobs.length <= 2 ? CheckCircle2 : AlertTriangle,
      description: 'Jobs open for more than 30 days'
    },
    { 
      label: 'Compliance Issues', 
      value: '0', 
      status: 'good',
      icon: CheckCircle2,
      description: 'No pending compliance items'
    },
  ];

  const processChecklist = [
    { task: 'Morning team standup completed', done: true },
    { task: 'Job tracker reviewed and updated', done: true },
    { task: 'Client escalations addressed', done: true },
    { task: 'Recruiter productivity check', done: true },
    { task: 'Payment reminders sent', done: false },
    { task: 'Weekly report prepared', done: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operations Control</h1>
        <p className="text-muted-foreground">Process discipline and productivity monitoring</p>
      </div>

      {/* Ops Manager Card */}
      {opsManager && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="font-bold text-xl text-accent">
                {opsManager.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{opsManager.name}</h2>
              <p className="text-muted-foreground">Operations Manager</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">Performance Score: <strong>{opsManager.finalScore}/5</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {operationalKPIs.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${
                  kpi.status === 'good' ? 'text-success' : 
                  kpi.status === 'warning' ? 'text-warning' : 'text-destructive'
                }`} />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  kpi.status === 'good' ? 'bg-success/10 text-success' : 
                  kpi.status === 'warning' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                }`}>
                  {kpi.status === 'good' ? 'OK' : kpi.status === 'warning' ? 'Watch' : 'Alert'}
                </span>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{kpi.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </div>
          );
        })}
      </div>

      {/* Daily Checklist & Aging Jobs */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Process Checklist */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Daily Process Checklist
          </h3>
          <div className="space-y-3">
            {processChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {processChecklist.filter(p => p.done).length} of {processChecklist.length} tasks completed
            </p>
          </div>
        </div>

        {/* Aging Jobs Alert */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Aging Jobs ({agingJobs.length} jobs &gt; 30 days)
          </h3>
          {agingJobs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                <p>No aging jobs - all on track!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {agingJobs.map(job => {
                const daysOpen = Math.floor((new Date().getTime() - new Date(job.openDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={job.id} className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.clientName}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                        {daysOpen} days
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {job.submissions} subs • {job.interviews} interviews • Assigned: {job.recruitersAssigned.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Utilization */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Team Utilization Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-success">{utilizationRate}%</p>
            <p className="text-sm text-muted-foreground">Recruiter Utilization</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-muted-foreground">AM Coverage</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-success">94%</p>
            <p className="text-sm text-muted-foreground">Data Accuracy</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-success">96%</p>
            <p className="text-sm text-muted-foreground">On-time Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
