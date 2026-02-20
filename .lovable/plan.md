

# Plan: 8 Major Feature Additions

## Feature 1: Interactive Dashboard Charts + Admin Custom Charts

### Dashboard Charts
Add a new "Analytics" section to `DashboardView.tsx` with three recharts visualizations:
- **Bar Chart**: Weekly KPI comparisons (Submissions, Interviews, Starts side by side)
- **Pie Chart**: Job status distribution (Open, On Hold, Interviewing, Filled, etc.)
- **Area/Line Chart**: Revenue trend over time (invoiced vs received per month)

Data will come from existing hooks (`useJobs`, `useOwnerKPIs`, `useInvoices`).

### Admin Custom Charts Manager
Create a new database table `custom_charts` to store chart configurations that admins can create and push to the dashboard.

**Database migration:**
```sql
CREATE TABLE public.custom_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  chart_type TEXT NOT NULL DEFAULT 'bar', -- bar, line, pie, area
  data_source TEXT NOT NULL, -- jobs, clients, invoices, recruiter_activities, etc.
  metric_field TEXT NOT NULL, -- which column to aggregate
  group_by TEXT, -- optional grouping field (status, priority, etc.)
  aggregate TEXT NOT NULL DEFAULT 'count', -- count, sum, avg
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_charts ENABLE ROW LEVEL SECURITY;
-- Admin-only write, all authenticated read
CREATE POLICY "Admins can manage custom_charts" ON public.custom_charts FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view custom_charts" ON public.custom_charts FOR SELECT USING (true);
```

**New files:**
- `src/components/admin/CustomChartsManager.tsx` -- Admin UI to create/edit/delete chart configs (form with title, chart type dropdown, data source dropdown, metric field, group by, aggregate type)
- `src/hooks/useCustomCharts.ts` -- CRUD hooks for custom_charts table
- `src/components/dashboard/DashboardCharts.tsx` -- Renders the 3 built-in charts
- `src/components/dashboard/CustomChartRenderer.tsx` -- Dynamically renders charts from custom_charts configs by querying the relevant table and applying aggregation client-side

**Updated files:**
- `src/components/views/DashboardView.tsx` -- Add `DashboardCharts` and `CustomChartRenderer` sections
- `src/components/views/AdminView.tsx` -- Add "Charts" tab with `CustomChartsManager`

---

## Feature 2: Export Reports to PDF

Use the browser's native `window.print()` with a print-optimized layout, plus a lightweight approach using a hidden printable div styled for PDF output.

**New files:**
- `src/components/shared/ExportPDFButton.tsx` -- A button component that captures the current view's KPI data and renders it into a print-friendly hidden div, then triggers `window.print()`. Includes header with date range, company name, and formatted KPI tables.
- `src/hooks/useExportPDF.ts` -- Helper that constructs a printable HTML document from KPI data and opens it in a new window for print/save as PDF.

**Updated files:**
- `src/components/views/DashboardView.tsx` -- Add "Export PDF" button in the header
- `src/components/views/RecruitersView.tsx` -- Add "Export PDF" button
- `src/components/views/FinanceView.tsx` -- Add "Export PDF" button
- Each view passes its data to the export utility

This approach avoids heavy dependencies (no jsPDF/html2canvas needed) and uses the browser's built-in PDF generation.

---

## Feature 3: Global Date Range Filter

Add a date range picker in the dashboard header that filters all KPI queries.

**New files:**
- `src/components/shared/DateRangeFilter.tsx` -- A component with preset buttons ("This Week", "Last Week", "This Month", "Last Month", "Custom") and a date range picker using the existing Calendar component + Popover. Stores selected range in state.
- `src/contexts/DateRangeContext.tsx` -- React context to share the selected date range across all views.

**Updated files:**
- `src/App.tsx` -- Wrap with `DateRangeProvider`
- `src/pages/Index.tsx` -- Render `DateRangeFilter` in the main header area (above the active view)
- `src/hooks/useKPIs.ts` -- Accept date range params, filter queries with `.gte('created_at', startDate).lte('created_at', endDate)`
- `src/hooks/useJobs.ts` -- Filter by `open_date` within range
- `src/hooks/useFinance.ts` -- Filter invoices/payments by date
- `src/hooks/useRecruiterKPIs.ts` -- Filter activities by `activity_date`
- `src/hooks/useActivities.ts` -- Filter by `activity_date`

The context will provide `{ startDate, endDate, preset }` and all hooks will read from it via `useDateRange()`.

---

## Feature 4: User Profiles Page

Enhance the existing Settings page to allow users to update their display name, phone, and avatar.

**Database migration:**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));

-- Create avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**New files:**
- `src/hooks/useProfile.ts` -- Query and mutation hooks for the profiles table + avatar upload to storage

**Updated files:**
- `src/pages/SettingsPage.tsx` -- Add editable fields for display name, phone number, and avatar upload (with preview). The Profile card becomes a form with save button.
- `src/components/layout/Sidebar.tsx` -- Show display name and avatar from profile instead of just email initials

---

## Feature 5: Dark Mode Toggle

Wire up the already-installed `next-themes` package.

