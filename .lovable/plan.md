
# Plan: Role-Based Access Control, Password Reset, and Production Deployment

## Overview

This plan implements four major features to make your StaffTrack application production-ready:
1. **Role-Based Access Control (RBAC)** - Department-based permissions for 15-20 users
2. **Password Reset with Email Verification** - Secure password change for all users
3. **Production Deployment** - Vercel-ready configuration files
4. **Security Hardening** - Data protection and secure deployment practices

---

## Part 1: Role-Based Access Control (RBAC)

### Role & Permission Structure

| Role | Can View | Can Edit | Admin Access |
|------|----------|----------|--------------|
| Admin (Owner) | All departments | All departments | Yes |
| Account Manager | Dashboard, Clients, Jobs, AM Activities | Own activities only | No |
| Recruiter | Dashboard, Jobs, Recruiter Activities | Own activities only | No |
| Business Development | Dashboard, BD Prospects | Own prospects only | No |
| Operations Manager | Dashboard, Operations, Performance | Operations data | No |
| Finance | Dashboard, Finance, Clients (read-only) | Finance data only | No |

### Database Changes

**New Tables:**

```text
TABLE: user_roles
  - id (uuid, primary key)
  - user_id (uuid, FK to auth.users, cascade delete)
  - role (app_role enum)
  - department_access (text[]) - List of departments user can access
  - created_at, updated_at
  UNIQUE(user_id, role)

NEW ENUM: app_role
  - 'admin', 'account_manager', 'recruiter', 'business_dev', 'operations', 'finance', 'viewer'
```

**Security-Definer Function (prevents RLS recursion):**

```text
FUNCTION: has_role(user_id uuid, role app_role) -> boolean
  - Checks if user has specified role
  - Uses SECURITY DEFINER to bypass RLS

FUNCTION: get_user_departments(user_id uuid) -> text[]
  - Returns array of departments user can access
  - Used by RLS policies
```

**Updated RLS Policies:**

- Admin users: Full access to all tables
- Department users: Access based on `department_access` array
- All users: Read-only access to common reference data (employees list)

### Admin User Management Interface

**New Component: `UserManagement.tsx`**

- View all registered users
- Assign/remove roles per user
- Set department access permissions
- Deactivate user accounts (soft delete)

**Seeding Initial Admin:**

Your email `niramay@mintextech.com` will be set as the first admin via a database trigger that runs when this email signs up.

---

## Part 2: Password Reset with Email Verification

### Flow Diagram

```text
User Flow:
1. User clicks "Forgot Password?" on login page
2. Enters email address
3. System sends password reset email via Supabase Auth
4. User clicks link in email
5. Redirected to app with reset token
6. User enters new password
7. Password updated, user redirected to login

Profile Password Change:
1. Logged-in user goes to Settings
2. Clicks "Change Password"
3. System sends verification email
4. User clicks link in email
5. Enters new password
6. Password updated
```

### Implementation

**New Pages:**

- `ForgotPasswordPage.tsx` - Email input form for password reset
- `ResetPasswordPage.tsx` - New password form (handles reset token)
- `SettingsPage.tsx` - User profile with password change option

**Auth Context Updates:**

- `resetPassword(email)` - Sends reset email
- `updatePassword(newPassword)` - Updates password after token verification

**Routes:**

```text
/forgot-password - Forgot password form
/reset-password - Password reset form (with token)
/settings - User settings (includes password change)
```

---

## Part 3: Vercel Production Deployment

### New Configuration Files

**`vercel.json`** - Vercel deployment configuration:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### Environment Variables for Vercel

You will need to set these in Vercel dashboard:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (public) |

### Database Portability Notes

Since you may want to switch cloud database services later:

1. **All SQL migrations are standard PostgreSQL** - compatible with any PostgreSQL hosting (Railway, Neon, AWS RDS, etc.)
2. **Authentication is through Supabase Auth** - if switching, you'd need to migrate to another auth provider (Auth0, Firebase Auth, etc.)
3. **RLS policies are Supabase-specific** - would need equivalent row-level security in new provider

---

## Part 4: Security Hardening

### Password Security

- **No plaintext passwords stored** - Supabase Auth handles password hashing with bcrypt
- **Minimum password length**: 8 characters (enforced in UI and via Supabase settings)
- **Password strength indicator** - Visual feedback during signup/reset

### Frontend Security

**Environment Variables:**
- Only `VITE_` prefixed variables are exposed to browser
- Supabase anon key is designed to be public (RLS protects data)
- No secret keys in frontend code

