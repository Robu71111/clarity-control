import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { TableSkeleton, KPICardsSkeleton } from '@/components/dashboard/LoadingSkeletons';
import { useInvoices, usePayments, useReceivablesAging } from '@/hooks/useFinance';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  clientName: string;
  month: string;
  amount: number;
  sentDate: string | null;
  dueDate: string | null;
  status: string;
}

interface PaymentRow {
  id: string;
  dateReceived: string;
  clientName: string;
  amount: number;
  mode: string;
  againstInvoice: string;
}

export function FinanceView() {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: agingData, isLoading: agingLoading } = useReceivablesAging();

  const isLoading = invoicesLoading || paymentsLoading || agingLoading;

  const invoiceData: InvoiceRow[] = invoices?.map(i => ({
    id: i.id, invoiceNo: i.invoice_no, clientName: i.client?.name || 'Unknown',
    month: i.billing_month, amount: Number(i.amount), sentDate: i.sent_date, dueDate: i.due_date, status: i.status,
  })) || [];

  const paymentData: PaymentRow[] = payments?.map(p => ({
    id: p.id, dateReceived: p.date_received, clientName: p.client?.name || 'Unknown',
    amount: Number(p.amount), mode: p.payment_mode, againstInvoice: p.invoice?.invoice_no || 'N/A',
  })) || [];

  const totalInvoiced = invoiceData.reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoiceData.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalReceived = paymentData.reduce((sum, p) => sum + p.amount, 0);
  const totalAgingReceivables = agingData?.reduce((sum, r) => sum + r.total, 0) || 0;

  const invoiceColumns = [
    { header: 'Invoice No', accessor: 'invoiceNo' as keyof InvoiceRow, className: 'font-mono text-xs' },
    { header: 'Client', accessor: 'clientName' as keyof InvoiceRow },
    { header: 'Month', accessor: 'month' as keyof InvoiceRow },
    { header: 'Amount', accessor: (item: InvoiceRow) => `$${item.amount.toLocaleString()}`, className: 'text-right font-medium' },
    { header: 'Sent Date', accessor: (item: InvoiceRow) => item.sentDate || 'N/A' },
    { header: 'Due Date', accessor: (item: InvoiceRow) => item.dueDate || 'N/A' },
    { header: 'Status', accessor: (item: InvoiceRow) => <StatusBadge status={item.status} /> },
  ];

  const paymentColumns = [
    { header: 'Date Received', accessor: 'dateReceived' as keyof PaymentRow },
    { header: 'Client', accessor: 'clientName' as keyof PaymentRow },
    { header: 'Amount', accessor: (item: PaymentRow) => `$${item.amount.toLocaleString()}`, className: 'text-right font-medium text-success' },
    { header: 'Mode', accessor: 'mode' as keyof PaymentRow },
    { header: 'Against Invoice', accessor: 'againstInvoice' as keyof PaymentRow, className: 'font-mono text-xs' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance & Receivables</h1>
        <p className="text-muted-foreground">Revenue tracking, invoicing, and collections</p>
      </div>

      {isLoading ? (
        <KPICardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center"><DollarSign className="h-6 w-6 text-accent" /></div>
            <div><p className="text-2xl font-bold">${(totalInvoiced / 1000).toFixed(0)}K</p><p className="text-sm text-muted-foreground">Total Invoiced</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-bold">${(totalReceived / 1000).toFixed(0)}K</p><p className="text-sm text-muted-foreground">Received</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-warning" /></div>
            <div><p className="text-2xl font-bold">${(totalAgingReceivables / 1000).toFixed(0)}K</p><p className="text-sm text-muted-foreground">Outstanding</p></div>
          </div>
          <div className="kpi-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-destructive" /></div>
            <div><p className="text-2xl font-bold">${(totalOverdue / 1000).toFixed(0)}K</p><p className="text-sm text-muted-foreground">Overdue</p></div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Receivables Aging Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b border-border">
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-right">0-15 Days</th>
                <th className="px-4 py-3 text-right">16-30 Days</th>
                <th className="px-4 py-3 text-right">31-60 Days</th>
                <th className="px-4 py-3 text-right">60+ Days</th>
                <th className="px-4 py-3 text-right">Total Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agingData?.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.clientName}</td>
                  <td className="px-4 py-3 text-right">{item.days0to15 > 0 ? `$${item.days0to15.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3 text-right">{item.days16to30 > 0 ? <span className="text-warning">${item.days16to30.toLocaleString()}</span> : '-'}</td>
                  <td className="px-4 py-3 text-right">{item.days31to60 > 0 ? <span className="text-warning font-medium">${item.days31to60.toLocaleString()}</span> : '-'}</td>
                  <td className="px-4 py-3 text-right">{item.days60plus > 0 ? <span className="text-destructive font-medium">${item.days60plus.toLocaleString()}</span> : '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">${item.total.toLocaleString()}</td>
                </tr>
              ))}
              {(!agingData || agingData.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No outstanding receivables</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Invoice Tracker</h3>
          {invoicesLoading ? <TableSkeleton rows={5} /> : <DataTable columns={invoiceColumns} data={invoiceData} keyField="id" />}
        </div>
        <div>
          <h3 className="font-semibold mb-4">Payment Receipt Log</h3>
          {paymentsLoading ? <TableSkeleton rows={5} /> : <DataTable columns={paymentColumns} data={paymentData} keyField="id" />}
        </div>
      </div>
    </div>
  );
}
