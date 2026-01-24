-- Restore admin role for yeremiakpan@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('7d4cf6e7-f15c-4a3f-8f5a-c023f253dac4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure department entry exists
INSERT INTO public.user_departments (user_id, department, is_owner)
VALUES ('7d4cf6e7-f15c-4a3f-8f5a-c023f253dac4', 'management', false)
ON CONFLICT (user_id) DO NOTHING;