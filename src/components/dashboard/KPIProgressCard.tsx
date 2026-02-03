import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface KPIProgressCardProps {
  title: string;
  value: number;
  target: number;
  format?: 'number' | 'percentage' | 'currency';
  className?: string;
}

export function KPIProgressCard({ title, value, target, format = 'number', className }: KPIProgressCardProps) {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={cn('kpi-card', className)}>
      <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
      <p className="text-2xl font-bold text-foreground">{formatValue(value)}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Target: {formatValue(target)}
      </p>
      <div className="mt-3 relative">
        <Progress value={percentage} className="h-2" />
        <div 
          className={cn('absolute inset-0 h-2 rounded-full transition-all', getProgressColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-right">
        {percentage.toFixed(0)}%
      </p>
    </div>
  );
}
