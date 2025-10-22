-- Update user_goals RLS policies to allow admins to see and manage ALL goals
DROP POLICY IF EXISTS "Users can manage their own goals" ON user_goals;

CREATE POLICY "Users can view their own goals and admins can view all"
ON user_goals FOR SELECT
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert their own goals and admins can insert any"
ON user_goals FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own goals and admins can update any"
ON user_goals FOR UPDATE
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own goals and admins can delete any"
ON user_goals FOR DELETE
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

-- Update dashboard_priorities RLS to allow admins to see all
DROP POLICY IF EXISTS "Users can manage their own priorities" ON dashboard_priorities;

CREATE POLICY "Users can view their own priorities and admins can view all"
ON dashboard_priorities FOR SELECT
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert their own priorities and admins can insert any"
ON dashboard_priorities FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own priorities and admins can update any"
ON dashboard_priorities FOR UPDATE
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own priorities and admins can delete any"
ON dashboard_priorities FOR DELETE
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin')
);