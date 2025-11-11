-- Grant admin role to the current demo user so RLS allows viewing all data
INSERT INTO public.user_roles (user_id, role)
VALUES ('c6df9f4b-04a3-46df-9fec-1c6a3fb31af0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;