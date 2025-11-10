-- Update RLS policy to allow updating goals when user is assigned to the goal or to the linked project

DROP POLICY IF EXISTS "Team members can update their assigned goals" ON public.goals;

CREATE POLICY "Team members can update accessible goals"
ON public.goals
FOR UPDATE
USING (
  -- Allow update attempt; final permission checked in WITH CHECK
  true
)
WITH CHECK (
  -- Admins can always update
  public.has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Direct assignment on the goal
  (assigned_to IN (
    SELECT tm.id FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  ))
  OR
  -- Via goal_assignments
  EXISTS (
    SELECT 1 FROM goal_assignments ga
    JOIN team_members tm ON tm.id = ga.team_member_id
    WHERE ga.goal_id = goals.id
      AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Via project assignment on the (new) project_id after update
  EXISTS (
    SELECT 1 FROM project_assignments pa
    JOIN team_members tm ON tm.id = pa.team_member_id
    WHERE pa.project_id = goals.project_id
      AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);
