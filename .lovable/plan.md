

# Plan: Admin Panel Overhaul + Mobile Responsiveness

## Summary of Issues and Solutions

### Issue 1: Department Access Should Control View/Edit Permissions (Not Role Alone)

**Current Problem:** When admin changes a user's role, the view/edit permissions are hardcoded by role. You want role to be a title, but `department_access` to determine what the user can see and edit.

**Solution:** Refactor `useUserRole.ts` so that `canAccessView()` and `canEdit()` check the `department_access` array instead of the role. The role will still exist for labeling purposes, but department access will be the primary permission driver.

The mapping will be:
- "Recruiter" department --> access to Recruiters view + recruiter_activities editing
- "Account Manager" department --> access to Clients, Jobs, Account Managers views + clients/jobs editing
- "Business Development" department --> access to Business Dev view + bd_prospects editing
- "Operations Manager" department --> access to Operations, Performance views + employee_scores editing
- "Finance" department --> access to Finance view + invoices/payments editing
- Admin role still gets full access to everything regardless of department_access

### Issue 2: Custom Fields Not Showing in User Panels

**Current Problem:** Custom KPI fields added in admin panel only show in Excel templates, not in the user-facing views (Recruiters, Account Managers, Business Dev, Operations).

**Solution:** Update each department view component to fetch custom fields using `useCustomFields(department)` and display them alongside standard KPI metrics. Custom field values will be fetched with `useCustomFieldValues()` and displayed in the KPI cards and weekly tables.

**Files to Update:**
- `RecruitersView.tsx` - Add custom fields to KPI cards and weekly table
- `AccountManagersView.tsx` - Add custom fields to AM KPI cards
- `BusinessDevView.tsx` - Add custom fields to BD KPI section
- `OperationsView.tsx` - Add custom fields to operational KPIs

### Issue 3: Admin Full Edit Rights Across All Panels

**Current Problem:** Admin can view all panels but can't add/edit data in user panels.

**Solution:** Add inline edit capabilities (add/edit/delete buttons) to all view components, gated by `useUserRole().canEdit(tableName)`. Admin will see edit buttons on every view. Components affected:
- ClientsView - Add/edit client records
- JobsView - Add/edit jobs
- RecruitersView - Add/edit recruiter activities
- AccountManagersView - Add/edit AM activities
- BusinessDevView - Add/edit BD prospects
- FinanceView - Add/edit invoices and payments
- OperationsView - Add/edit employee scores

Each view will get an "Add New" button and row-level edit/delete actions using Dialog forms.

### Issue 4: New Admin Panels

**Current Changes to Admin Panel Tabs:**

1. **User Management** (existing, improved) - Shows actual user emails instead of user IDs by creating a profiles-like approach
2. **KPI Fields** (existing, kept as-is)
3. **Data Management** (NEW) - A centralized CRUD panel where admin can:
   - Select any module (Clients, Jobs, Employees, Invoices, Payments, BD Prospects, Recruiter Activities, AM Activities)
   - View all records in a table
   - Add new records via a form
   - Edit existing records inline
   - Delete records
4. **Activity Logs** (NEW) - Shows:
   - Audit logs of all user actions (from `audit_logs` table)
   - Recent errors/issues (filterable by user, action, table)
   - Timestamps and user identification

### Issue 5: Mobile Responsiveness

**Current Problem:** Fixed 264px sidebar with no collapse mechanism, `pl-64` on main content, grid layouts use fixed column counts.

