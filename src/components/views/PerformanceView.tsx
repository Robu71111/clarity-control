import { employeeScores } from '@/data/mockData';
import { ScoreBar } from '@/components/dashboard/ScoreBar';
import { Award, TrendingUp, Users } from 'lucide-react';

export function PerformanceView() {
  const sortedEmployees = [...employeeScores].sort((a, b) => b.finalScore - a.finalScore);
  const topPerformers = sortedEmployees.filter(e => e.finalScore >= 4.5);
  const averageScore = (employeeScores.reduce((sum, e) => sum + e.finalScore, 0) / employeeScores.length).toFixed(2);

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
        <p className="text-muted-foreground">Appraisal and incentive tracking • Scale: 1 (Poor) to 5 (Excellent)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{employeeScores.length}</p>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
            <Award className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{topPerformers.length}</p>
            <p className="text-sm text-muted-foreground">Top Performers (4.5+)</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{averageScore}</p>
            <p className="text-sm text-muted-foreground">Team Average Score</p>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header border-b border-border">
              <th className="px-4 py-3 text-left">Employee Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-center">Productivity</th>
              <th className="px-4 py-3 text-center">Quality</th>
              <th className="px-4 py-3 text-center">Discipline</th>
              <th className="px-4 py-3 text-center">Ownership</th>
              <th className="px-4 py-3 text-left" style={{ width: '180px' }}>Final Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-accent">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium">{employee.name}</span>
                    {employee.finalScore >= 4.5 && (
                      <Award className="h-4 w-4 text-warning" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${roleColors[employee.role]}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${employee.productivity >= 4 ? 'text-success' : employee.productivity >= 3 ? 'text-foreground' : 'text-destructive'}`}>
                    {employee.productivity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${employee.quality >= 4 ? 'text-success' : employee.quality >= 3 ? 'text-foreground' : 'text-destructive'}`}>
                    {employee.quality}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${employee.discipline >= 4 ? 'text-success' : employee.discipline >= 3 ? 'text-foreground' : 'text-destructive'}`}>
                    {employee.discipline}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${employee.ownership >= 4 ? 'text-success' : employee.ownership >= 3 ? 'text-foreground' : 'text-destructive'}`}>
                    {employee.ownership}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ScoreBar score={employee.finalScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        {['Account Manager', 'Recruiter', 'Business Development', 'Operations Manager'].map(role => {
          const roleEmployees = employeeScores.filter(e => e.role === role);
          const roleAvg = roleEmployees.length > 0 
            ? (roleEmployees.reduce((sum, e) => sum + e.finalScore, 0) / roleEmployees.length).toFixed(2)
            : '0';
          
          return (
            <div key={role} className="kpi-card">
              <p className="text-sm font-medium text-muted-foreground">{role}</p>
              <div className="mt-2">
                <p className="text-2xl font-bold">{roleAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {roleEmployees.length} employee{roleEmployees.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="mt-3">
                <ScoreBar score={Number(roleAvg)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Cadence */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Review Cadence</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="font-semibold text-accent">Daily</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Recruiter activity reports</li>
              <li>• Job status updates</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="font-semibold text-warning">Weekly</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• AM performance review</li>
              <li>• BD pipeline review</li>
              <li>• Owner dashboard review</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="font-semibold text-success">Monthly</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Finance reconciliation</li>
              <li>• Employee scorecards</li>
              <li>• Incentive calculations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
