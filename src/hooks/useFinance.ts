import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoice_no: string;
  client_id: string;
  billing_month: string;
  amount: number;
  sent_date: string | null;
  due_date: string | null;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: { id: string; name: string } | null;
}

export interface InvoiceInsert {
  invoice_no: string;
  client_id: string;
  billing_month: string;
  amount: number;
  sent_date?: string | null;
  due_date?: string | null;
  status?: InvoiceStatus;
}

export interface Payment {
  id: string;
  date_received: string;
  client_id: string;
  invoice_id: string | null;
  amount: number;
  payment_mode: string;
  notes: string | null;
  created_at: string;
  // Joined data
  client?: { id: string; name: string } | null;
  invoice?: { id: string; invoice_no: string } | null;
}

export interface PaymentInsert {
  client_id: string;
  invoice_id?: string | null;
  amount: number;
  date_received?: string;
  payment_mode?: string;
  notes?: string | null;
}

// Invoices
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(id, name)
        `)
        .order('sent_date', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoice: InvoiceInsert) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Payments
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          client:clients(id, name),
          invoice:invoices(id, invoice_no)
        `)
        .order('date_received', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Receivables Aging calculation
export function useReceivablesAging() {
  const { data: invoices } = useInvoices();
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, outstanding')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  if (!invoices || !clients) return { data: [], isLoading: true };
  
  const today = new Date();
  const agingData = clients.map(client => {
    const clientInvoices = invoices.filter(
      inv => inv.client_id === client.id && inv.status !== 'Paid'
    );
    
    let days0to15 = 0;
    let days16to30 = 0;
    let days31to60 = 0;
    let days60plus = 0;
    
    clientInvoices.forEach(inv => {
      if (!inv.due_date) return;
      
      const dueDate = new Date(inv.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue <= 0) {
        days0to15 += inv.amount;
      } else if (daysOverdue <= 15) {
        days0to15 += inv.amount;
      } else if (daysOverdue <= 30) {
        days16to30 += inv.amount;
      } else if (daysOverdue <= 60) {
        days31to60 += inv.amount;
      } else {
        days60plus += inv.amount;
      }
    });
    
    const total = days0to15 + days16to30 + days31to60 + days60plus;
    
    return {
      clientId: client.id,
      clientName: client.name,
      days0to15,
      days16to30,
      days31to60,
      days60plus,
      total,
    };
  }).filter(item => item.total > 0);
  
  return { data: agingData, isLoading: false };
}
