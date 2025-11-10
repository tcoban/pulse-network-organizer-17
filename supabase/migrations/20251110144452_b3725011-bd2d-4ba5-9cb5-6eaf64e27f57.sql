-- Drop existing policy if it exists (Postgres doesn't support IF NOT EXISTS for CREATE POLICY)
DROP POLICY IF EXISTS "Users can self-assign to projects" ON project_assignments;
DROP POLICY IF EXISTS "Users can view their project assignments" ON project_assignments;

-- Allow authenticated users to self-assign themselves to projects
CREATE POLICY "Users can self-assign to projects"
ON project_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  team_member_id IN (
    SELECT tm.id FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Allow users to view their own project assignments
CREATE POLICY "Users can view their project assignments"
ON project_assignments
FOR SELECT
TO authenticated
USING (
  team_member_id IN (
    SELECT tm.id FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);