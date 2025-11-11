-- Fix meeting_goals to work with the new goals table instead of the old user_goals table

-- 1. Drop obsolete triggers that reference user_goals
DROP TRIGGER IF EXISTS trigger_auto_create_user_goal ON meeting_goals;
DROP TRIGGER IF EXISTS trigger_update_user_goal_progress ON meeting_goals;
DROP TRIGGER IF EXISTS trigger_update_user_goal_progress_on_delete ON meeting_goals;

-- 2. Drop obsolete functions
DROP FUNCTION IF EXISTS auto_create_user_goal_for_meeting();
DROP FUNCTION IF EXISTS update_user_goal_progress();
DROP FUNCTION IF EXISTS update_user_goal_progress_on_delete();

-- 3. Update the foreign key to reference goals table instead of user_goals
ALTER TABLE meeting_goals DROP CONSTRAINT IF EXISTS meeting_goals_user_goal_id_fkey;
ALTER TABLE meeting_goals 
  ADD CONSTRAINT meeting_goals_user_goal_id_fkey 
  FOREIGN KEY (user_goal_id) REFERENCES goals(id) ON DELETE SET NULL;

-- 4. Update any existing meeting_goals that have invalid user_goal_id references
UPDATE meeting_goals
SET user_goal_id = NULL
WHERE user_goal_id IS NOT NULL 
  AND user_goal_id NOT IN (SELECT id FROM goals);

-- Note: meeting_goals.user_goal_id now properly references goals.id
-- The application will handle linking goals to meetings through this foreign key