import { 
  Client, Job, RecruiterActivity, AMActivity, BDProspect, 
  Invoice, Payment, EmployeeScore, KPIMetric 
} from '@/types/staffing';

export const ownerKPIs: KPIMetric[] = [
  { label: 'Active Clients', thisWeek: 24, lastWeek: 22, format: 'number' },
  { label: 'Active Jobs', thisWeek: 87, lastWeek: 79, format: 'number' },
  { label: 'Submissions', thisWeek: 156, lastWeek: 142, format: 'number' },
  { label: 'Interviews', thisWeek: 34, lastWeek: 28, format: 'number' },
  { label: 'Starts / Placements', thisWeek: 8, lastWeek: 6, format: 'number' },
  { label: 'Revenue Invoiced', thisWeek: 125000, lastWeek: 98000, format: 'currency' },
  { label: 'Payment Received', thisWeek: 87500, lastWeek: 112000, format: 'currency' },
  { label: 'Outstanding Receivable', thisWeek: 245000, lastWeek: 220000, format: 'currency' },
  { label: 'Avg Collection Days', thisWeek: 32, lastWeek: 35, format: 'days' },
];

export const clients: Client[] = [
  { id: 'C001', name: 'TechStaff Solutions', accountManager: 'Sarah Johnson', billingType: 'Hourly', paymentTerms: 'Net 30', status: 'Active', lastPaymentDate: '2025-01-28', outstanding: 45000 },
  { id: 'C002', name: 'Healthcare Recruiters Inc', accountManager: 'Mike Chen', billingType: 'Monthly Retainer', paymentTerms: 'Net 15', status: 'Active', lastPaymentDate: '2025-01-25', outstanding: 22500 },
  { id: 'C003', name: 'IT Talent Partners', accountManager: 'Sarah Johnson', billingType: 'Hourly', paymentTerms: 'Net 45', status: 'Active', lastPaymentDate: '2025-01-15', outstanding: 67800 },
  { id: 'C004', name: 'Finance Staffing Group', accountManager: 'Mike Chen', billingType: 'Project Based', paymentTerms: 'Net 30', status: 'Hold', lastPaymentDate: '2024-12-20', outstanding: 35000 },
  { id: 'C005', name: 'Engineering Talent Co', accountManager: 'Lisa Park', billingType: 'Hourly', paymentTerms: 'Net 30', status: 'Active', lastPaymentDate: '2025-01-30', outstanding: 18900 },
  { id: 'C006', name: 'Pharma Recruiters LLC', accountManager: 'Lisa Park', billingType: 'Monthly Retainer', paymentTerms: 'Net 15', status: 'Active', lastPaymentDate: '2025-01-22', outstanding: 55800 },
];

export const jobs: Job[] = [
  { id: 'J001', clientId: 'C001', clientName: 'TechStaff Solutions', title: 'Senior Java Developer', priority: 'High', openDate: '2025-01-15', recruitersAssigned: ['Raj Patel', 'Priya Singh'], submissions: 12, interviews: 4, offers: 1, starts: 0, status: 'Offer Made' },
  { id: 'J002', clientId: 'C001', clientName: 'TechStaff Solutions', title: 'DevOps Engineer', priority: 'Medium', openDate: '2025-01-20', recruitersAssigned: ['Amit Kumar'], submissions: 8, interviews: 2, offers: 0, starts: 0, status: 'Interviewing' },
  { id: 'J003', clientId: 'C002', clientName: 'Healthcare Recruiters Inc', title: 'Registered Nurse', priority: 'High', openDate: '2025-01-10', recruitersAssigned: ['Neha Gupta', 'Raj Patel'], submissions: 25, interviews: 8, offers: 2, starts: 1, status: 'Filled' },
  { id: 'J004', clientId: 'C003', clientName: 'IT Talent Partners', title: 'Cloud Architect', priority: 'High', openDate: '2025-01-18', recruitersAssigned: ['Priya Singh'], submissions: 6, interviews: 1, offers: 0, starts: 0, status: 'Interviewing' },
  { id: 'J005', clientId: 'C005', clientName: 'Engineering Talent Co', title: 'Mechanical Engineer', priority: 'Low', openDate: '2025-01-25', recruitersAssigned: ['Amit Kumar', 'Neha Gupta'], submissions: 15, interviews: 3, offers: 0, starts: 0, status: 'Open' },
  { id: 'J006', clientId: 'C004', clientName: 'Finance Staffing Group', title: 'Financial Analyst', priority: 'Medium', openDate: '2025-01-05', recruitersAssigned: ['Raj Patel'], submissions: 10, interviews: 5, offers: 1, starts: 1, status: 'Filled' },
  { id: 'J007', clientId: 'C006', clientName: 'Pharma Recruiters LLC', title: 'Clinical Research Associate', priority: 'High', openDate: '2025-01-22', recruitersAssigned: ['Neha Gupta'], submissions: 4, interviews: 0, offers: 0, starts: 0, status: 'Open' },
  { id: 'J008', clientId: 'C001', clientName: 'TechStaff Solutions', title: 'React Developer', priority: 'Medium', openDate: '2025-01-28', recruitersAssigned: ['Priya Singh', 'Amit Kumar'], submissions: 3, interviews: 0, offers: 0, starts: 0, status: 'Open' },
];

