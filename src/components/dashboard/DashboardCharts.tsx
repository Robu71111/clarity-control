import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { useJobs } from '@/hooks/useJobs';
import { useInvoices, usePayments } from '@/hooks/useFinance';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = [
  'hsl(199, 89%, 48%)', // accent
  'hsl(152, 76%, 36%)', // success
  'hsl(38, 92%, 50%)',  // warning
  'hsl(280, 65%, 60%)', // chart-4
  'hsl(0, 84%, 60%)',   // destructive
  'hsl(215, 16%, 47%)', // muted
];

export function DashboardCharts() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: invoices, isLoading: invLoading } = useInvoices();
  const { data: payments, isLoading: payLoading } = usePayments();

  const isLoading = jobsLoading || invLoading || payLoading;

  // Job Status Distribution (Pie)
  const jobStatusData = (() => {
    if (!jobs) return [];
    const counts: Record<string, number> = {};
    jobs.forEach((j) => { counts[j.status] = (counts[j.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // KPI Bar Chart (submissions, interviews, offers, starts aggregated)
  const kpiBarData = (() => {
    if (!jobs) return [];
    const totals = jobs.reduce(
      (acc, j) => ({
        Submissions: acc.Submissions + j.submissions,
        Interviews: acc.Interviews + j.interviews,
        Offers: acc.Offers + j.offers,
        Starts: acc.Starts + j.starts,
      }),
      { Submissions: 0, Interviews: 0, Offers: 0, Starts: 0 }
    );
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  })();

  // Revenue Area Chart (by month)
  const revenueData = (() => {
    if (!invoices || !payments) return [];
    const months: Record<string, { invoiced: number; received: number }> = {};
    invoices.forEach((i) => {
      const m = i.billing_month;
      if (!months[m]) months[m] = { invoiced: 0, received: 0 };
      months[m].invoiced += Number(i.amount);
    });
    payments.forEach((p) => {
      const m = p.date_received.slice(0, 7);
      if (!months[m]) months[m] = { invoiced: 0, received: 0 };
      months[m].received += Number(p.amount);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({ month, ...data }));
  })();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KPI Bar Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 text-sm">Pipeline Funnel</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={kpiBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Job Status Pie */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 text-sm">Job Status Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={jobStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {jobStatusData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 text-sm">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="invoiced" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="received" stroke="hsl(152, 76%, 36%)" fill="hsl(152, 76%, 36%)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
