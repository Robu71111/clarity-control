import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/PriorityBadge';
import { jobs } from '@/data/mockData';
import { Job } from '@/types/staffing';

export function JobsView() {
  const columns = [
    { header: 'Job ID', accessor: 'id' as keyof Job, className: 'font-mono text-xs' },
    { header: 'Client', accessor: 'clientName' as keyof Job },
    { header: 'Job Title', accessor: 'title' as keyof Job, className: 'font-medium' },
    { 
      header: 'Priority', 
      accessor: (item: Job) => <PriorityBadge priority={item.priority} />
    },
    { header: 'Open Date', accessor: 'openDate' as keyof Job },
    { 
      header: 'Recruiters', 
      accessor: (item: Job) => (
        <div className="flex flex-wrap gap-1">
          {item.recruitersAssigned.map((r, i) => (
            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
              {r.split(' ')[0]}
            </span>
          ))}
        </div>
      )
    },
    { header: 'Subs', accessor: 'submissions' as keyof Job, className: 'text-center' },
    { header: 'Int', accessor: 'interviews' as keyof Job, className: 'text-center' },
    { header: 'Offers', accessor: 'offers' as keyof Job, className: 'text-center' },
    { header: 'Starts', accessor: 'starts' as keyof Job, className: 'text-center' },
    { 
      header: 'Status', 
      accessor: (item: Job) => <StatusBadge status={item.status} />
    },
  ];

  const statusCounts = {
    open: jobs.filter(j => j.status === 'Open').length,
    interviewing: jobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Made').length,
    filled: jobs.filter(j => j.status === 'Filled').length,
    closed: jobs.filter(j => j.status === 'Closed - No Hire' || j.status === 'On Hold').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Tracker</h1>
        <p className="text-muted-foreground">Track all jobs from open to placement</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Open Jobs</p>
          <p className="text-2xl font-bold mt-1 text-accent">{statusCounts.open}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold mt-1 text-chart-4">{statusCounts.interviewing}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Filled</p>
          <p className="text-2xl font-bold mt-1 text-success">{statusCounts.filled}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Closed/Hold</p>
          <p className="text-2xl font-bold mt-1 text-muted-foreground">{statusCounts.closed}</p>
        </div>
      </div>

      {/* Jobs Table */}
      <DataTable columns={columns} data={jobs} keyField="id" />
    </div>
  );
}
