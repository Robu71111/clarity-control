import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { clients } from '@/data/mockData';
import { Client } from '@/types/staffing';
import { Building2 } from 'lucide-react';

export function ClientsView() {
  const columns = [
    { 
      header: 'Client Name', 
      accessor: (item: Client) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-accent" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    { header: 'Account Manager', accessor: 'accountManager' as keyof Client },
    { header: 'Billing Type', accessor: 'billingType' as keyof Client },
    { header: 'Payment Terms', accessor: 'paymentTerms' as keyof Client },
    { 
      header: 'Status', 
      accessor: (item: Client) => <StatusBadge status={item.status} />
    },
    { 
      header: 'Last Payment', 
      accessor: (item: Client) => item.lastPaymentDate || 'N/A'
    },
    { 
      header: 'Outstanding', 
      accessor: (item: Client) => (
        <span className={item.outstanding > 50000 ? 'text-destructive font-medium' : ''}>
          ${item.outstanding.toLocaleString()}
        </span>
      ),
      className: 'text-right'
    },
  ];

  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstanding, 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Client Master</h1>
        <p className="text-muted-foreground">Single source of truth for all client information</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold mt-1">{clients.length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Active Clients</p>
          <p className="text-2xl font-bold mt-1 text-success">{activeClients}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">On Hold</p>
          <p className="text-2xl font-bold mt-1 text-warning">{clients.filter(c => c.status === 'Hold').length}</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Total Outstanding</p>
          <p className="text-2xl font-bold mt-1">${totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Client Table */}
      <DataTable columns={columns} data={clients} keyField="id" />
    </div>
  );
}
