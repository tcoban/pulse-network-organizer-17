-- Use profiles instead of auth.users in access checks
CREATE OR REPLACE FUNCTION public.user_has_target_access(_user_id uuid, _target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    -- Direct target assignment
    SELECT 1 FROM target_assignments ta
    JOIN team_members tm ON tm.id = ta.team_member_id
    WHERE ta.target_id = _target_id
      AND tm.email = (SELECT email FROM profiles WHERE id = _user_id)
  ) OR EXISTS (
    -- Via project assignment
    SELECT 1 FROM targets t
    JOIN project_assignments pa ON pa.project_id = t.project_id
    JOIN team_members tm ON tm.id = pa.team_member_id
    WHERE t.id = _target_id
      AND tm.email = (SELECT email FROM profiles WHERE id = _user_id)
  ) OR public.has_role(_user_id, 'admin'::app_role)
$$;

-- goal_assignments: replace auth.users reference with profiles
DROP POLICY IF EXISTS "Team members can view their goal assignments" ON public.goal_assignments;
CREATE POLICY "Team members can view their goal assignments"
ON public.goal_assignments
FOR SELECT
USING (
  team_member_id IN (
    SELECT team_members.id
    FROM team_members
    WHERE team_members.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- target_assignments: replace auth.users reference with profiles
DROP POLICY IF EXISTS "Team members can view their target assignments" ON public.target_assignments;
CREATE POLICY "Team members can view their target assignments"
ON public.target_assignments
FOR SELECT
USING (
  team_member_id IN (
    SELECT team_members.id
    FROM team_members
    WHERE team_members.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Allow authenticated users to create projects (admin already has ALL)
DROP POLICY IF EXISTS "Authenticated can create projects" ON public.projects;
CREATE POLICY "Authenticated can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);