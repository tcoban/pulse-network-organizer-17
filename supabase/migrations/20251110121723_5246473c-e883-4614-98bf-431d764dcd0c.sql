-- Remove targets concept and link goals directly to projects

-- Drop target-related tables
DROP TABLE IF EXISTS target_assignments CASCADE;
DROP TABLE IF EXISTS targets CASCADE;

-- Update goals table to reference projects directly instead of targets
ALTER TABLE goals DROP COLUMN IF EXISTS target_id;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Update goals table to ensure project_id is properly indexed
CREATE INDEX IF NOT EXISTS idx_goals_project_id ON goals(project_id);

-- Update RLS policies for goals to include project-based access
DROP POLICY IF EXISTS "Team members can view their assigned goals" ON goals;
CREATE POLICY "Team members can view their assigned goals"
ON goals
FOR SELECT
USING (
  -- Can view if assigned to the goal
  assigned_to IN (
    SELECT tm.id FROM team_members tm
    WHERE tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Can view if assigned via goal_assignments
  EXISTS (
    SELECT 1 FROM goal_assignments ga
    JOIN team_members tm ON tm.id = ga.team_member_id
    WHERE ga.goal_id = goals.id 
    AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Can view if assigned to the project
  EXISTS (
    SELECT 1 FROM project_assignments pa
    JOIN team_members tm ON tm.id = pa.team_member_id
    WHERE pa.project_id = goals.project_id
    AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);