import { useEmployeeScores } from '@/hooks/useEmployeeScores';
import { ScoreBar } from '@/components/dashboard/ScoreBar';
import { KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { Award, TrendingUp, Users } from 'lucide-react';

export function PerformanceView() {
  const { data: scores, isLoading } = useEmployeeScores();
  const employeeScores = scores || [];

  const sortedEmployees = [...employeeScores].sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
  const topPerformers = sortedEmployees.filter(e => (e.final_score || 0) >= 4.5);
  const averageScore = employeeScores.length > 0 
    ? (employeeScores.reduce((sum, e) => sum + (e.final_score || 0), 0) / employeeScores.length).toFixed(2)
    : '0';

  const roleColors: Record<string, string> = {
    'Account Manager': 'bg-accent/10 text-accent',
    'Recruiter': 'bg-success/10 text-success',
    'Business Development': 'bg-warning/10 text-warning',
    'Operations Manager': 'bg-chart-4/10 text-chart-4',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employee Performance Scorecard</h1>
        <p className="text-muted-foreground">Scale: 1 (Poor) to 5 (Excellent)</p>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center"><Users className="h-6 w-6 text-accent" /></div>
            <div><p className="text-2xl font-bold">{employeeScores.length}</p><p className="text-sm text-muted-foreground">Total Employees</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center"><Award className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-bold">{topPerformers.length}</p><p className="text-sm text-muted-foreground">Top Performers (4.5+)</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-chart-4" /></div>
            <div><p className="text-2xl font-bold">{averageScore}</p><p className="text-sm text-muted-foreground">Team Average</p></div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b border-border">
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-center">Productivity</th>
                <th className="px-4 py-3 text-center">Quality</th>
                <th className="px-4 py-3 text-center">Discipline</th>
                <th className="px-4 py-3 text-center">Ownership</th>
                <th className="px-4 py-3 text-left" style={{ width: '180px' }}>Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-accent">{emp.employee?.name?.split(' ').map(n => n[0]).join('') || '?'}</span>
                      </div>
                      <span className="font-medium">{emp.employee?.name || 'Unknown'}</span>
                      {(emp.final_score || 0) >= 4.5 && <Award className="h-4 w-4 text-warning" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${roleColors[emp.employee?.role || ''] || 'bg-muted text-muted-foreground'}`}>
                      {emp.employee?.role || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${emp.productivity >= 4 ? 'text-success' : emp.productivity >= 3 ? 'text-foreground' : 'text-destructive'}`}>{emp.productivity}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${emp.quality >= 4 ? 'text-success' : emp.quality >= 3 ? 'text-foreground' : 'text-destructive'}`}>{emp.quality}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${emp.discipline >= 4 ? 'text-success' : emp.discipline >= 3 ? 'text-foreground' : 'text-destructive'}`}>{emp.discipline}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`font-medium ${emp.ownership >= 4 ? 'text-success' : emp.ownership >= 3 ? 'text-foreground' : 'text-destructive'}`}>{emp.ownership}</span></td>
                  <td className="px-4 py-3"><ScoreBar score={emp.final_score || 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Account Manager', 'Recruiter', 'Business Development', 'Operations Manager'].map(role => {
          const roleEmp = employeeScores.filter(e => e.employee?.role === role);
          const roleAvg = roleEmp.length > 0 ? (roleEmp.reduce((sum, e) => sum + (e.final_score || 0), 0) / roleEmp.length).toFixed(2) : '0';
          return (
            <div key={role} className="kpi-card">
              <p className="text-sm font-medium text-muted-foreground">{role}</p>
              <div className="mt-2">
                <p className="text-2xl font-bold">{roleAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">{roleEmp.length} employee{roleEmp.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="mt-3"><ScoreBar score={Number(roleAvg)} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
