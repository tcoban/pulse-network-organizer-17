-- Fix project_assignments policy to avoid referencing auth.users (causing permission denied)
DROP POLICY IF EXISTS "Team members can view their assignments" ON public.project_assignments;
CREATE POLICY "Team members can view their assignments"
ON public.project_assignments
FOR SELECT
USING (
  team_member_id IN (
    SELECT tm.id
    FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Ensure projects INSERT remains allowed for authenticated users (idempotent)
DROP POLICY IF EXISTS "Authenticated can create projects" ON public.projects;
CREATE POLICY "Authenticated can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (true);