**Solution:**
- Add a hamburger/toggle button to collapse the sidebar on mobile
- Use a sheet/drawer overlay for sidebar on screens less than 768px
- Make the sidebar collapsible with state management
- Update all grid layouts to be responsive (e.g., `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- Update `Index.tsx` to remove fixed `pl-64` and use dynamic padding
- Make all tables horizontally scrollable on mobile

---

## Technical Implementation Details

### Phase 1: Permission System Refactor

**File: `src/hooks/useUserRole.ts`**

Refactor `canAccessView` to use department_access:

```text
Department-to-View mapping:
  'Recruiter' --> ['recruiters']
  'Account Manager' --> ['clients', 'jobs', 'account-managers']
  'Business Development' --> ['business-dev']
  'Operations Manager' --> ['operations', 'performance']
  'Finance' --> ['finance']
  'dashboard' --> always accessible to all authenticated users
  'admin' --> only for admin role
```

Refactor `canEdit` similarly:

```text
Department-to-Table mapping:
  'Recruiter' --> ['recruiter_activities']
  'Account Manager' --> ['clients', 'jobs', 'job_recruiters', 'am_activities']
  'Business Development' --> ['bd_prospects']
  'Operations Manager' --> ['employee_scores']
  'Finance' --> ['invoices', 'payments']
  Admin role --> all tables
```

**File: `src/components/admin/DepartmentAccessEditor.tsx`**
- Already correct, no changes needed

### Phase 2: Custom Fields in User Views

**New Component: `src/components/dashboard/CustomFieldsDisplay.tsx`**
- Reusable component that takes a department name
- Fetches custom fields and values for the current period
- Renders them as KPI cards matching the existing design

**Updated Views:**
- Each view will import `CustomFieldsDisplay` and render it after the standard KPI cards
- Custom fields will appear as additional KPI cards in the grid

### Phase 3: Admin Edit Capabilities in All Views

**New Component: `src/components/shared/CRUDDialog.tsx`**
- Generic form dialog for creating/editing records
- Takes field definitions and handles form state
- Used across all views for consistency

**Updates to each view component:**
- Add "Add New" button in the header (visible when `canEdit` returns true)
- Add edit/delete action buttons per row in DataTable
- Each view gets its own form fields configuration

### Phase 4: New Admin Tabs

**New Component: `src/components/admin/DataManagement.tsx`**
- Module selector dropdown (Clients, Jobs, Employees, etc.)
- Dynamic table that loads data for selected module
- Add/Edit/Delete forms for each module
- Uses existing hooks (useClients, useJobs, useEmployees, etc.)

**New Component: `src/components/admin/ActivityLogs.tsx`**
- Fetches from `audit_logs` table
- Filterable by user, action type, table name, date range
- Shows formatted log entries with timestamps
- Paginated display

**Updated: `src/components/views/AdminView.tsx`**
- Add "Data Management" and "Activity Logs" tabs

### Phase 5: Mobile Responsiveness

**Updated: `src/pages/Index.tsx`**
- Add sidebar open/close state
- Use `useIsMobile()` hook to detect screen size
- Render sidebar as a Sheet overlay on mobile
- Add hamburger button in header on mobile
- Replace `pl-64` with dynamic padding

**Updated: `src/components/layout/Sidebar.tsx`**
- Accept `isOpen` and `onClose` props
- Support both fixed (desktop) and overlay (mobile) modes

**Updated Grid Layouts (all views):**
- `grid-cols-4` becomes `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- `grid-cols-6` becomes `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- `grid-cols-3` becomes `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- `grid-cols-2` becomes `grid-cols-1 lg:grid-cols-2`
- `grid-cols-5` becomes `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`
- Tables wrapped in `overflow-x-auto`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/DataManagement.tsx` | Centralized CRUD for all modules |
| `src/components/admin/ActivityLogs.tsx` | Audit log viewer with filters |
| `src/components/dashboard/CustomFieldsDisplay.tsx` | Reusable custom fields KPI display |
| `src/components/shared/CRUDDialog.tsx` | Generic add/edit dialog component |

## Files to Update

| File | Changes |
|------|---------|
| `src/hooks/useUserRole.ts` | Refactor permissions to use department_access |
| `src/pages/Index.tsx` | Mobile sidebar toggle, responsive padding |
| `src/components/layout/Sidebar.tsx` | Collapsible, mobile overlay mode |
| `src/components/views/AdminView.tsx` | Add Data Management + Activity Logs tabs |
| `src/components/views/RecruitersView.tsx` | Custom fields display + admin edit buttons |
| `src/components/views/AccountManagersView.tsx` | Custom fields display + admin edit buttons |
| `src/components/views/BusinessDevView.tsx` | Custom fields display + admin edit buttons |
| `src/components/views/OperationsView.tsx` | Custom fields display + admin edit buttons |
| `src/components/views/ClientsView.tsx` | Admin edit buttons + responsive grids |
| `src/components/views/JobsView.tsx` | Admin edit buttons + responsive grids |
| `src/components/views/FinanceView.tsx` | Admin edit buttons + responsive grids |
| `src/components/views/DashboardView.tsx` | Responsive grids |
| `src/components/views/PerformanceView.tsx` | Responsive grids |
| `src/components/admin/UserManagement.tsx` | Show user emails, improve UX |

## Database Changes

- No new tables needed (audit_logs already exists)
- No migration required - all changes are frontend-only

