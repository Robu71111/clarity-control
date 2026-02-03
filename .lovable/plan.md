

# Plan: Enhanced Recruiter KPIs + Admin Panel for Custom Field Management

## Overview

This plan implements two major features:
1. **Enhanced Recruiter KPIs** with the 6 specific metrics you requested, plus weekly stats per recruiter and editable targets
2. **Admin Panel** for managing custom KPI fields across all departments with Excel template download/upload functionality

---

## Part 1: Enhanced Recruiter KPIs

### New KPIs to Track

| KPI | Description | Calculation |
|-----|-------------|-------------|
| Open Positions Worked On | Count of unique jobs a recruiter is assigned to | Count from `job_recruiters` table |
| Job Coverage Ratio | % of assigned jobs with activity | Jobs with submissions / Total assigned jobs |
| AM Submissions | Submissions to Account Manager | New field in recruiter_activities |
| End Client Submissions | Submissions to end client | New field in recruiter_activities |
| Interviews | Interviews scheduled | Existing field |
| Hired | Candidates placed | Count of jobs with starts > 0 for recruiter |

### Database Changes Required

```text
ALTER TABLE recruiter_activities:
  + am_submissions (integer, default 0)
  + end_client_submissions (integer, default 0)
  + hired (integer, default 0)

NEW TABLE: kpi_targets
  - id (uuid, primary key)
  - department (text) - 'Recruiter', 'Account Manager', 'Business Dev', etc.
  - kpi_name (text) - e.g., 'Open Positions Worked On'
  - target_value (numeric)
  - period (text) - 'weekly' or 'monthly'
  - created_at, updated_at
```

### UI Changes to RecruitersView

1. **KPI Summary Cards** - Replace current 4-column layout with 6-column grid for new KPIs
2. **Weekly Stats Table** - Add per-recruiter breakdown with actual vs target
3. **Editable Targets** - Add inline edit or modal to adjust target values
4. **Visual Progress Bars** - Show actual/target ratios with color coding

---

## Part 2: Admin Panel for Custom KPI Fields

### New Database Tables

```text
NEW TABLE: custom_kpi_fields
  - id (uuid, primary key)
  - department (text) - Which department this field belongs to
  - field_name (text) - Display name of the field
  - field_type (enum) - 'date', 'currency', 'percentage', 'text', 'number'
  - field_order (integer) - Order in which to display
  - is_active (boolean)
  - created_at, updated_at

NEW TABLE: custom_kpi_values
  - id (uuid, primary key)
  - custom_field_id (uuid, FK to custom_kpi_fields)
  - employee_id (uuid, FK to employees)
  - period (text) - e.g., '2026-W05' for week or '2026-01' for month
  - value (text) - Stored as text, parsed based on field_type
  - created_at, updated_at
```

### Admin Panel Features

1. **Custom Fields Manager**
   - View existing custom fields per department
   - Add new fields (up to 5 per department)
   - Edit field name and type
   - Delete unused fields
   - Drag to reorder

2. **Excel Template Generator**
   - Download button generates XLSX with:
     - Standard KPI columns for the department
     - Custom field columns added dynamically
     - Employee rows pre-populated
   - Template updates automatically when custom fields change

3. **Excel Upload Processor**
   - File upload component with drag-drop
   - Validates data types (dates, currencies, percentages, etc.)
   - Shows preview of changes before applying
   - Displays validation errors clearly
   - Updates both standard and custom KPI values

---

## Implementation Steps

### Phase 1: Database Schema Updates

**Migration 1: Recruiter Activity Enhancements**
- Add `am_submissions`, `end_client_submissions`, `hired` columns to `recruiter_activities`

**Migration 2: KPI Targets Table**
- Create `kpi_targets` table for editable targets

**Migration 3: Custom Fields Tables**
- Create `custom_kpi_fields` and `custom_kpi_values` tables with proper enums

### Phase 2: New Hooks and Data Layer

**Files to Create:**
- `src/hooks/useKPITargets.ts` - CRUD for KPI targets
- `src/hooks/useCustomFields.ts` - Manage custom KPI field definitions
- `src/hooks/useCustomFieldValues.ts` - Store/retrieve custom field data
- `src/hooks/useRecruiterKPIs.ts` - Calculate the 6 new recruiter KPIs

### Phase 3: Enhanced Recruiters View

**Updates to `RecruitersView.tsx`:**
- Add 6 new KPI cards with progress indicators
- Create weekly breakdown table per recruiter
- Add editable target functionality with inline edit/modal
- Include trend indicators (vs last week)

**New Components:**
- `src/components/dashboard/KPIProgressCard.tsx` - Card with actual/target progress bar
- `src/components/dashboard/EditableTarget.tsx` - Inline editable target input
- `src/components/dashboard/RecruiterWeeklyTable.tsx` - Weekly stats breakdown

### Phase 4: Admin Panel

**New View:**
- `src/components/views/AdminView.tsx` - Main admin panel container

**New Components:**
- `src/components/admin/CustomFieldsManager.tsx` - CRUD for custom fields
- `src/components/admin/FieldTypeSelect.tsx` - Dropdown for field type selection
- `src/components/admin/ExcelTemplateDownload.tsx` - Generate and download XLSX
- `src/components/admin/ExcelUpload.tsx` - Upload and validate Excel data
- `src/components/admin/UploadPreview.tsx` - Preview changes before applying
- `src/components/admin/DepartmentTabs.tsx` - Tab navigation between departments