**XSS Protection:**
- React's built-in escaping
- Content Security Policy headers

**Authentication Guards:**
- All protected routes check session validity
- Automatic redirect to login when session expires

### Backend Security (RLS Policies)

**Updated Policies by Table:**

| Table | Admin | Own Department | Other Users |
|-------|-------|----------------|-------------|
| employees | Full | Read only | Read only |
| clients | Full | Full (if AM) | Read only |
| jobs | Full | Full (if assigned) | Read only |
| invoices | Full | Full (if Finance) | No access |
| payments | Full | Full (if Finance) | No access |
| user_roles | Full | Read own role | No access |

### API Security

- All database calls go through authenticated Supabase client
- RLS ensures users can only access permitted data
- No direct database connection strings in frontend

### Audit Logging

**New Table: `audit_logs`**
- Tracks sensitive operations (role changes, password resets)
- Records user_id, action, timestamp, IP address (if available)

---

## Implementation Steps

### Phase 1: Database Schema Updates

**Migration includes:**
- Create `app_role` enum
- Create `user_roles` table with RLS
- Create `audit_logs` table
- Create security-definer functions (`has_role`, `get_user_departments`)
- Update all existing RLS policies to use role checks
- Create trigger to auto-assign admin role to `niramay@mintextech.com`

### Phase 2: Authentication Enhancements

**Files to Create:**
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/hooks/useUserRole.ts` - Fetch current user's role and permissions

**Files to Update:**
- `src/contexts/AuthContext.tsx` - Add password reset functions
- `src/pages/AuthPage.tsx` - Add "Forgot Password?" link
- `src/App.tsx` - Add new routes

### Phase 3: Admin User Management

**Files to Create:**
- `src/components/admin/UserManagement.tsx` - User list with role assignment
- `src/components/admin/RoleSelect.tsx` - Dropdown for role selection
- `src/components/admin/DepartmentAccessEditor.tsx` - Multi-select for departments

**Files to Update:**
- `src/components/views/AdminView.tsx` - Add User Management tab
- `src/components/layout/Sidebar.tsx` - Conditionally show menu items based on role

### Phase 4: Role-Based UI

**Files to Update:**
- `src/pages/Index.tsx` - Filter views based on user role
- `src/components/layout/Sidebar.tsx` - Show/hide nav items per role
- All view components - Add permission checks for edit/delete actions

### Phase 5: Vercel Configuration

**Files to Create:**
- `vercel.json` - Deployment configuration with security headers

**Files to Update:**
- `index.html` - Update title, meta tags for production
- `vite.config.ts` - Ensure production build settings

---

## File Structure Summary

```text
src/
├── contexts/
│   └── AuthContext.tsx (update - add password reset)
├── hooks/
│   └── useUserRole.ts (new - role checking)
├── pages/
│   ├── ForgotPasswordPage.tsx (new)
│   ├── ResetPasswordPage.tsx (new)
│   └── SettingsPage.tsx (new)
├── components/
│   ├── admin/
│   │   ├── UserManagement.tsx (new)
│   │   ├── RoleSelect.tsx (new)
│   │   └── DepartmentAccessEditor.tsx (new)
│   └── layout/
│       └── Sidebar.tsx (update - role-based nav)
└── App.tsx (update - add routes)

vercel.json (new)
```

---

## Supabase Changes Summary (for Portability)

All database changes are in standard PostgreSQL SQL:

```sql
-- Portable migrations you can run on any PostgreSQL database:

1. CREATE TYPE app_role AS ENUM (...)
2. CREATE TABLE user_roles (...)
3. CREATE TABLE audit_logs (...)
4. CREATE FUNCTION has_role(...) - Security definer
5. CREATE FUNCTION get_user_departments(...)
6. ALTER existing RLS policies to use role checks
7. INSERT admin role for niramay@mintextech.com (trigger-based)
```

If you migrate away from Supabase:
- Export the `auth.users` table data
- Set up equivalent authentication in new provider
- The `user_roles` and business tables transfer directly
- RLS policies would need recreation in new provider's syntax

---

## Security Checklist

- No passwords stored in code or logs
- Environment variables used for all secrets
- Row-Level Security on all tables
- Role checks on all sensitive operations
- Security headers configured for production
- HTTPS enforced by Vercel
- XSS protection via React and headers
- Audit logging for admin actions
- Session management via Supabase Auth
