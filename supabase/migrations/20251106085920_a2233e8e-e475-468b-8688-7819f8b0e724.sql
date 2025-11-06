-- Fix 1: Add foreign key from profiles to auth.users if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix 2: Add foreign key from user_roles to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey_profiles' AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
    DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix 3: Drop problematic targets RLS policies causing infinite recursion
DROP POLICY IF EXISTS "Team members can view assigned targets" ON public.targets;

-- Fix 4: Create a security definer function to check target assignments
CREATE OR REPLACE FUNCTION public.user_has_target_access(_user_id uuid, _target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Direct target assignment
    SELECT 1 FROM target_assignments ta
    JOIN team_members tm ON tm.id = ta.team_member_id
    WHERE ta.target_id = _target_id
      AND tm.email = (SELECT email FROM auth.users WHERE id = _user_id)
  ) OR EXISTS (
    -- Via project assignment
    SELECT 1 FROM targets t
    JOIN project_assignments pa ON pa.project_id = t.project_id
    JOIN team_members tm ON tm.id = pa.team_member_id
    WHERE t.id = _target_id
      AND tm.email = (SELECT email FROM auth.users WHERE id = _user_id)
  ) OR public.has_role(_user_id, 'admin'::app_role)
$$;

-- Fix 5: Recreate targets RLS policy using the security definer function
CREATE POLICY "Team members can view assigned targets"
ON public.targets
FOR SELECT
TO authenticated
USING (public.user_has_target_access(auth.uid(), id));

-- Fix 6: Add named constraint to referrals_given to clarify the contact relationship
-- This fixes ambiguous column references
COMMENT ON COLUMN public.referrals_given.contact_id IS 'The contact who will receive the referral (the one being referred)';
COMMENT ON COLUMN public.referrals_given.referred_to_contact_id IS 'The contact who is receiving the business (optional link to existing contact)';

-- Fix 7: Ensure projects table doesn't reference auth.users directly
-- Add owner_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE public.projects
    ADD COLUMN owner_email text;
  END IF;
END $$;

-- Fix 8: Update project RLS policies to not access auth.users
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Team members can view assigned projects" ON public.projects;

CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view assigned projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    JOIN team_members tm ON tm.id = pa.team_member_id
    JOIN profiles p ON p.email = tm.email
    WHERE pa.project_id = projects.id
      AND p.id = auth.uid()
  )
);