import { useState } from 'react';
import { KPIProgressCard } from '@/components/dashboard/KPIProgressCard';
import { RecruiterWeeklyTable } from '@/components/dashboard/RecruiterWeeklyTable';
import { EditableTarget } from '@/components/dashboard/EditableTarget';
import { DataTable } from '@/components/dashboard/DataTable';
import { TableSkeleton, KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { CustomFieldsDisplay } from '@/components/dashboard/CustomFieldsDisplay';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings2 } from 'lucide-react';
import { useRecruiterKPIs } from '@/hooks/useRecruiterKPIs';
import { useKPITargets, useUpdateKPITarget } from '@/hooks/useKPITargets';
import { useRecruiterActivities } from '@/hooks/useActivities';

interface ActivityRow {
  id: string;
  date: string;
  recruiterName: string;
  jobId: string;
  amSubmissions: number;
  ecSubmissions: number;
  interviews: number;
  hired: number;
}

const KPI_NAMES = [
  'Open Positions Worked On',
  'Job Coverage Ratio',
  'AM Submissions',
  'End Client Submissions',
  'Interviews',
  'Hired',
];

export function RecruitersView() {
  const [targetsOpen, setTargetsOpen] = useState(false);
  
  const { data: kpiData, isLoading: kpisLoading } = useRecruiterKPIs();
  const { data: targets = [], isLoading: targetsLoading } = useKPITargets('Recruiter');
  const { data: activities, isLoading: activitiesLoading } = useRecruiterActivities();
  const updateTarget = useUpdateKPITarget();

  const isLoading = kpisLoading || targetsLoading;

  const getTarget = (kpiName: string): { id: string; value: number } => {
    const target = targets.find(t => t.kpi_name === kpiName);
    return { id: target?.id || '', value: target?.target_value ?? 0 };
  };

  const handleTargetUpdate = async (id: string, value: number) => {
    await updateTarget.mutateAsync({ id, target_value: value });
  };

  const tableData: ActivityRow[] = activities?.map(a => ({
    id: a.id,
    date: a.activity_date,
    recruiterName: a.employee?.name || 'Unknown',
    jobId: a.job_id.slice(0, 8),
    amSubmissions: (a as unknown as { am_submissions: number }).am_submissions || 0,
    ecSubmissions: (a as unknown as { end_client_submissions: number }).end_client_submissions || 0,
    interviews: a.interviews_scheduled,
    hired: (a as unknown as { hired: number }).hired || 0,
  })) || [];

  const activityColumns = [
    { header: 'Date', accessor: 'date' as keyof ActivityRow },
    { header: 'Recruiter', accessor: 'recruiterName' as keyof ActivityRow },
    { header: 'Job ID', accessor: 'jobId' as keyof ActivityRow, className: 'font-mono text-xs' },
    { header: 'AM Subs', accessor: 'amSubmissions' as keyof ActivityRow, className: 'text-center' },
    { header: 'EC Subs', accessor: 'ecSubmissions' as keyof ActivityRow, className: 'text-center' },
    { header: 'Interviews', accessor: 'interviews' as keyof ActivityRow, className: 'text-center' },
    { header: 'Hired', accessor: 'hired' as keyof ActivityRow, className: 'text-center' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruiter Performance</h1>
          <p className="text-muted-foreground">Weekly KPI tracking and targets</p>
        </div>
        <Dialog open={targetsOpen} onOpenChange={setTargetsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Edit Targets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Weekly Targets</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {KPI_NAMES.map((name) => {
                  const target = getTarget(name);
                  const isPercent = name === 'Job Coverage Ratio';
                  return (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell className="text-right">
                        <EditableTarget
                          value={target.value}
                          format={isPercent ? 'percentage' : 'number'}
                          onSave={(value) => target.id && handleTargetUpdate(target.id, value)}
                          disabled={!target.id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPIProgressCard title="Open Positions" value={kpiData?.summary.totalOpenPositions || 0} target={getTarget('Open Positions Worked On').value} />
          <KPIProgressCard title="Job Coverage" value={kpiData?.summary.avgJobCoverageRatio || 0} target={getTarget('Job Coverage Ratio').value} format="percentage" />
          <KPIProgressCard title="AM Submissions" value={kpiData?.summary.totalAMSubmissions || 0} target={getTarget('AM Submissions').value} />
          <KPIProgressCard title="EC Submissions" value={kpiData?.summary.totalEndClientSubmissions || 0} target={getTarget('End Client Submissions').value} />
          <KPIProgressCard title="Interviews" value={kpiData?.summary.totalInterviews || 0} target={getTarget('Interviews').value} />
          <KPIProgressCard title="Hired" value={kpiData?.summary.totalHired || 0} target={getTarget('Hired').value} />
        </div>
      )}

      <CustomFieldsDisplay department="Recruiter" />

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Weekly Stats by Recruiter</h3>
        <RecruiterWeeklyTable recruiters={kpiData?.recruiters || []} targets={targets} isLoading={isLoading} />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Daily Activity Report</h3>
        {activitiesLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <DataTable columns={activityColumns} data={tableData} keyField="id" />
        )}
      </div>
    </div>
  );
}
