import { DataTable } from '@/components/dashboard/DataTable';
import { TableSkeleton, KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { useRecruiterActivities } from '@/hooks/useActivities';
import { useEmployeesByRole } from '@/hooks/useEmployees';
import { useEmployeeScores } from '@/hooks/useEmployeeScores';

interface ActivityRow {
  id: string;
  date: string;
  recruiterName: string;
  jobId: string;
  resumesSourced: number;
  submitted: number;
  feedbackReceived: number;
  interviewsScheduled: number;
}

export function RecruitersView() {
  const { data: activities, isLoading: activitiesLoading } = useRecruiterActivities();
  const { data: recruiters, isLoading: recruitersLoading } = useEmployeesByRole('Recruiter');
  const { data: scores, isLoading: scoresLoading } = useEmployeeScores();

  const isLoading = activitiesLoading || recruitersLoading || scoresLoading;

  // Calculate KPIs per recruiter
  const recruiterKPIs = recruiters?.map(r => {
    const recruiterActivities = activities?.filter(a => a.employee_id === r.id) || [];
    const recruiterScore = scores?.find(s => s.employee_id === r.id);
    
    const totalSubmissions = recruiterActivities.reduce((sum, a) => sum + a.submitted, 0);
    const totalInterviews = recruiterActivities.reduce((sum, a) => sum + a.interviews_scheduled, 0);
    const interviewRatio = totalSubmissions > 0 ? ((totalInterviews / totalSubmissions) * 100).toFixed(1) : '0';
    
    return {
      id: r.id,
      name: r.name,
      submissions: totalSubmissions,
      interviews: totalInterviews,
      interviewRatio,
      resumesSourced: recruiterActivities.reduce((sum, a) => sum + a.resumes_sourced, 0),
      finalScore: recruiterScore?.final_score || 0,
    };
  }) || [];

  // Transform activities for table
  const tableData: ActivityRow[] = activities?.map(a => ({
    id: a.id,
    date: a.activity_date,
    recruiterName: a.employee?.name || 'Unknown',
    jobId: a.job_id.slice(0, 8),
    resumesSourced: a.resumes_sourced,
    submitted: a.submitted,
    feedbackReceived: a.feedback_received,
    interviewsScheduled: a.interviews_scheduled,
  })) || [];

  const activityColumns = [
    { header: 'Date', accessor: 'date' as keyof ActivityRow },
    { header: 'Recruiter', accessor: 'recruiterName' as keyof ActivityRow },
    { header: 'Job ID', accessor: 'jobId' as keyof ActivityRow, className: 'font-mono text-xs' },
    { header: 'Resumes Sourced', accessor: 'resumesSourced' as keyof ActivityRow, className: 'text-center' },
    { header: 'Submitted', accessor: 'submitted' as keyof ActivityRow, className: 'text-center' },
    { header: 'Feedback Received', accessor: 'feedbackReceived' as keyof ActivityRow, className: 'text-center' },
    { header: 'Interviews', accessor: 'interviewsScheduled' as keyof ActivityRow, className: 'text-center' },
  ];

  // Calculate totals
  const totalSubmissions = activities?.reduce((sum, a) => sum + a.submitted, 0) || 0;
  const totalInterviews = activities?.reduce((sum, a) => sum + a.interviews_scheduled, 0) || 0;
  const overallInterviewRatio = totalSubmissions > 0 ? ((totalInterviews / totalSubmissions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recruiter Performance</h1>
        <p className="text-muted-foreground">Daily activity tracking and KPI summary</p>
      </div>

      {/* Recruiter KPI Cards */}
      {isLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {recruiterKPIs.map(r => (
            <div key={r.id} className="kpi-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="font-semibold text-accent">{r.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Recruiter</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Submissions</p>
                  <p className="font-semibold">{r.submissions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interviews</p>
                  <p className="font-semibold">{r.interviews}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Int. Ratio</p>
                  <p className="font-semibold">{r.interviewRatio}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p className="font-semibold">{r.finalScore}/5</p>
                </div>
              </div>
            </div>
          ))}
          {recruiterKPIs.length === 0 && !isLoading && (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No recruiters found. Add employees with the Recruiter role to get started.
            </div>
          )}
        </div>
      )}

      {/* Weekly KPI Target Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Weekly KPI Summary</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{totalSubmissions}</p>
            <p className="text-sm text-muted-foreground">Submissions</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{overallInterviewRatio}%</p>
            <p className="text-sm text-muted-foreground">Interview Ratio</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{totalInterviews}</p>
            <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{recruiters?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Active Recruiters</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{activities?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Activity Logs</p>
          </div>
        </div>
      </div>

      {/* Daily Activity Report */}
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
