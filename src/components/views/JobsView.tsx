import { useState } from 'react';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PriorityBadge } from '@/components/dashboard/PriorityBadge';
import { TableSkeleton, KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { CommentsPanel } from '@/components/shared/CommentsPanel';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface JobRow {
  id: string;
  clientName: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  openDate: string;
  recruiters: string[];
  submissions: number;
  interviews: number;
  offers: number;
  starts: number;
  status: string;
}

export function JobsView() {
  const { data: jobs, isLoading } = useJobs();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(null);

  const tableData: JobRow[] = jobs?.map(j => ({
    id: j.id,
    clientName: j.client?.name || 'Unknown',
    title: j.title,
    priority: j.priority,
    openDate: j.open_date,
    recruiters: j.recruiters?.map(r => r.employee?.name || 'Unknown') || [],
    submissions: j.submissions,
    interviews: j.interviews,
    offers: j.offers,
    starts: j.starts,
    status: j.status,
  })) || [];

  const columns = [
    { header: 'Job ID', accessor: (item: JobRow) => item.id.slice(0, 8), className: 'font-mono text-xs' },
    { header: 'Client', accessor: 'clientName' as keyof JobRow },
    { header: 'Job Title', accessor: 'title' as keyof JobRow, className: 'font-medium' },
    { header: 'Priority', accessor: (item: JobRow) => <PriorityBadge priority={item.priority} /> },
    { header: 'Open Date', accessor: 'openDate' as keyof JobRow },
    { 
      header: 'Recruiters', 
      accessor: (item: JobRow) => (
        <div className="flex flex-wrap gap-1">
          {item.recruiters.length > 0 ? item.recruiters.map((r, i) => (
            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{r.split(' ')[0]}</span>
          )) : <span className="text-xs text-muted-foreground">None</span>}
        </div>
      )
    },
    { header: 'Subs', accessor: 'submissions' as keyof JobRow, className: 'text-center' },
    { header: 'Int', accessor: 'interviews' as keyof JobRow, className: 'text-center' },
    { header: 'Offers', accessor: 'offers' as keyof JobRow, className: 'text-center' },
    { header: 'Starts', accessor: 'starts' as keyof JobRow, className: 'text-center' },
    { header: 'Status', accessor: (item: JobRow) => <StatusBadge status={item.status} /> },
    {
      header: '',
      accessor: (item: JobRow) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedJob({ id: item.id, title: item.title }); setCommentsOpen(true); }}>
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const statusCounts = {
    open: tableData.filter(j => j.status === 'Open').length,
    interviewing: tableData.filter(j => j.status === 'Interviewing' || j.status === 'Offer Made').length,
    filled: tableData.filter(j => j.status === 'Filled').length,
    closed: tableData.filter(j => j.status === 'Closed - No Hire' || j.status === 'On Hold').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Tracker</h1>
        <p className="text-muted-foreground">Track all jobs from open to placement</p>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card"><p className="text-sm text-muted-foreground">Open Jobs</p><p className="text-2xl font-bold mt-1 text-accent">{statusCounts.open}</p></div>
          <div className="kpi-card"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold mt-1 text-chart-4">{statusCounts.interviewing}</p></div>
          <div className="kpi-card"><p className="text-sm text-muted-foreground">Filled</p><p className="text-2xl font-bold mt-1 text-success">{statusCounts.filled}</p></div>
          <div className="kpi-card"><p className="text-sm text-muted-foreground">Closed/Hold</p><p className="text-2xl font-bold mt-1 text-muted-foreground">{statusCounts.closed}</p></div>
        </div>
      )}

      {isLoading ? <TableSkeleton rows={8} /> : <DataTable columns={columns} data={tableData} keyField="id" />}

      {selectedJob && (
        <CommentsPanel open={commentsOpen} onOpenChange={setCommentsOpen} tableName="jobs" recordId={selectedJob.id} recordTitle={selectedJob.title} />
      )}
    </div>
  );
}
