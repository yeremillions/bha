-- Step 1: Add 'manager' as a new enum value (must be committed before use)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';