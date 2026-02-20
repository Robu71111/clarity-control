import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { CRUDDialog, FieldDefinition } from '@/components/shared/CRUDDialog';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { useBDProspects, useCreateBDProspect, useUpdateBDProspect, useDeleteBDProspect } from '@/hooks/useBDProspects';
import { useInvoices, useCreateInvoice, useUpdateInvoice } from '@/hooks/useFinance';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, RefreshCw, Database } from 'lucide-react';

type Module = 'clients' | 'jobs' | 'employees' | 'bd_prospects' | 'invoices';

interface ModuleConfig {
  label: string;
  fields: FieldDefinition[];
  columns: string[];
  data: any[];
  isLoading: boolean;
  onAdd: (v: Record<string, string>) => void;
  onEdit: (v: Record<string, string>) => void;
  onDelete: (id: string) => void;
  refetch: () => void;
}

function InlineAddForm({ fields, onSubmit, label }: { fields: FieldDefinition[]; onSubmit: (v: Record<string, string>) => void; label: string }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const required = fields.filter(f => f.required);
    for (const f of required) {
      if (!values[f.name]?.trim()) {
        toast({ title: `${f.label} is required`, variant: 'destructive' });
        return;
      }
    }
    onSubmit(values);
    setValues({});
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New {label} Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map(field => (
            <div key={field.name} className="space-y-1">
              <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
              {field.type === 'select' ? (
                <Select value={values[field.name] || ''} onValueChange={v => setValues(prev => ({ ...prev, [field.name]: v }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.name] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder || field.label}
                  className="h-8 text-xs"
                />
              )}
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={handleSubmit}>
          <Plus className="h-3 w-3 mr-1" /> Add Record
        </Button>
      </CardContent>
    </Card>
  );
}

export function DataManagement() {
  const [activeModule, setActiveModule] = useState<Module>('clients');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, string> | null>(null);

  const { data: clients, isLoading: cl, refetch: rc } = useClients();
  const cc = useCreateClient(); const uc = useUpdateClient(); const dc = useDeleteClient();

  const { data: jobs, isLoading: jl, refetch: rj } = useJobs();
  const cj = useCreateJob(); const uj = useUpdateJob(); const dj = useDeleteJob();

  const { data: employees, isLoading: el, refetch: re } = useEmployees();
  const ce = useCreateEmployee(); const ue = useUpdateEmployee(); const de2 = useDeleteEmployee();

  const { data: bdProspects, isLoading: bl, refetch: rb } = useBDProspects();
  const cb = useCreateBDProspect(); const ub = useUpdateBDProspect(); const db2 = useDeleteBDProspect();

  const { data: invoices, isLoading: il, refetch: ri } = useInvoices();
  const ci = useCreateInvoice(); const ui = useUpdateInvoice();

  const configs: Record<Module, ModuleConfig> = {
    clients: {
      label: 'Clients', data: clients || [], isLoading: cl,
      columns: ['name', 'billing_type', 'payment_terms', 'status', 'outstanding'],
      fields: [
        { name: 'name', label: 'Client Name', type: 'text', required: true },
        { name: 'billing_type', label: 'Billing Type', type: 'select', options: [{ label: 'Monthly', value: 'Monthly' }, { label: 'Hourly', value: 'Hourly' }, { label: 'Fixed', value: 'Fixed' }] },
        { name: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'Net 30' },
        { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Hold', value: 'Hold' }, { label: 'Inactive', value: 'Inactive' }] },
        { name: 'outstanding', label: 'Outstanding', type: 'number' },
      ],
      onAdd: (v) => cc.mutate({ name: v.name, billing_type: v.billing_type, payment_terms: v.payment_terms, status: v.status as any, outstanding: Number(v.outstanding) || 0 }, { onSuccess: () => toast({ title: 'Client created' }) }),
      onEdit: (v) => uc.mutate({ id: v.id, name: v.name, billing_type: v.billing_type, payment_terms: v.payment_terms, status: v.status as any, outstanding: Number(v.outstanding) || 0 }, { onSuccess: () => { setEditDialogOpen(false); toast({ title: 'Client updated' }); } }),
      onDelete: (id) => dc.mutate(id, { onSuccess: () => toast({ title: 'Client deleted' }) }),
      refetch: rc,
    },
    jobs: {
      label: 'Jobs', data: jobs || [], isLoading: jl,
      columns: ['title', 'priority', 'status', 'submissions', 'interviews'],
      fields: [
        { name: 'title', label: 'Job Title', type: 'text', required: true },
        { name: 'client_id', label: 'Client ID', type: 'text', required: true },
        { name: 'priority', label: 'Priority', type: 'select', options: [{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }] },
        { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'Open' }, { label: 'On Hold', value: 'On Hold' }, { label: 'Interviewing', value: 'Interviewing' }, { label: 'Offer Made', value: 'Offer Made' }, { label: 'Filled', value: 'Filled' }, { label: 'Closed - No Hire', value: 'Closed - No Hire' }] },
      ],
      onAdd: (v) => cj.mutate({ title: v.title, client_id: v.client_id, priority: v.priority as any, status: v.status as any }, { onSuccess: () => toast({ title: 'Job created' }) }),
      onEdit: (v) => uj.mutate({ id: v.id, title: v.title, priority: v.priority as any, status: v.status as any }, { onSuccess: () => { setEditDialogOpen(false); toast({ title: 'Job updated' }); } }),
      onDelete: (id) => dj.mutate(id, { onSuccess: () => toast({ title: 'Job deleted' }) }),
      refetch: rj,
    },
    employees: {
      label: 'Employees', data: employees || [], isLoading: el,
      columns: ['name', 'email', 'role', 'department', 'is_active'],
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'role', label: 'Role', type: 'select', required: true, options: [{ label: 'Account Manager', value: 'Account Manager' }, { label: 'Recruiter', value: 'Recruiter' }, { label: 'Business Development', value: 'Business Development' }, { label: 'Operations Manager', value: 'Operations Manager' }, { label: 'Owner', value: 'Owner' }] },
        { name: 'department', label: 'Department', type: 'text' },
      ],
      onAdd: (v) => ce.mutate({ name: v.name, email: v.email, role: v.role as any, department: v.department }, { onSuccess: () => toast({ title: 'Employee created' }) }),
      onEdit: (v) => ue.mutate({ id: v.id, name: v.name, email: v.email, role: v.role as any, department: v.department }, { onSuccess: () => { setEditDialogOpen(false); toast({ title: 'Employee updated' }); } }),
      onDelete: (id) => de2.mutate(id, { onSuccess: () => toast({ title: 'Employee deleted' }) }),
      refetch: re,
    },
    bd_prospects: {
      label: 'BD Prospects', data: bdProspects || [], isLoading: bl,
      columns: ['prospect_name', 'contact_name', 'industry', 'stage', 'probability'],
      fields: [
        { name: 'prospect_name', label: 'Prospect Name', type: 'text', required: true },
        { name: 'contact_name', label: 'Contact Name', type: 'text' },
        { name: 'contact_email', label: 'Contact Email', type: 'text' },
        { name: 'industry', label: 'Industry', type: 'text' },
        { name: 'stage', label: 'Stage', type: 'select', options: [{ label: 'Lead', value: 'Lead' }, { label: 'Contacted', value: 'Contacted' }, { label: 'Meeting Scheduled', value: 'Meeting Scheduled' }, { label: 'Proposal Sent', value: 'Proposal Sent' }, { label: 'Negotiation', value: 'Negotiation' }, { label: 'Closed Won', value: 'Closed Won' }, { label: 'Closed Lost', value: 'Closed Lost' }] },
        { name: 'probability', label: 'Probability (%)', type: 'number' },
      ],
      onAdd: (v) => cb.mutate({ prospect_name: v.prospect_name, contact_name: v.contact_name, contact_email: v.contact_email, industry: v.industry, stage: v.stage as any, probability: Number(v.probability) || 10 }, { onSuccess: () => toast({ title: 'Prospect created' }) }),
      onEdit: (v) => ub.mutate({ id: v.id, prospect_name: v.prospect_name, contact_name: v.contact_name, contact_email: v.contact_email, industry: v.industry, stage: v.stage as any, probability: Number(v.probability) || 10 }, { onSuccess: () => { setEditDialogOpen(false); toast({ title: 'Prospect updated' }); } }),
      onDelete: (id) => db2.mutate(id, { onSuccess: () => toast({ title: 'Prospect deleted' }) }),
      refetch: rb,
    },
    invoices: {
      label: 'Invoices', data: invoices || [], isLoading: il,
      columns: ['invoice_no', 'billing_month', 'amount', 'status'],
      fields: [
        { name: 'invoice_no', label: 'Invoice No', type: 'text', required: true },
        { name: 'client_id', label: 'Client ID', type: 'text', required: true },
        { name: 'billing_month', label: 'Billing Month', type: 'text', required: true, placeholder: '2026-02' },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Draft', value: 'Draft' }, { label: 'Sent', value: 'Sent' }, { label: 'Paid', value: 'Paid' }, { label: 'Overdue', value: 'Overdue' }] },
      ],
      onAdd: (v) => ci.mutate({ invoice_no: v.invoice_no, client_id: v.client_id, billing_month: v.billing_month, amount: Number(v.amount), status: v.status as any }, { onSuccess: () => toast({ title: 'Invoice created' }) }),
      onEdit: (v) => ui.mutate({ id: v.id, invoice_no: v.invoice_no, billing_month: v.billing_month, amount: Number(v.amount), status: v.status as any }, { onSuccess: () => { setEditDialogOpen(false); toast({ title: 'Invoice updated' }); } }),
      onDelete: () => {},
      refetch: ri,
    },
  };

  const config = configs[activeModule];

  const handleEdit = (record: any) => {
    const values: Record<string, string> = { id: record.id };
    config.fields.forEach(f => { values[f.name] = String(record[f.name] ?? ''); });
    setEditingRecord(values);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      config.onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Data Management</h2>
      </div>

      <Tabs value={activeModule} onValueChange={v => setActiveModule(v as Module)}>
        <TabsList className="flex flex-wrap h-auto">
          {Object.entries(configs).map(([key, c]) => (
            <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">{c.label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(configs).map(([key, c]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-4">
            <InlineAddForm fields={c.fields} onSubmit={c.onAdd} label={c.label} />

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Existing Records</CardTitle>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => c.refetch()}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {c.isLoading ? (
                  <div className="flex justify-center py-8"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {c.columns.map(col => (
                            <TableHead key={col} className="text-xs capitalize">{col.replace(/_/g, ' ')}</TableHead>
                          ))}
                          <TableHead className="text-right text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {c.data.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={c.columns.length + 1} className="text-center py-6 text-muted-foreground text-sm">No records found</TableCell>
                          </TableRow>
                        ) : (
                          c.data.map((record: any) => (
                            <TableRow key={record.id}>
                              {c.columns.map(col => (
                                <TableCell key={col} className="text-xs max-w-[180px] truncate">
                                  {typeof record[col] === 'boolean' ? (record[col] ? 'Yes' : 'No') : String(record[col] ?? '-')}
                                </TableCell>
                              ))}
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  {key !== 'invoices' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(record.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <CRUDDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title={`Edit ${config.label}`}
        fields={config.fields}
        initialValues={editingRecord || undefined}
        onSubmit={(values) => { if (editingRecord) config.onEdit({ ...values, id: editingRecord.id }); }}
      />
    </div>
  );
}
