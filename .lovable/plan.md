# Refactoring to Use `profiles` + `user_roles` Tables

## Status: ✅ Phase 1-2 Complete

### Completed
- ✅ Created `user_departments` table with `app_department` enum
- ✅ Migrated data from `user_profiles` to new structure
- ✅ Updated `handle_new_user` trigger to insert into `profiles`, `user_roles`, and `user_departments`
- ✅ Created `transfer_ownership` function for new schema
- ✅ Updated `useCurrentUser.ts` to query joined tables
- ✅ Updated `useTeamInvitations.ts` to check `profiles` instead of `user_profiles`
- ✅ Updated `AdminUsersList.tsx` for new structure

### Remaining (Phase 4 - Cleanup)
- [ ] Drop `user_profiles` table after confirming everything works
- [ ] Consider updating RLS role enum values in the future

## Architecture

```
+----------------+     +----------------+     +------------------+
|    profiles    |     |   user_roles   |     | user_departments |
+----------------+     +----------------+     +------------------+
| id (PK, FK)    |     | id (PK)        |     | id (PK)          |
| email          |     | user_id (FK)   |     | user_id (FK)     |
| full_name      |     | role (enum)    |     | department (enum)|
| avatar_url     |     | created_at     |     | is_owner         |
+----------------+     +----------------+     +------------------+
```

**Role Mapping** (DB → Frontend):
- `admin` → `admin`
- `facility_manager` → `manager`
- `housekeeper`, `maintenance`, `barman` → `staff`
