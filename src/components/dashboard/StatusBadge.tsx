import { cn } from '@/lib/utils';
import { JobStatus, ClientStatus, InvoiceStatus, BDStage } from '@/types/staffing';

type Status = JobStatus | ClientStatus | InvoiceStatus | BDStage;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const getStatusStyle = (status: Status): string => {
  switch (status) {
    // Job Status
    case 'Open':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'On Hold':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Interviewing':
      return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    case 'Offer Made':
      return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
    case 'Filled':
      return 'bg-success/10 text-success border-success/20';
    case 'Closed - No Hire':
      return 'bg-muted text-muted-foreground border-border';
    
    // Client Status
    case 'Active':
      return 'bg-success/10 text-success border-success/20';
    case 'Hold':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Inactive':
      return 'bg-muted text-muted-foreground border-border';
    
    // Invoice Status
    case 'Draft':
      return 'bg-muted text-muted-foreground border-border';
    case 'Sent':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'Paid':
      return 'bg-success/10 text-success border-success/20';
    case 'Overdue':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    
    // BD Stage
    case 'Lead':
      return 'bg-muted text-muted-foreground border-border';
    case 'Contacted':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'Meeting Scheduled':
      return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    case 'Proposal Sent':
      return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
    case 'Negotiation':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'Closed Won':
      return 'bg-success/10 text-success border-success/20';
    case 'Closed Lost':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      getStatusStyle(status)
    )}>
      {status}
    </span>
  );
}
