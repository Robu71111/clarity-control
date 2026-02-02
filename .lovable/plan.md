

# Plan: Add Database Persistence with Lovable Cloud + Supabase

## Overview

I'll integrate **Supabase** as your database solution - it's the best free option available that gives you:
- **500 MB database storage** on the free tier
- **Unlimited API requests**
- **Real-time data sync**
- **No credit card required**
- **Easy deployment to production**

This is perfect for a staffing business dashboard - you'll have plenty of space for thousands of clients, jobs, employees, and financial records.

---

## What Will Be Built

### 1. Database Schema (9 Tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `employees` | All staff members | name, role, department |
| `clients` | Client companies | name, account_manager, billing_type, status, outstanding |
| `jobs` | Job openings | client_id, title, priority, status, submissions, interviews |
| `job_recruiters` | Links recruiters to jobs | job_id, employee_id |
| `recruiter_activities` | Daily recruiter logs | employee_id, job_id, resumes_sourced, submitted |
| `am_activities` | Account Manager logs | employee_id, client_id, action_taken, outcome |
| `bd_prospects` | Business Development pipeline | prospect_name, stage, probability, bd_owner_id |
| `invoices` | Billing records | client_id, amount, status, sent_date, due_date |
| `payments` | Payment receipts | client_id, invoice_id, amount, payment_mode |
| `employee_scores` | Performance scorecards | employee_id, productivity, quality, final_score |

### 2. React Query Integration

- Create custom hooks for each data type (useClients, useJobs, etc.)
- Automatic caching and refetching
- Loading and error states
- Optimistic updates for better UX

### 3. CRUD Operations

- Add/Edit/Delete forms for all major entities
- Real-time updates across all dashboard views
- Data validation with Zod schemas

---

## Implementation Steps

### Phase 1: Enable Lovable Cloud + Supabase
- Connect the project to Lovable Cloud (provides Supabase automatically)
- This gives you a managed PostgreSQL database with the free tier limits

### Phase 2: Create Database Schema
- Run migrations to create all 9 tables with proper relationships
- Set up foreign key constraints (e.g., jobs linked to clients)
- Enable Row Level Security (RLS) for data protection

### Phase 3: Create Data Access Layer
- Build a `src/lib/supabase.ts` client configuration
- Create `src/hooks/` folder with data fetching hooks:
  - `useClients.ts` - fetch, create, update, delete clients
  - `useJobs.ts` - manage jobs with recruiter assignments
  - `useEmployees.ts` - employee management
  - `useFinance.ts` - invoices and payments
  - `useActivities.ts` - recruiter and AM activity logs
  - `useBDProspects.ts` - business development pipeline
  - `useKPIs.ts` - calculated KPI metrics

### Phase 4: Update All Views
- Replace mock data imports with React Query hooks
- Add loading skeletons while data fetches
- Handle error states gracefully
- Update DashboardView, ClientsView, JobsView, RecruitersView, etc.

### Phase 5: Add Data Entry Forms
- Create modal forms for adding new records
- Edit functionality for existing records
- Delete confirmation dialogs
- Form validation with error messages

---

## Database Relationship Diagram

```text
employees (staff members)
    |
    +-- employee_scores (1:N)
    |
    +-- job_recruiters (M:N with jobs)
    |
    +-- recruiter_activities (1:N)
    |
    +-- am_activities (1:N)
    |
    +-- bd_prospects (1:N as bd_owner)

clients (customer companies)
    |
    +-- jobs (1:N)
    |
    +-- invoices (1:N)
    |
    +-- payments (1:N)
    |
    +-- am_activities (1:N)

invoices
    |
    +-- payments (1:N)
```

---

## Free Tier Limits (What You Get)

| Resource | Limit | Enough For |
|----------|-------|------------|
| Database | 500 MB | ~50,000+ records |
| API Requests | Unlimited | No limits |
| Storage | 1 GB | File uploads if needed |
| Bandwidth | 5 GB/month | Normal usage |

This is more than enough for a small-to-medium staffing business tracking hundreds of clients and jobs.

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/integrations/supabase/client.ts` | Supabase client setup |
| `src/hooks/useClients.ts` | Client CRUD operations |
| `src/hooks/useJobs.ts` | Job management with recruiters |
| `src/hooks/useEmployees.ts` | Employee/staff management |
| `src/hooks/useFinance.ts` | Invoices and payments |
| `src/hooks/useActivities.ts` | Daily activity logs |
| `src/hooks/useBDProspects.ts` | BD pipeline management |
| `src/hooks/useKPIs.ts` | Computed dashboard metrics |
| `src/components/forms/ClientForm.tsx` | Add/Edit client form |
| `src/components/forms/JobForm.tsx` | Add/Edit job form |
| `src/components/forms/InvoiceForm.tsx` | Add/Edit invoice form |
| `src/components/forms/PaymentForm.tsx` | Add/Edit payment form |

### Files to Modify

All view components will be updated to use the new hooks instead of mock data:
- `DashboardView.tsx`
- `ClientsView.tsx`
- `JobsView.tsx`
- `RecruitersView.tsx`
- `AccountManagersView.tsx`
- `BusinessDevView.tsx`
- `OperationsView.tsx`
- `FinanceView.tsx`
- `PerformanceView.tsx`

---

## First Step Required

Before I can proceed, I need to enable Lovable Cloud (which includes Supabase) for your project. Click "Approve" and I'll set this up for you.