export const recruiterActivities: RecruiterActivity[] = [
  { id: 'RA001', date: '2025-01-30', recruiterId: 'R001', recruiterName: 'Raj Patel', jobId: 'J001', resumesSourced: 15, submitted: 4, feedbackReceived: 2, interviewsScheduled: 1 },
  { id: 'RA002', date: '2025-01-30', recruiterId: 'R002', recruiterName: 'Priya Singh', jobId: 'J004', resumesSourced: 12, submitted: 3, feedbackReceived: 1, interviewsScheduled: 1 },
  { id: 'RA003', date: '2025-01-30', recruiterId: 'R003', recruiterName: 'Amit Kumar', jobId: 'J002', resumesSourced: 10, submitted: 2, feedbackReceived: 1, interviewsScheduled: 0 },
  { id: 'RA004', date: '2025-01-30', recruiterId: 'R004', recruiterName: 'Neha Gupta', jobId: 'J007', resumesSourced: 18, submitted: 4, feedbackReceived: 0, interviewsScheduled: 0 },
  { id: 'RA005', date: '2025-01-29', recruiterId: 'R001', recruiterName: 'Raj Patel', jobId: 'J006', resumesSourced: 8, submitted: 3, feedbackReceived: 2, interviewsScheduled: 1 },
  { id: 'RA006', date: '2025-01-29', recruiterId: 'R002', recruiterName: 'Priya Singh', jobId: 'J008', resumesSourced: 14, submitted: 3, feedbackReceived: 0, interviewsScheduled: 0 },
];

export const amActivities: AMActivity[] = [
  { id: 'AM001', date: '2025-01-30', amId: 'A001', amName: 'Sarah Johnson', clientId: 'C001', clientName: 'TechStaff Solutions', actionTaken: 'Weekly status call', outcome: 'Discussed new Java requirement', nextStep: 'Send 3 profiles by Friday' },
  { id: 'AM002', date: '2025-01-30', amId: 'A002', amName: 'Mike Chen', clientId: 'C002', clientName: 'Healthcare Recruiters Inc', actionTaken: 'Payment follow-up', outcome: 'Promise to pay by Feb 5', nextStep: 'Confirm payment receipt' },
  { id: 'AM003', date: '2025-01-29', amId: 'A001', amName: 'Sarah Johnson', clientId: 'C003', clientName: 'IT Talent Partners', actionTaken: 'New job intake call', outcome: 'Got 2 new requirements', nextStep: 'Create job postings' },
  { id: 'AM004', date: '2025-01-29', amId: 'A003', amName: 'Lisa Park', clientId: 'C005', clientName: 'Engineering Talent Co', actionTaken: 'Candidate feedback discussion', outcome: 'Client wants to interview 2 candidates', nextStep: 'Schedule interviews' },
];

export const bdProspects: BDProspect[] = [
  { id: 'BD001', prospect: 'Global IT Staffing', contact: 'John Smith', industry: 'Technology', stage: 'Proposal Sent', lastFollowUp: '2025-01-28', nextAction: 'Follow up on proposal', probability: 60, bdOwner: 'David Wilson' },
  { id: 'BD002', prospect: 'MedForce Recruiters', contact: 'Emily Brown', industry: 'Healthcare', stage: 'Meeting Scheduled', lastFollowUp: '2025-01-29', nextAction: 'Demo on Feb 3', probability: 40, bdOwner: 'David Wilson' },
  { id: 'BD003', prospect: 'FinanceFirst Talent', contact: 'Robert Lee', industry: 'Finance', stage: 'Lead', lastFollowUp: '2025-01-25', nextAction: 'Initial outreach call', probability: 20, bdOwner: 'Anna Martinez' },
  { id: 'BD004', prospect: 'BuildRight Staffing', contact: 'Maria Garcia', industry: 'Construction', stage: 'Negotiation', lastFollowUp: '2025-01-30', nextAction: 'Finalize contract terms', probability: 80, bdOwner: 'David Wilson' },
  { id: 'BD005', prospect: 'BioTech Recruiters', contact: 'James Wilson', industry: 'Biotech', stage: 'Contacted', lastFollowUp: '2025-01-27', nextAction: 'Send company overview', probability: 30, bdOwner: 'Anna Martinez' },
];

