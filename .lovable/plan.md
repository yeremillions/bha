
# Refactoring to Use `profiles` + `user_roles` Tables

## Overview

This plan consolidates the database schema by removing the redundant `user_profiles` table and properly using the original `profiles` table for identity and `user_roles` table for permissions, following security best practices.

## Current State (Problems)

The database has evolved into a confusing state with **three overlapping tables**:

| Table | Purpose | Status |
|-------|---------|--------|
| `profiles` | Basic identity (name, email, avatar) | Original, unused by code |
| `user_profiles` | Identity + role + department + is_owner | Currently used, but duplicates `profiles` |
| `user_roles` | RBAC with `app_role` enum | Used only for RLS via `has_role()` |

**Issues**:
1. The `user_profiles` table stores roles directly, which is a security anti-pattern
2. The `profiles` table exists but is orphaned
3. The `user_roles` table uses a different enum (`admin`, `housekeeper`, etc.) than what the UI expects (`admin`, `manager`, `receptionist`, `staff`)
4. Department-based access control has no dedicated table

## Target Architecture

```text
+----------------+     +----------------+     +------------------+
|    profiles    |     |   user_roles   |     | user_departments |
+----------------+     +----------------+     +------------------+
| id (PK, FK)    |     | id (PK)        |     | id (PK)          |
| email          |     | user_id (FK)   |     | user_id (FK)     |
| full_name      |     | role (enum)    |     | department (enum)|
| avatar_url     |     | created_at     |     | is_owner         |
| created_at     |     +----------------+     | created_at       |
| updated_at     |                           +------------------+
+----------------+                           
```

**Key Benefits**:
- Roles in a separate table prevent privilege escalation
- Department access is separate from permissions
- Clear separation of concerns

---

## Implementation Plan

### Phase 1: Update Role Enum and Add Department Table

**Database Migration:**

1. Create a new `app_role` enum with the values the UI expects:
   - `admin`, `manager`, `receptionist`, `staff`

2. Create a `user_departments` table for department-based access:
   ```sql
   CREATE TYPE public.app_department AS ENUM (
     'management', 'reception', 'housekeeping', 
     'bar', 'maintenance', 'security'
   );
   
   CREATE TABLE public.user_departments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
     department app_department NOT NULL DEFAULT 'reception',
     is_owner BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

3. Enable RLS with policies that allow the `handle_new_user` trigger to insert

4. Migrate existing data from `user_profiles` to the new structure

5. Update the `handle_new_user` trigger to insert into:
   - `profiles` (identity)
   - `user_roles` (permission)
   - `user_departments` (department access)

### Phase 2: Update Frontend Hooks

**Files to modify:**

1. **`src/hooks/useCurrentUser.ts`**
   - Query `profiles` joined with `user_roles` and `user_departments`
   - Update the `UserProfile` interface to match the new structure
   - Update all role-checking functions to use the joined data

2. **`src/hooks/useAuth.tsx`**
   - Update `fetchUserRoles` to use the new enum values
   - Consider renaming `AppRole` type to match the new enum

3. **`src/hooks/useTeamInvitations.ts`**
   - Update email duplicate check to query `profiles` instead of `user_profiles`

4. **`src/hooks/useAcceptInvitation.ts`**
   - No changes needed (metadata is read by trigger)

5. **`src/components/settings/AdminUsersList.tsx`**
   - Update queries to join the new tables

### Phase 3: Update RLS Policies

1. Update `has_role()` function to support the new role values
2. Add policies to `user_departments` for proper access control
3. Ensure the trigger can insert during signup (SECURITY DEFINER)

### Phase 4: Cleanup

1. Drop the `user_profiles` table after data migration
2. Update the old `app_role` enum or replace it

---

## Technical Details

### New Database Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role;
  v_department app_department;
BEGIN
  -- Insert into profiles (identity)
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Determine role from metadata (default to 'staff')
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'staff'::app_role
  );
  
  -- Insert into user_roles (permissions)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);
  
  -- Determine department from metadata (default to 'reception')
  v_department := COALESCE(
    (NEW.raw_user_meta_data->>'department')::app_department,
    'reception'::app_department
  );
  
  -- Insert into user_departments (department access)
  INSERT INTO public.user_departments (user_id, department)
  VALUES (NEW.id, v_department);
  
  RETURN NEW;
END;
$$;
```

### Updated useCurrentUser Query

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select(`
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    updated_at,
    user_roles!inner(role),
    user_departments!inner(department, is_owner)
  `)
  .eq('id', user.id)
  .single();
```

### Updated UserProfile Interface

```typescript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;          // From user_roles join
  department: Department;   // From user_departments join
  is_owner: boolean;        // From user_departments join
  created_at: string;
  updated_at: string;
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Create `user_departments` table, update enum, migrate data |
| `src/hooks/useCurrentUser.ts` | Modify | Query joined tables, update interfaces |
| `src/hooks/useAuth.tsx` | Modify | Update `AppRole` type to match new enum |
| `src/hooks/useTeamInvitations.ts` | Modify | Check `profiles` instead of `user_profiles` |
| `src/components/settings/AdminUsersList.tsx` | Modify | Update queries for new structure |

---

## Migration Safety

The migration will:
1. Create the new `user_departments` table first
2. Copy existing data from `user_profiles` to the new structure
3. Update the trigger to use the new tables
4. Only drop `user_profiles` after confirming the new structure works

This approach ensures no data loss and allows rollback if issues arise.
