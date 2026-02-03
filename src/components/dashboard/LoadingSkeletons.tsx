import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="table-header border-b border-border">
            <th className="px-4 py-3"><Skeleton className="h-4 w-24" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-32" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KPICardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kpi-card flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <KPICardsSkeleton />
      <TableSkeleton />
    </div>
  );
}
