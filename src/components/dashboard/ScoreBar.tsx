import { cn } from '@/lib/utils';

interface ScoreBarProps {
  score: number;
  maxScore?: number;
}

export function ScoreBar({ score, maxScore = 5 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  
  const getColor = () => {
    if (score >= 4) return 'bg-success';
    if (score >= 3) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-300', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}