**Sidebar Update:**
- Add "Admin" navigation item with Settings icon

### Phase 5: Excel Template Generation

**Technology:**
- Use `xlsx` library (SheetJS) for Excel generation and parsing
- Client-side template generation (no server needed)

**Template Structure:**
```text
Row 1: Headers (Employee Name, KPI1, KPI2, ..., Custom1, Custom2, ...)
Row 2+: One row per employee with editable cells
```

**Features:**
- Date columns formatted as dates
- Currency columns with $ prefix
- Percentage columns with % suffix
- Validation rules embedded where possible

### Phase 6: Excel Upload Processing

**Validation Rules:**
- Date fields: Must be valid date format
- Currency: Must be numeric (strip $ and commas)
- Percentage: Must be 0-100 (strip %)
- Number: Must be numeric
- Text: Max 500 characters

**Error Handling:**
- Row-by-row validation
- Clear error messages with row/column reference
- Option to skip invalid rows or abort entire upload

---

## File Structure Summary

```text
src/
├── components/
│   ├── admin/
│   │   ├── CustomFieldsManager.tsx
│   │   ├── FieldTypeSelect.tsx
│   │   ├── ExcelTemplateDownload.tsx
│   │   ├── ExcelUpload.tsx
│   │   ├── UploadPreview.tsx
│   │   └── DepartmentTabs.tsx
│   ├── dashboard/
│   │   ├── KPIProgressCard.tsx (new)
│   │   ├── EditableTarget.tsx (new)
│   │   └── RecruiterWeeklyTable.tsx (new)
│   └── views/
│       ├── AdminView.tsx (new)
│       └── RecruitersView.tsx (update)
├── hooks/
│   ├── useKPITargets.ts (new)
│   ├── useCustomFields.ts (new)
│   ├── useCustomFieldValues.ts (new)
│   └── useRecruiterKPIs.ts (new)
└── lib/
    └── excelUtils.ts (new) - Excel generation/parsing helpers
```

---

## Technical Considerations

### Excel Library
- **xlsx (SheetJS)**: Most popular, works in browser, good documentation
- Install: `npm install xlsx`

### Custom Field Type Enum
```sql
CREATE TYPE custom_field_type AS ENUM (
  'date',
  'currency', 
  'percentage',
  'text',
  'number'
);
```

### Field Limit Enforcement
- Database constraint or application-level check
- Maximum 5 custom fields per department
- Clear error message when limit reached

### Data Integrity
- Foreign key constraints on all references
- RLS policies for authenticated users
- Validation triggers for field type consistency

---

## UI Mockup: Enhanced Recruiter KPIs

```text
+------------------------------------------------------------------+
| Recruiter Performance                                              |
| Daily activity tracking and KPI summary                            |
+------------------------------------------------------------------+

+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
| Open Pos | | Coverage | | AM Subs  | | EC Subs  | | Interviews| | Hired   |
|    12    | |   75%    | |    45    | |    32    | |    28    | |    5    |
| Target:15| |Target:80%| |Target:50 | |Target:40 | |Target:30 | |Target:8 |
| [====  ] | | [======] | | [=====]  | | [====  ] | | [=====]  | | [===  ] |
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+

+------------------------------------------------------------------+
| Weekly Stats by Recruiter                          [Edit Targets] |
+------------------------------------------------------------------+
| Recruiter    | Open Pos | Coverage | AM Sub | EC Sub | Int | Hired|
|--------------|----------|----------|--------|--------|-----|------|
| John Smith   |    5     |   80%    |   18   |   12   | 10  |  2   |
| Jane Doe     |    4     |   75%    |   15   |   10   |  8  |  1   |
| Mike Wilson  |    3     |   66%    |   12   |   10   | 10  |  2   |
+------------------------------------------------------------------+
```

---

## UI Mockup: Admin Panel

```text
+------------------------------------------------------------------+
| Admin Panel                                                        |
| Manage KPIs and Custom Fields                                      |
+------------------------------------------------------------------+

[Recruiters] [Account Managers] [Business Dev] [Operations] [Finance]

+------------------------------------------------------------------+
| Custom Fields for Recruiters                    [+ Add Field] (3/5)|
+------------------------------------------------------------------+
| #  | Field Name          | Type       | Actions                   |
|----|---------------------|------------|---------------------------|
| 1  | Client Feedback     | Text       | [Edit] [Delete]           |
| 2  | Bonus Amount        | Currency   | [Edit] [Delete]           |
| 3  | Attendance Rate     | Percentage | [Edit] [Delete]           |
+------------------------------------------------------------------+

+---------------------------+  +---------------------------+
| Download Excel Template   |  | Upload KPI Data           |
| [Download for Recruiters] |  | [Drop file here or click] |
+---------------------------+  +---------------------------+
```

---

## Security Considerations

- All new tables will have RLS enabled
- Only authenticated users can access admin features
- Excel uploads validated both client-side and server-side
- Custom field values sanitized before storage