export const invoices: Invoice[] = [
  { id: 'I001', invoiceNo: 'INV-2025-001', clientId: 'C001', clientName: 'TechStaff Solutions', month: 'January 2025', amount: 45000, sentDate: '2025-01-31', dueDate: '2025-02-28', status: 'Sent' },
  { id: 'I002', invoiceNo: 'INV-2025-002', clientId: 'C002', clientName: 'Healthcare Recruiters Inc', month: 'January 2025', amount: 22500, sentDate: '2025-01-31', dueDate: '2025-02-15', status: 'Sent' },
  { id: 'I003', invoiceNo: 'INV-2024-045', clientId: 'C003', clientName: 'IT Talent Partners', month: 'December 2024', amount: 38000, sentDate: '2024-12-31', dueDate: '2025-02-14', status: 'Overdue' },
  { id: 'I004', invoiceNo: 'INV-2024-044', clientId: 'C004', clientName: 'Finance Staffing Group', month: 'December 2024', amount: 35000, sentDate: '2024-12-31', dueDate: '2025-01-30', status: 'Overdue' },
  { id: 'I005', invoiceNo: 'INV-2024-040', clientId: 'C001', clientName: 'TechStaff Solutions', month: 'November 2024', amount: 42000, sentDate: '2024-11-30', dueDate: '2024-12-30', status: 'Paid' },
  { id: 'I006', invoiceNo: 'INV-2025-003', clientId: 'C005', clientName: 'Engineering Talent Co', month: 'January 2025', amount: 18900, sentDate: '2025-01-31', dueDate: '2025-02-28', status: 'Sent' },
];

export const payments: Payment[] = [
  { id: 'P001', dateReceived: '2025-01-30', clientId: 'C005', clientName: 'Engineering Talent Co', amount: 15000, mode: 'Wire Transfer', againstInvoice: 'INV-2024-038' },
  { id: 'P002', dateReceived: '2025-01-28', clientId: 'C001', clientName: 'TechStaff Solutions', amount: 42000, mode: 'ACH', againstInvoice: 'INV-2024-040' },
  { id: 'P003', dateReceived: '2025-01-25', clientId: 'C002', clientName: 'Healthcare Recruiters Inc', amount: 20000, mode: 'Wire Transfer', againstInvoice: 'INV-2024-042' },
  { id: 'P004', dateReceived: '2025-01-22', clientId: 'C006', clientName: 'Pharma Recruiters LLC', amount: 28000, mode: 'ACH', againstInvoice: 'INV-2024-041' },
  { id: 'P005', dateReceived: '2025-01-20', clientId: 'C003', clientName: 'IT Talent Partners', amount: 32000, mode: 'Check', againstInvoice: 'INV-2024-039' },
];

export const employeeScores: EmployeeScore[] = [
  { id: 'E001', name: 'Sarah Johnson', role: 'Account Manager', productivity: 4, quality: 5, discipline: 4, ownership: 5, finalScore: 4.5 },
  { id: 'E002', name: 'Mike Chen', role: 'Account Manager', productivity: 4, quality: 4, discipline: 5, ownership: 4, finalScore: 4.25 },
  { id: 'E003', name: 'Lisa Park', role: 'Account Manager', productivity: 5, quality: 4, discipline: 4, ownership: 4, finalScore: 4.25 },
  { id: 'E004', name: 'Raj Patel', role: 'Recruiter', productivity: 5, quality: 4, discipline: 4, ownership: 5, finalScore: 4.5 },
  { id: 'E005', name: 'Priya Singh', role: 'Recruiter', productivity: 4, quality: 5, discipline: 5, ownership: 4, finalScore: 4.5 },
  { id: 'E006', name: 'Amit Kumar', role: 'Recruiter', productivity: 3, quality: 4, discipline: 4, ownership: 3, finalScore: 3.5 },
  { id: 'E007', name: 'Neha Gupta', role: 'Recruiter', productivity: 4, quality: 4, discipline: 5, ownership: 4, finalScore: 4.25 },
  { id: 'E008', name: 'David Wilson', role: 'Business Development', productivity: 5, quality: 4, discipline: 4, ownership: 5, finalScore: 4.5 },
  { id: 'E009', name: 'Anna Martinez', role: 'Business Development', productivity: 4, quality: 4, discipline: 5, ownership: 4, finalScore: 4.25 },
  { id: 'E010', name: 'James Taylor', role: 'Operations Manager', productivity: 5, quality: 5, discipline: 5, ownership: 5, finalScore: 5.0 },
];

export const receivablesAging = [
  { clientName: 'TechStaff Solutions', days0to15: 45000, days16to30: 0, days31to60: 0, days60plus: 0, total: 45000 },
  { clientName: 'Healthcare Recruiters Inc', days0to15: 22500, days16to30: 0, days31to60: 0, days60plus: 0, total: 22500 },
  { clientName: 'IT Talent Partners', days0to15: 0, days16to30: 29800, days31to60: 38000, days60plus: 0, total: 67800 },
  { clientName: 'Finance Staffing Group', days0to15: 0, days16to30: 0, days31to60: 35000, days60plus: 0, total: 35000 },
  { clientName: 'Engineering Talent Co', days0to15: 18900, days16to30: 0, days31to60: 0, days60plus: 0, total: 18900 },
  { clientName: 'Pharma Recruiters LLC', days0to15: 27800, days16to30: 28000, days31to60: 0, days60plus: 0, total: 55800 },
];
