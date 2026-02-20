import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CRUDDialog, FieldDefinition } from '@/components/shared/CRUDDialog';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { useBDProspects, useCreateBDProspect, useUpdateBDProspect, useDeleteBDProspect } from '@/hooks/useBDProspects';
import { useInvoices, useCreateInvoice, useUpdateInvoice } from '@/hooks/useFinance';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Database, RefreshCw } from 'lucide-react';

type Module = 'clients' | 'jobs' | 'employees' | 'bd_prospects' | 'invoices';

const MODULES: { value: Module; label: string }[] = [
  { value: 'clients', label: 'Clients' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'employees', label: 'Employees' },
  { value: 'bd_prospects', label: 'BD Prospects' },
  { value: 'invoices', label: 'Invoices' },
];

export function DataManagement() {
  const [activeModule, setActiveModule] = useState<Module>('clients');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, string> | null>(null);

  // All hooks
  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const { data: employees, isLoading: employeesLoading, refetch: refetchEmployees } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const { data: bdProspects, isLoading: bdLoading, refetch: refetchBD } = useBDProspects();
  const createBD = useCreateBDProspect();
  const updateBD = useUpdateBDProspect();
  const deleteBD = useDeleteBDProspect();

  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const getModuleConfig = (): { 
    data: any[]; isLoading: boolean; columns: string[]; fields: FieldDefinition[];
    onAdd: (v: Record<string, string>) => void; onEdit: (v: Record<string, string>) => void;
    onDelete: (id: string) => void; refetch: () => void;
  } => {
    switch (activeModule) {
      case 'clients':
        return {
          data: clients || [],
          isLoading: clientsLoading,
          columns: ['name', 'billing_type', 'payment_terms', 'status', 'outstanding'],
          fields: [
            { name: 'name', label: 'Client Name', type: 'text', required: true },
            { name: 'billing_type', label: 'Billing Type', type: 'select', options: [
              { label: 'Monthly', value: 'Monthly' }, { label: 'Hourly', value: 'Hourly' }, { label: 'Fixed', value: 'Fixed' },
            ]},
            { name: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'Net 30' },
            { name: 'status', label: 'Status', type: 'select', options: [
              { label: 'Active', value: 'Active' }, { label: 'Hold', value: 'Hold' }, { label: 'Inactive', value: 'Inactive' },
            ]},
            { name: 'outstanding', label: 'Outstanding', type: 'number' },
          ],
          onAdd: (v) => createClient.mutate({ name: v.name, billing_type: v.billing_type, payment_terms: v.payment_terms, status: v.status as any, outstanding: Number(v.outstanding) || 0 }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Client created' }); } }),
          onEdit: (v) => updateClient.mutate({ id: v.id, name: v.name, billing_type: v.billing_type, payment_terms: v.payment_terms, status: v.status as any, outstanding: Number(v.outstanding) || 0 }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Client updated' }); } }),
          onDelete: (id) => deleteClient.mutate(id, { onSuccess: () => toast({ title: 'Client deleted' }) }),
          refetch: refetchClients,
        };
      case 'jobs':
        return {
          data: jobs || [],
          isLoading: jobsLoading,
          columns: ['title', 'priority', 'status', 'submissions', 'interviews', 'offers', 'starts'],
          fields: [
            { name: 'title', label: 'Job Title', type: 'text', required: true },
            { name: 'client_id', label: 'Client ID', type: 'text', required: true },
            { name: 'priority', label: 'Priority', type: 'select', options: [
              { label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' },
            ]},
            { name: 'status', label: 'Status', type: 'select', options: [
              { label: 'Open', value: 'Open' }, { label: 'On Hold', value: 'On Hold' }, { label: 'Interviewing', value: 'Interviewing' }, 
              { label: 'Offer Made', value: 'Offer Made' }, { label: 'Filled', value: 'Filled' }, { label: 'Closed - No Hire', value: 'Closed - No Hire' },
            ]},
          ],
          onAdd: (v) => createJob.mutate({ title: v.title, client_id: v.client_id, priority: v.priority as any, status: v.status as any }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Job created' }); } }),
          onEdit: (v) => updateJob.mutate({ id: v.id, title: v.title, priority: v.priority as any, status: v.status as any }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Job updated' }); } }),
          onDelete: (id) => deleteJob.mutate(id, { onSuccess: () => toast({ title: 'Job deleted' }) }),
          refetch: refetchJobs,
        };
      case 'employees':
        return {
          data: employees || [],
          isLoading: employeesLoading,
          columns: ['name', 'email', 'role', 'department', 'is_active'],
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'text' },
            { name: 'role', label: 'Role', type: 'select', required: true, options: [
              { label: 'Account Manager', value: 'Account Manager' }, { label: 'Recruiter', value: 'Recruiter' },
              { label: 'Business Development', value: 'Business Development' }, { label: 'Operations Manager', value: 'Operations Manager' },
              { label: 'Owner', value: 'Owner' },
            ]},
            { name: 'department', label: 'Department', type: 'text' },
          ],
          onAdd: (v) => createEmployee.mutate({ name: v.name, email: v.email, role: v.role as any, department: v.department }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Employee created' }); } }),
          onEdit: (v) => updateEmployee.mutate({ id: v.id, name: v.name, email: v.email, role: v.role as any, department: v.department }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Employee updated' }); } }),
          onDelete: (id) => deleteEmployee.mutate(id, { onSuccess: () => toast({ title: 'Employee deleted' }) }),
          refetch: refetchEmployees,
        };
      case 'bd_prospects':
        return {
          data: bdProspects || [],
          isLoading: bdLoading,
          columns: ['prospect_name', 'contact_name', 'industry', 'stage', 'probability'],
          fields: [
            { name: 'prospect_name', label: 'Prospect Name', type: 'text', required: true },
            { name: 'contact_name', label: 'Contact Name', type: 'text' },
            { name: 'contact_email', label: 'Contact Email', type: 'text' },
            { name: 'industry', label: 'Industry', type: 'text' },
            { name: 'stage', label: 'Stage', type: 'select', options: [
              { label: 'Lead', value: 'Lead' }, { label: 'Contacted', value: 'Contacted' }, { label: 'Meeting Scheduled', value: 'Meeting Scheduled' },
              { label: 'Proposal Sent', value: 'Proposal Sent' }, { label: 'Negotiation', value: 'Negotiation' },
              { label: 'Closed Won', value: 'Closed Won' }, { label: 'Closed Lost', value: 'Closed Lost' },
            ]},
            { name: 'probability', label: 'Probability (%)', type: 'number' },
          ],
          onAdd: (v) => createBD.mutate({ prospect_name: v.prospect_name, contact_name: v.contact_name, contact_email: v.contact_email, industry: v.industry, stage: v.stage as any, probability: Number(v.probability) || 10 }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Prospect created' }); } }),
          onEdit: (v) => updateBD.mutate({ id: v.id, prospect_name: v.prospect_name, contact_name: v.contact_name, contact_email: v.contact_email, industry: v.industry, stage: v.stage as any, probability: Number(v.probability) || 10 }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Prospect updated' }); } }),
          onDelete: (id) => deleteBD.mutate(id, { onSuccess: () => toast({ title: 'Prospect deleted' }) }),
          refetch: refetchBD,
        };
      case 'invoices':
        return {
          data: invoices || [],
          isLoading: invoicesLoading,
          columns: ['invoice_no', 'billing_month', 'amount', 'status'],
          fields: [
            { name: 'invoice_no', label: 'Invoice No', type: 'text', required: true },
            { name: 'client_id', label: 'Client ID', type: 'text', required: true },
            { name: 'billing_month', label: 'Billing Month', type: 'text', required: true, placeholder: '2026-02' },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            { name: 'status', label: 'Status', type: 'select', options: [
              { label: 'Draft', value: 'Draft' }, { label: 'Sent', value: 'Sent' }, { label: 'Paid', value: 'Paid' }, { label: 'Overdue', value: 'Overdue' },
            ]},
          ],
          onAdd: (v) => createInvoice.mutate({ invoice_no: v.invoice_no, client_id: v.client_id, billing_month: v.billing_month, amount: Number(v.amount), status: v.status as any }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Invoice created' }); } }),
          onEdit: (v) => updateInvoice.mutate({ id: v.id, invoice_no: v.invoice_no, billing_month: v.billing_month, amount: Number(v.amount), status: v.status as any }, { onSuccess: () => { setDialogOpen(false); toast({ title: 'Invoice updated' }); } }),
          onDelete: () => {},
          refetch: refetchInvoices,
        };
      default:
        return { data: [], isLoading: false, columns: [], fields: [], onAdd: () => {}, onEdit: () => {}, onDelete: () => {}, refetch: () => {} };
    }
  };

  const config = getModuleConfig();

  const handleAdd = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record: any) => {
    const values: Record<string, string> = { id: record.id };
    config.fields.forEach(f => {
      values[f.name] = String(record[f.name] ?? '');
    });
    setEditingRecord(values);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      config.onDelete(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Add, edit, and delete records across all modules</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={activeModule} onValueChange={(v) => setActiveModule(v as Module)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => config.refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {config.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map(col => (
                    <TableHead key={col} className="capitalize">{col.replace(/_/g, ' ')}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={config.columns.length + 1} className="text-center py-8 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  config.data.map((record: any) => (
                    <TableRow key={record.id}>
                      {config.columns.map(col => (
                        <TableCell key={col} className="max-w-[200px] truncate">
                          {typeof record[col] === 'boolean' ? (record[col] ? 'Yes' : 'No') : String(record[col] ?? '-')}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {activeModule !== 'invoices' && (
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
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

      <CRUDDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingRecord ? `Edit ${MODULES.find(m => m.value === activeModule)?.label}` : `Add ${MODULES.find(m => m.value === activeModule)?.label}`}
        fields={config.fields}
        initialValues={editingRecord || undefined}
        onSubmit={(values) => editingRecord ? config.onEdit({ ...values, id: editingRecord.id }) : config.onAdd(values)}
      />
    </Card>
  );
}
