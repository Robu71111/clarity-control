

# Plan: Fix Admin Role Assignment for Existing User

## Problem Identified

Your user `niramay@mintextech.com` was created **before** the RBAC migration was applied, so the trigger never fired. Additionally, triggers on `auth.users` table in Supabase require special handling.

## Solution

We need to:
1. **Manually insert the admin role** for your existing user via a database migration
2. **Update the trigger** to use a more reliable approach that works in Lovable Cloud

---

## Implementation

### Database Migration

We will create a migration that:

1. **Directly inserts the admin role** for your existing user:
```sql
INSERT INTO public.user_roles (user_id, role, department_access)
SELECT id, 'admin', ARRAY['Recruiter', 'Account Manager', 'Business Development', 'Operations Manager', 'Finance']
FROM auth.users
WHERE email = 'niramay@mintextech.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

2. **Recreates the trigger** with proper error handling to work for future signups

---

## Changes Required

### New Migration File

A single SQL migration that:
- Inserts the admin role for your existing user (niramay@mintextech.com)
- Ensures the trigger is properly set up for future admin email signups

---

## After Implementation

Once the migration runs:
- You will immediately have admin access
- The sidebar will show all navigation items
- You can access the Admin panel and User Management
- Future signups with the admin email will also get the role automatically

