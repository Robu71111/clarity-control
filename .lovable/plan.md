
# Plan: Redesign User Management and Data Management Panels

## Overview

Redesign the User Management panel to match the reference UI (showing user name/email, role badge, department access badges with "Edit Access" dialog, and Make/Remove Admin buttons). Redesign the Data Management panel to use a horizontal tab layout per module with inline "Add New Record" forms and an "Existing Records" table below.

---

## 1. User Management Redesign

### Current Issues
- Shows truncated User IDs instead of names/emails
- Department access editing is inline (cramped)
- No search functionality
- No "Make Admin" / "Remove Admin" quick actions

### New Design (matching reference image)

**Layout:**
- Search bar in the header (top-right)
- Table columns: User (name + email), Role (badge), Department Access (colored badges with "+N more"), Actions
- Actions column: "Make Admin" / "Remove Admin" button + "Edit Access" button

**"Edit Access" Dialog** (matching reference image-1):
- Opens a Dialog showing the user's name
- Lists all departments (Dashboard, Recruiters, Clients/Jobs, Account Managers, Business Dev, Operations, Finance, Performance) as rows
- Each row has a "View" checkbox and an "Edit" checkbox
- "Toggle All View" and "Toggle All Edit" buttons at the top
- Saves granular view/edit permissions per department

**Database consideration:** Currently `department_access` is a simple string array. To support separate View vs Edit permissions per department, we need to either:
- Store as a JSON object instead (requires migration), OR
- Keep it simple: department_access = view access, and a new `department_edit_access` column for edit permissions

We will add a `department_edit_access` text array column to `user_roles` via migration.

**Getting user emails:** Currently shows "User + ID". We need an edge function or a profiles table approach to get emails from auth.users. We will create a simple admin edge function that calls the Supabase Admin API to list users.

### Files to Change
- `src/components/admin/UserManagement.tsx` - Complete rewrite with new layout
- `src/components/admin/DepartmentAccessEditor.tsx` - Rewrite as a Dialog with View/Edit checkboxes per department
- `src/hooks/useUserRole.ts` - Update to use `department_edit_access` for `canEdit()`
- New edge function: `supabase/functions/admin-users/index.ts` - Fetch user emails from auth

### Database Migration
- Add `department_edit_access text[] default '{}'` column to `user_roles`

---

## 2. Data Management Redesign

### Current Issues
- Uses a dropdown selector to switch modules (not as discoverable)
- Uses a dialog for add/edit (not inline)
- No inline add form

### New Design (matching reference images 3 and 4)

**Layout:**
- Horizontal scrollable tabs for each module (Clients, Jobs, Employees, BD Prospects, Invoices, Recruiter Activities, AM Activities, Employee Scores)
- Each tab shows:
  1. **"+ Add New [Module] Record" card** at the top with inline form fields in a responsive grid (3 columns on desktop, stacked on mobile)
  2. **"Existing Records" card** below with table, edit/delete actions per row
- Edit opens inline or uses the existing CRUDDialog

### Files to Change
- `src/components/admin/DataManagement.tsx` - Complete rewrite with tab-based layout and inline add forms

---

## 3. Admin View Tab Reorder

Reorder tabs to match reference: Data Management first, then KPI Manager, then User Management, then Activity Logs.

### Files to Change
- `src/components/views/AdminView.tsx` - Reorder tabs

---

## Technical Details

### New Edge Function: `supabase/functions/admin-users/index.ts`
- Accepts GET requests
- Uses Supabase service role key to call `auth.admin.listUsers()`
- Returns array of `{ id, email, created_at }` for all users
- Protected: verifies the calling user is an admin via `user_roles` table

### Database Migration
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS department_edit_access text[] DEFAULT '{}';
```

### Updated Permission Logic in `useUserRole.ts`
- `canAccessView()` checks `department_access` (view permissions)
- `canEdit()` checks `department_edit_access` (edit permissions)
- Admins bypass both checks

### Department List for Access Dialog
The departments map to sidebar views:
| Department Label | View Access | Edit Access (tables) |
|---|---|---|
| Dashboard | dashboard | - |
| Recruiters | recruiters | recruiter_activities |
| Clients & Jobs | clients, jobs | clients, jobs, job_recruiters |
| Account Managers | account-managers | am_activities |
| Business Dev | business-dev | bd_prospects |
| Operations | operations | employee_scores |
| Finance | finance | invoices, payments |
| Performance | performance | - |

### DataManagement Tab Modules
Each tab has its own field definitions and hooks:
- Clients: name, billing_type, payment_terms, status, outstanding
- Jobs: title, client_id, priority, status
- Employees: name, email, role, department
- BD Prospects: prospect_name, contact_name, industry, stage, probability
- Invoices: invoice_no, client_id, billing_month, amount, status
- Recruiter Activities: employee_id, activity_date, calls_made, emails_sent, etc.
- AM Activities: employee_id, client_id, action_taken, outcome
- Employee Scores: employee_id, score_month, productivity, quality, discipline, ownership

---

## Files Summary

| File | Action |
|---|---|
| `supabase/functions/admin-users/index.ts` | Create - edge function to fetch user emails |
| `src/components/admin/UserManagement.tsx` | Rewrite - new layout with search, badges, Make Admin |
| `src/components/admin/DepartmentAccessEditor.tsx` | Rewrite - Dialog with View/Edit checkboxes per department |
| `src/components/admin/DataManagement.tsx` | Rewrite - tab-based with inline add forms |
| `src/components/views/AdminView.tsx` | Update - reorder tabs |
| `src/hooks/useUserRole.ts` | Update - use department_edit_access for canEdit |
| Database migration | Add department_edit_access column |
