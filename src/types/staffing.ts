export type JobStatus = 'Open' | 'On Hold' | 'Interviewing' | 'Offer Made' | 'Filled' | 'Closed - No Hire';
export type ClientStatus = 'Active' | 'Hold' | 'Inactive';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type BDStage = 'Lead' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Client {
  id: string;
  name: string;
  accountManager: string;
  billingType: string;
  paymentTerms: string;
  status: ClientStatus;
  lastPaymentDate: string | null;
  outstanding: number;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  openDate: string;
  recruitersAssigned: string[];
  submissions: number;
  interviews: number;
  offers: number;
  starts: number;
  status: JobStatus;
}

export interface RecruiterActivity {
  id: string;
  date: string;
  recruiterId: string;
  recruiterName: string;
  jobId: string;
  resumesSourced: number;
  submitted: number;
  feedbackReceived: number;
  interviewsScheduled: number;
}

export interface AMActivity {
  id: string;
  date: string;
  amId: string;
  amName: string;
  clientId: string;
  clientName: string;
  actionTaken: string;
  outcome: string;
  nextStep: string;
}

export interface BDProspect {
  id: string;
  prospect: string;
  contact: string;
  industry: string;
  stage: BDStage;
  lastFollowUp: string;
  nextAction: string;
  probability: number;
  bdOwner: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  month: string;
  amount: number;
  sentDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  dateReceived: string;
  clientId: string;
  clientName: string;
  amount: number;
  mode: string;
  againstInvoice: string;
}

export interface EmployeeScore {
  id: string;
  name: string;
  role: 'Account Manager' | 'Recruiter' | 'Business Development' | 'Operations Manager';
  productivity: number;
  quality: number;
  discipline: number;
  ownership: number;
  finalScore: number;
}

export interface KPIMetric {
  label: string;
  thisWeek: number;
  lastWeek: number;
  format?: 'number' | 'currency' | 'percent' | 'days';
}
