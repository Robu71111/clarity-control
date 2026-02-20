import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomCharts, CustomChart } from '@/hooks/useCustomCharts';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(199, 89%, 48%)', 'hsl(152, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 84%, 60%)'];

const VALID_SOURCES = ['jobs', 'clients', 'invoices', 'payments', 'employees', 'bd_prospects', 'recruiter_activities'] as const;
type ValidSource = typeof VALID_SOURCES[number];

function isValidSource(s: string): s is ValidSource {
  return (VALID_SOURCES as readonly string[]).includes(s);
}

function SingleChart({ chart }: { chart: CustomChart }) {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['chart_data', chart.id, chart.data_source],
    queryFn: async () => {
      if (!isValidSource(chart.data_source)) return [];
      const { data, error } = await supabase.from(chart.data_source).select('*').limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) return <Skeleton className="h-[200px] rounded-xl" />;

  // Aggregate data
  const aggregated = (() => {
    if (!rawData || rawData.length === 0) return [];

    if (chart.group_by) {
      const groups: Record<string, number[]> = {};
      rawData.forEach((row: any) => {
        const key = String(row[chart.group_by!] ?? 'Unknown');
        if (!groups[key]) groups[key] = [];
        const val = chart.metric_field === '*' ? 1 : Number(row[chart.metric_field]) || 0;
        groups[key].push(val);
      });

      return Object.entries(groups).map(([name, vals]) => {
        let value = 0;
        if (chart.aggregate === 'count') value = vals.length;
        else if (chart.aggregate === 'sum') value = vals.reduce((a, b) => a + b, 0);
        else if (chart.aggregate === 'avg') value = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { name, value: Math.round(value * 100) / 100 };
      });
    }

    // No group_by: single aggregate
    const vals = rawData.map((r: any) => chart.metric_field === '*' ? 1 : Number(r[chart.metric_field]) || 0);
    let value = 0;
    if (chart.aggregate === 'count') value = vals.length;
    else if (chart.aggregate === 'sum') value = vals.reduce((a: number, b: number) => a + b, 0);
    else if (chart.aggregate === 'avg') value = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    return [{ name: chart.metric_field, value: Math.round(value * 100) / 100 }];
  })();

  if (aggregated.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-2 text-sm">{chart.title}</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chart.chart_type) {
      case 'pie':
        return (
          <PieChart>
            <Pie data={aggregated} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {aggregated.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={aggregated}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(199, 89%, 48%)" strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={aggregated}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.2} />
          </AreaChart>
        );
      default: // bar
        return (
          <BarChart data={aggregated}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-4 text-sm">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

export function CustomChartRenderer() {
  const { data: charts, isLoading } = useCustomCharts();

  if (isLoading) return null;
  if (!charts || charts.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Custom Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <SingleChart key={chart.id} chart={chart} />
        ))}
      </div>
    </div>
  );
}
