import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  thisWeek: number;
  lastWeek: number;
  format?: 'number' | 'currency' | 'percent' | 'days';
}

export function KPICard({ label, thisWeek, lastWeek, format = 'number' }: KPICardProps) {
  const change = thisWeek - lastWeek;
  const percentChange = lastWeek !== 0 ? ((change / lastWeek) * 100).toFixed(1) : 0;
  
  // Determine if increase is good (most metrics) or bad (collection days, outstanding)
  const isNegativeMetric = label.includes('Outstanding') || label.includes('Collection Days');
  const isPositive = isNegativeMetric ? change < 0 : change > 0;
  const isNeutral = change === 0;

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${value}%`;
      case 'days':
        return `${value} days`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  return (
    <div className="kpi-card animate-fade-in">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          isNeutral && 'bg-muted text-muted-foreground',
          !isNeutral && isPositive && 'bg-success/10 text-success',
          !isNeutral && !isPositive && 'bg-destructive/10 text-destructive'
        )}>
          {isNeutral ? (
            <Minus className="h-3 w-3" />
          ) : isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(Number(percentChange))}%</span>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{formatValue(thisWeek)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          vs {formatValue(lastWeek)} last week
        </p>
      </div>
    </div>
  );
}
