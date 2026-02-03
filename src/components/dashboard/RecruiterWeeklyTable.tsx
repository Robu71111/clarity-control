import { DataTable } from '@/components/dashboard/DataTable';
import { RecruiterKPI } from '@/hooks/useRecruiterKPIs';
import { KPITarget } from '@/hooks/useKPITargets';

interface RecruiterWeeklyTableProps {
  recruiters: RecruiterKPI[];
  targets: KPITarget[];
  isLoading?: boolean;
}

interface TableRow {
  id: string;
  name: string;
  openPositions: string;
  coverage: string;
  amSubs: string;
  ecSubs: string;
  interviews: string;
  hired: string;
}

export function RecruiterWeeklyTable({ recruiters, targets, isLoading }: RecruiterWeeklyTableProps) {
  const getTarget = (kpiName: string): number => {
    const target = targets.find(t => t.kpi_name === kpiName);
    return target?.target_value ?? 0;
  };

  const formatWithTarget = (value: number, kpiName: string, isPercent = false): string => {
    const target = getTarget(kpiName);
    const valueStr = isPercent ? `${value}%` : value.toString();
    return target > 0 ? `${valueStr} / ${isPercent ? `${target}%` : target}` : valueStr;
  };

  const tableData: TableRow[] = recruiters.map(r => ({
    id: r.recruiterId,
    name: r.recruiterName,
    openPositions: formatWithTarget(r.openPositions, 'Open Positions Worked On'),
    coverage: formatWithTarget(r.jobCoverageRatio, 'Job Coverage Ratio', true),
    amSubs: formatWithTarget(r.amSubmissions, 'AM Submissions'),
    ecSubs: formatWithTarget(r.endClientSubmissions, 'End Client Submissions'),
    interviews: formatWithTarget(r.interviews, 'Interviews'),
    hired: formatWithTarget(r.hired, 'Hired'),
  }));

  const columns = [
    { header: 'Recruiter', accessor: 'name' as keyof TableRow },
    { header: 'Open Pos', accessor: 'openPositions' as keyof TableRow, className: 'text-center' },
    { header: 'Coverage', accessor: 'coverage' as keyof TableRow, className: 'text-center' },
    { header: 'AM Subs', accessor: 'amSubs' as keyof TableRow, className: 'text-center' },
    { header: 'EC Subs', accessor: 'ecSubs' as keyof TableRow, className: 'text-center' },
    { header: 'Interviews', accessor: 'interviews' as keyof TableRow, className: 'text-center' },
    { header: 'Hired', accessor: 'hired' as keyof TableRow, className: 'text-center' },
  ];

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg" />;
  }

  if (recruiters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recruiters found. Add employees with the Recruiter role to get started.
      </div>
    );
  }

  return <DataTable columns={columns} data={tableData} keyField="id" />;
}
