import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}

export function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="table-header border-b border-border">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn('px-4 py-3 text-left', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) => (
            <tr 
              key={String(item[keyField])} 
              className="hover:bg-muted/30 transition-colors"
            >
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  className={cn('px-4 py-3 text-sm', col.className)}
                >
                  {typeof col.accessor === 'function' 
                    ? col.accessor(item) 
                    : String(item[col.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="px-4 py-8 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
