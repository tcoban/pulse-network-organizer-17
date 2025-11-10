-- Add INSERT policy for goals so users can create goals linked to projects
CREATE POLICY "Users can create goals"
ON goals
FOR INSERT
TO authenticated
WITH CHECK (
  -- Users can create goals if they are admins
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- OR if they are assigned to the project (via project_assignments)
  (
    project_id IS NULL 
    OR EXISTS (
      SELECT 1
      FROM project_assignments pa
      JOIN team_members tm ON tm.id = pa.team_member_id
      WHERE pa.project_id = goals.project_id
      AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
  OR
  -- OR if they are directly assigned to the goal
  assigned_to IN (
    SELECT tm.id FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);