import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { invoices, payments, receivablesAging } from '@/data/mockData';
import { Invoice, Payment } from '@/types/staffing';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FinanceView() {
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  const invoiceColumns = [
    { header: 'Invoice No', accessor: 'invoiceNo' as keyof Invoice, className: 'font-mono text-xs' },
    { header: 'Client', accessor: 'clientName' as keyof Invoice },
    { header: 'Month', accessor: 'month' as keyof Invoice },
    { 
      header: 'Amount', 
      accessor: (item: Invoice) => `$${item.amount.toLocaleString()}`,
      className: 'text-right font-medium'
    },
    { header: 'Sent Date', accessor: 'sentDate' as keyof Invoice },
    { header: 'Due Date', accessor: 'dueDate' as keyof Invoice },
    { 
      header: 'Status', 
      accessor: (item: Invoice) => <StatusBadge status={item.status} />
    },
  ];

  const paymentColumns = [
    { header: 'Date Received', accessor: 'dateReceived' as keyof Payment },
    { header: 'Client', accessor: 'clientName' as keyof Payment },
    { 
      header: 'Amount', 
      accessor: (item: Payment) => `$${item.amount.toLocaleString()}`,
      className: 'text-right font-medium text-success'
    },
    { header: 'Mode', accessor: 'mode' as keyof Payment },
    { header: 'Against Invoice', accessor: 'againstInvoice' as keyof Payment, className: 'font-mono text-xs' },
  ];

  const totalAgingReceivables = receivablesAging.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance & Receivables</h1>
        <p className="text-muted-foreground">Revenue tracking, invoicing, and collections management</p>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(totalInvoiced / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(totalReceived / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Received This Month</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(totalAgingReceivables / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Outstanding</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">${(totalOverdue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
        </div>
      </div>

      {/* Receivables Aging Report */}
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
              {receivablesAging.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.clientName}</td>
                  <td className="px-4 py-3 text-right">
                    {item.days0to15 > 0 ? `$${item.days0to15.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.days16to30 > 0 ? (
                      <span className="text-warning">${item.days16to30.toLocaleString()}</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.days31to60 > 0 ? (
                      <span className="text-warning font-medium">${item.days31to60.toLocaleString()}</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.days60plus > 0 ? (
                      <span className="text-destructive font-medium">${item.days60plus.toLocaleString()}</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">${item.total.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">
                  ${receivablesAging.reduce((s, r) => s + r.days0to15, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-warning">
                  ${receivablesAging.reduce((s, r) => s + r.days16to30, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-warning">
                  ${receivablesAging.reduce((s, r) => s + r.days31to60, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-destructive">
                  ${receivablesAging.reduce((s, r) => s + r.days60plus, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  ${totalAgingReceivables.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice & Payment Tables */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Invoice Tracker</h3>
          <DataTable columns={invoiceColumns} data={invoices} keyField="id" />
        </div>

        <div>
          <h3 className="font-semibold mb-4">Payment Receipt Log</h3>
          <DataTable columns={paymentColumns} data={payments} keyField="id" />
        </div>
      </div>
    </div>
  );
}
