-- =============================================
-- PHASE 1: CREATE PROJECTS HIERARCHY SYSTEM
-- =============================================

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'fundraising', 'partnership', 'networking', 'policy'
  status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'active', 'paused', 'completed'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  owner_id UUID REFERENCES team_members(id),
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create project_assignments table (multiple team members per project)
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'contributor', -- 'lead', 'contributor', 'observer'
  assigned_by UUID REFERENCES team_members(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, team_member_id)
);

ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Create targets table (intermediate level between projects and goals)
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- Create target_assignments table
CREATE TABLE target_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES targets(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES team_members(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, team_member_id)
);

ALTER TABLE target_assignments ENABLE ROW LEVEL SECURITY;

-- Rename user_goals to goals
ALTER TABLE user_goals RENAME TO goals;

-- Add new columns to goals table
ALTER TABLE goals ADD COLUMN target_id UUID REFERENCES targets(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN assigned_to UUID REFERENCES team_members(id);

-- Create goal_assignments table (multiple team members per goal)
CREATE TABLE goal_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES team_members(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, team_member_id)
);

ALTER TABLE goal_assignments ENABLE ROW LEVEL SECURITY;

-- Add assigned_to to meeting_goals
ALTER TABLE meeting_goals ADD COLUMN assigned_to UUID REFERENCES team_members(id);

-- =============================================
-- PHASE 2: RLS POLICIES
-- =============================================

-- Projects RLS Policies
CREATE POLICY "Admins can manage all projects"
ON projects FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view assigned projects"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_assignments
    WHERE project_assignments.project_id = projects.id
    AND project_assignments.team_member_id IN (
      SELECT id FROM team_members WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

-- Project Assignments RLS
CREATE POLICY "Admins can manage project assignments"
ON project_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view their assignments"
ON project_assignments FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM team_members WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Targets RLS Policies
CREATE POLICY "Admins can manage all targets"
ON targets FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view assigned targets"
ON targets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM target_assignments
    WHERE target_assignments.target_id = targets.id
    AND target_assignments.team_member_id IN (
      SELECT id FROM team_members WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  ) OR
  EXISTS (
    SELECT 1 FROM project_assignments pa
    JOIN targets t ON t.project_id = pa.project_id
    WHERE t.id = targets.id
    AND pa.team_member_id IN (
      SELECT id FROM team_members WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

-- Target Assignments RLS
CREATE POLICY "Admins can manage target assignments"
ON target_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view their target assignments"
ON target_assignments FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM team_members WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Update Goals RLS Policies (now that table is renamed)
DROP POLICY IF EXISTS "Users can view their own goals and admins can view all" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals and admins can insert any" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals and admins can update any" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals and admins can delete any" ON goals;

CREATE POLICY "Admins can view all goals"
ON goals FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view assigned goals"
ON goals FOR SELECT
USING (
  assigned_to IN (
    SELECT id FROM team_members WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  ) OR
  EXISTS (
    SELECT 1 FROM goal_assignments
    WHERE goal_assignments.goal_id = goals.id
    AND goal_assignments.team_member_id IN (
      SELECT id FROM team_members WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Admins can manage all goals"
ON goals FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can update their assigned goals"
ON goals FOR UPDATE
USING (
  assigned_to IN (
    SELECT id FROM team_members WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Goal Assignments RLS
CREATE POLICY "Admins can manage goal assignments"
ON goal_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Team members can view their goal assignments"
ON goal_assignments FOR SELECT
USING (
  team_member_id IN (
    SELECT id FROM team_members WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- =============================================
-- PHASE 3: AUTO-UPDATE TRIGGERS
-- =============================================

-- Function to update target progress from goals
CREATE OR REPLACE FUNCTION update_target_progress()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE targets
  SET progress_percentage = (
    SELECT COALESCE(
      ROUND(AVG(progress_percentage))::INTEGER,
      0
    )
    FROM goals
    WHERE target_id = COALESCE(NEW.target_id, OLD.target_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.target_id, OLD.target_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating target progress
CREATE TRIGGER trigger_update_target_progress
AFTER INSERT OR UPDATE OR DELETE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_target_progress();

-- Function to update project progress from targets
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE projects
  SET current_value = (
    SELECT COALESCE(
      ROUND(AVG(progress_percentage))::INTEGER,
      0
    )
    FROM targets
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating project progress
CREATE TRIGGER trigger_update_project_progress
AFTER INSERT OR UPDATE OR DELETE ON targets
FOR EACH ROW
EXECUTE FUNCTION update_project_progress();

-- Update triggers for updated_at columns
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();