**Updated files:**
- `src/App.tsx` -- Wrap with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
- `src/main.tsx` -- No changes needed (CSS already has `.dark` class defined in `index.css`)
- `src/components/layout/Sidebar.tsx` -- Add a Sun/Moon toggle button in the footer section, using `useTheme()` from `next-themes`
- `src/pages/SettingsPage.tsx` -- Add a "Theme" card with Light/Dark/System radio options

The `.dark` CSS variables are already defined in `index.css`, so toggling the class on `<html>` will work immediately.

---

## Feature 6: Bulk Actions in Data Management

Add multi-select checkboxes to the Data Management table with bulk delete and bulk status update.

**Updated files:**
- `src/components/admin/DataManagement.tsx`:
  - Add a checkbox column to each table row
  - Add a "Select All" checkbox in the header
  - When items are selected, show a floating action bar at the top with:
    - "X selected" count
    - "Delete Selected" button (with confirmation dialog)
    - "Update Status" dropdown (for modules that have a status field)
    - "Clear Selection" button
  - Track selected IDs in component state
  - Bulk delete calls the individual delete mutation in a loop (or a batch approach)
  - Bulk status update calls update mutation for each selected record

---

## Feature 7: Comments/Notes on Records

Add a commenting system so team members can leave notes on jobs, clients, or prospects.

**Database migration:**
```sql
CREATE TABLE public.record_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL, -- 'jobs', 'clients', 'bd_prospects'
  record_id UUID NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.record_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view comments" ON public.record_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert comments" ON public.record_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.record_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any comment" ON public.record_comments FOR DELETE USING (is_admin(auth.uid()));
```

**New files:**
- `src/hooks/useComments.ts` -- Query comments by table_name + record_id, create/update/delete mutations
- `src/components/shared/CommentsPanel.tsx` -- A slide-out Sheet or collapsible section showing comments for a record. Includes a text input to add new comments, and displays existing comments with user email, timestamp, and the comment text.

**Updated files:**
- `src/components/views/JobsView.tsx` -- Add a "Notes" icon button per job row that opens `CommentsPanel`
- `src/components/views/ClientsView.tsx` -- Add "Notes" button per client
- `src/components/views/BusinessDevView.tsx` -- Add "Notes" button per prospect

---

## Feature 8: Audit Trail Improvements

Enhance the Activity Logs to show before/after value diffs.

**Updated files:**
- `src/components/admin/ActivityLogs.tsx`:
  - Add an expandable row detail (click a row to expand and show the full diff)
  - Show `old_values` and `new_values` side by side in a formatted diff view
  - Highlight changed fields in green (new) and red (old)
  - Add a "Changes" column that shows a brief summary like "Changed status from Open to Filled"
  - Resolve user_id to email using the admin-users edge function (fetch once and cache)
  - Add date range filter using date pickers
  - Add pagination (load more button or page numbers)

**New helper:**
- `src/lib/diffUtils.ts` -- Utility function that takes old_values and new_values JSON objects and returns an array of `{ field, oldValue, newValue }` changes for rendering the diff view.

---

## Files Summary

### New Files (13)
| File | Purpose |
|---|---|
| `src/components/dashboard/DashboardCharts.tsx` | Built-in bar, pie, area charts for Dashboard |
| `src/components/dashboard/CustomChartRenderer.tsx` | Renders admin-created custom charts |
| `src/components/admin/CustomChartsManager.tsx` | Admin UI to create/manage custom chart configs |
| `src/hooks/useCustomCharts.ts` | CRUD hooks for custom_charts table |
| `src/components/shared/ExportPDFButton.tsx` | Print-to-PDF export component |
| `src/hooks/useExportPDF.ts` | PDF generation helper |
| `src/components/shared/DateRangeFilter.tsx` | Date range picker with presets |
| `src/contexts/DateRangeContext.tsx` | Shared date range state context |
| `src/hooks/useProfile.ts` | Profile CRUD + avatar upload hooks |
| `src/hooks/useComments.ts` | Comments CRUD hooks |
| `src/components/shared/CommentsPanel.tsx` | Comments UI panel |
| `src/lib/diffUtils.ts` | Audit log diff utility |

### Updated Files (14)
| File | Changes |
|---|---|
| `src/components/views/DashboardView.tsx` | Add charts section, export PDF button, date filter |
| `src/components/views/AdminView.tsx` | Add Charts tab |
| `src/components/admin/DataManagement.tsx` | Bulk select/delete/update |
| `src/components/admin/ActivityLogs.tsx` | Expandable diffs, user emails, date filter, pagination |
| `src/pages/SettingsPage.tsx` | Profile editing, avatar upload, theme selector |
| `src/components/layout/Sidebar.tsx` | Dark mode toggle, show profile name/avatar |
| `src/App.tsx` | ThemeProvider + DateRangeProvider wrappers |
| `src/pages/Index.tsx` | DateRangeFilter in header |
| `src/hooks/useKPIs.ts` | Accept date range filtering |
| `src/hooks/useJobs.ts` | Accept date range filtering |
| `src/hooks/useFinance.ts` | Accept date range filtering |
| `src/hooks/useRecruiterKPIs.ts` | Accept date range filtering |
| `src/components/views/JobsView.tsx` | Comments button per row |
| `src/components/views/ClientsView.tsx` | Comments button per row |

### Database Migrations (3)
1. `custom_charts` table + RLS policies
2. `profiles` table + RLS + `avatars` storage bucket
3. `record_comments` table + RLS policies

