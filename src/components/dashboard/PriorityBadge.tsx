import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'High' | 'Medium' | 'Low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      priority === 'High' && 'bg-destructive/10 text-destructive',
      priority === 'Medium' && 'bg-warning/10 text-warning',
      priority === 'Low' && 'bg-muted text-muted-foreground'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        priority === 'High' && 'bg-destructive',
        priority === 'Medium' && 'bg-warning',
        priority === 'Low' && 'bg-muted-foreground'
      )} />
      {priority}
    </span>
  );
}
