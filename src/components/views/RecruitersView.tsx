import { DataTable } from '@/components/dashboard/DataTable';
import { recruiterActivities, employeeScores } from '@/data/mockData';
import { RecruiterActivity } from '@/types/staffing';
import { ScoreBar } from '@/components/dashboard/ScoreBar';

export function RecruitersView() {
  const recruiters = employeeScores.filter(e => e.role === 'Recruiter');

  // Calculate KPIs per recruiter
  const recruiterKPIs = recruiters.map(r => {
    const activities = recruiterActivities.filter(a => a.recruiterName === r.name);
    const totalSubmissions = activities.reduce((sum, a) => sum + a.submitted, 0);
    const totalInterviews = activities.reduce((sum, a) => sum + a.interviewsScheduled, 0);
    const interviewRatio = totalSubmissions > 0 ? ((totalInterviews / totalSubmissions) * 100).toFixed(1) : '0';
    
    return {
      ...r,
      submissions: totalSubmissions,
      interviews: totalInterviews,
      interviewRatio,
      resumesSourced: activities.reduce((sum, a) => sum + a.resumesSourced, 0),
    };
  });

  const activityColumns = [
    { header: 'Date', accessor: 'date' as keyof RecruiterActivity },
    { header: 'Recruiter', accessor: 'recruiterName' as keyof RecruiterActivity },
    { header: 'Job ID', accessor: 'jobId' as keyof RecruiterActivity, className: 'font-mono text-xs' },
    { header: 'Resumes Sourced', accessor: 'resumesSourced' as keyof RecruiterActivity, className: 'text-center' },
    { header: 'Submitted', accessor: 'submitted' as keyof RecruiterActivity, className: 'text-center' },
    { header: 'Feedback Received', accessor: 'feedbackReceived' as keyof RecruiterActivity, className: 'text-center' },
    { header: 'Interviews', accessor: 'interviewsScheduled' as keyof RecruiterActivity, className: 'text-center' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recruiter Performance</h1>
        <p className="text-muted-foreground">Daily activity tracking and KPI summary</p>
      </div>

      {/* Recruiter KPI Cards */}
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
      </div>

      {/* Weekly KPI Target Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Weekly KPI vs Target</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-sm text-muted-foreground">Submissions</p>
            <p className="text-xs text-success">Target: 150</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">21.8%</p>
            <p className="text-sm text-muted-foreground">Interview Ratio</p>
            <p className="text-xs text-success">Target: 20%</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">23.5%</p>
            <p className="text-sm text-muted-foreground">Offer Ratio</p>
            <p className="text-xs text-warning">Target: 25%</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-sm text-muted-foreground">Starts</p>
            <p className="text-xs text-success">Target: 6</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">2.1 days</p>
            <p className="text-sm text-muted-foreground">Avg Sub-to-Int</p>
            <p className="text-xs text-success">Target: 3 days</p>
          </div>
        </div>
      </div>

      {/* Daily Activity Report */}
      <div>
        <h3 className="font-semibold mb-4">Daily Activity Report</h3>
        <DataTable columns={activityColumns} data={recruiterActivities} keyField="id" />
      </div>
    </div>
  );
}
