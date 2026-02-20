import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAllCustomCharts, useCreateCustomChart, useUpdateCustomChart, useDeleteCustomChart } from '@/hooks/useCustomCharts';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, BarChart3, LineChart, PieChart } from 'lucide-react';

const DATA_SOURCES = ['jobs', 'clients', 'invoices', 'payments', 'employees', 'bd_prospects', 'recruiter_activities'];
const CHART_TYPES = [
  { value: 'bar', label: 'Bar', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: LineChart },
  { value: 'pie', label: 'Pie', icon: PieChart },
  { value: 'area', label: 'Area', icon: BarChart3 },
];
const AGGREGATES = ['count', 'sum', 'avg'];

export function CustomChartsManager() {
  const { data: charts, isLoading } = useAllCustomCharts();
  const createChart = useCreateCustomChart();
  const updateChart = useUpdateCustomChart();
  const deleteChart = useDeleteCustomChart();

  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [dataSource, setDataSource] = useState('jobs');
  const [metricField, setMetricField] = useState('*');
  const [groupBy, setGroupBy] = useState('');
  const [aggregate, setAggregate] = useState('count');

  const handleCreate = () => {
    if (!title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    createChart.mutate(
      {
        title: title.trim(),
        chart_type: chartType,
        data_source: dataSource,
        metric_field: metricField || '*',
        group_by: groupBy || null,
        aggregate,
        is_active: true,
        display_order: (charts?.length || 0) + 1,
      },
      {
        onSuccess: () => {
          toast({ title: 'Chart created and pushed to dashboard' });
          setTitle(''); setMetricField('*'); setGroupBy('');
        },
      }
    );
  };

  const handleToggle = (id: string, isActive: boolean) => {
    updateChart.mutate({ id, is_active: !isActive });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this chart?')) {
      deleteChart.mutate(id, { onSuccess: () => toast({ title: 'Chart deleted' }) });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Custom Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Jobs by Status" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data Source</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Metric Field</Label>
              <Input value={metricField} onChange={(e) => setMetricField(e.target.value)} placeholder="* for count, or column name" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Group By (optional)</Label>
              <Input value={groupBy} onChange={(e) => setGroupBy(e.target.value)} placeholder="e.g. status, priority" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aggregate</Label>
              <Select value={aggregate} onValueChange={setAggregate}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGGREGATES.map((a) => (
                    <SelectItem key={a} value={a}>{a.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={createChart.isPending}>
            <Plus className="h-3 w-3 mr-1" /> Create & Push to Dashboard
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Existing Charts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : !charts || charts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No custom charts yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Group By</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.chart_type}</Badge></TableCell>
                    <TableCell className="text-xs">{c.data_source}</TableCell>
                    <TableCell className="text-xs">{c.group_by || '—'}</TableCell>
                    <TableCell>
                      <Switch checked={c.is_active} onCheckedChange={() => handleToggle(c.id, c.is_active)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
