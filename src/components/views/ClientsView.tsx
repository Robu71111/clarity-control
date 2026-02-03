import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { TableSkeleton, KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { useClients } from '@/hooks/useClients';
import { Building2 } from 'lucide-react';

interface ClientRow {
  id: string;
  name: string;
  accountManager: string;
  billingType: string;
  paymentTerms: string;
  status: string;
  lastPaymentDate: string | null;
  outstanding: number;
}

export function ClientsView() {
  const { data: clients, isLoading } = useClients();

  // Transform data for table display
  const tableData: ClientRow[] = clients?.map(c => ({
    id: c.id,
    name: c.name,
    accountManager: c.account_manager?.name || 'Unassigned',
    billingType: c.billing_type,
    paymentTerms: c.payment_terms,
    status: c.status,
    lastPaymentDate: c.last_payment_date,
    outstanding: Number(c.outstanding),
  })) || [];

  const columns = [
    { 
      header: 'Client Name', 
      accessor: (item: ClientRow) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-accent" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    { header: 'Account Manager', accessor: 'accountManager' as keyof ClientRow },
    { header: 'Billing Type', accessor: 'billingType' as keyof ClientRow },
    { header: 'Payment Terms', accessor: 'paymentTerms' as keyof ClientRow },
    { 
      header: 'Status', 
      accessor: (item: ClientRow) => <StatusBadge status={item.status} />
    },
    { 
      header: 'Last Payment', 
      accessor: (item: ClientRow) => item.lastPaymentDate || 'N/A'
    },
    { 
      header: 'Outstanding', 
      accessor: (item: ClientRow) => (
        <span className={item.outstanding > 50000 ? 'text-destructive font-medium' : ''}>
          ${item.outstanding.toLocaleString()}
        </span>
      ),
      className: 'text-right'
    },
  ];

  const totalOutstanding = tableData.reduce((sum, c) => sum + c.outstanding, 0);
  const activeClients = tableData.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Client Master</h1>
        <p className="text-muted-foreground">Single source of truth for all client information</p>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold mt-1">{tableData.length}</p>
          </div>
          <div className="kpi-card">
            <p className="text-sm text-muted-foreground">Active Clients</p>
            <p className="text-2xl font-bold mt-1 text-success">{activeClients}</p>
          </div>
          <div className="kpi-card">
            <p className="text-sm text-muted-foreground">On Hold</p>
            <p className="text-2xl font-bold mt-1 text-warning">{tableData.filter(c => c.status === 'Hold').length}</p>
          </div>
          <div className="kpi-card">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold mt-1">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Client Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable columns={columns} data={tableData} keyField="id" />
      )}
    </div>
  );
}
