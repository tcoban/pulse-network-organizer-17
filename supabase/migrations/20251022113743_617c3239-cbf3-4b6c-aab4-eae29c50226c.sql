-- First, drop the existing foreign key constraint on user_goals
ALTER TABLE user_goals DROP CONSTRAINT IF EXISTS user_goals_user_id_fkey;

-- Add foreign key to profiles table instead
ALTER TABLE user_goals 
ADD CONSTRAINT user_goals_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Now backfill any meeting_goals that don't have a user_goal_id by creating user_goals for them
-- Only for users that exist in profiles
INSERT INTO user_goals (user_id, title, description, category, status, progress_percentage)
SELECT 
  c.assigned_to as user_id,
  mg.description as title,
  'Created from meeting goal' as description,
  'meeting' as category,
  'active' as status,
  CASE WHEN mg.achieved THEN 100 ELSE 0 END as progress_percentage
FROM meeting_goals mg
JOIN opportunities o ON o.id = mg.opportunity_id
JOIN contacts c ON c.id = o.contact_id
JOIN profiles p ON p.id = c.assigned_to  -- Only for valid profiles
WHERE mg.user_goal_id IS NULL;

-- Update meeting_goals to link to the newly created user_goals
WITH new_goals AS (
  SELECT 
    mg.id as meeting_goal_id,
    ug.id as user_goal_id
  FROM meeting_goals mg
  JOIN opportunities o ON o.id = mg.opportunity_id
  JOIN contacts c ON c.id = o.contact_id
  JOIN user_goals ug ON ug.title = mg.description AND ug.user_id = c.assigned_to
  WHERE mg.user_goal_id IS NULL
)
UPDATE meeting_goals
SET user_goal_id = new_goals.user_goal_id
FROM new_goals
WHERE meeting_goals.id = new_goals.meeting_goal_id;

-- Create a trigger function that auto-creates user_goals when meeting_goals are inserted without one
CREATE OR REPLACE FUNCTION auto_create_user_goal_for_meeting()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_new_goal_id UUID;
BEGIN
  -- If user_goal_id is not provided, create a new user_goal
  IF NEW.user_goal_id IS NULL THEN
    -- Get the user_id from the contact assigned to this opportunity
    SELECT c.assigned_to INTO v_user_id
    FROM opportunities o
    JOIN contacts c ON c.id = o.contact_id
    WHERE o.id = NEW.opportunity_id;
    
    -- Only create if user exists in profiles
    IF v_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
      -- Create a new user_goal
      INSERT INTO user_goals (user_id, title, description, category, status, progress_percentage)
      VALUES (
        v_user_id,
        NEW.description,
        'Created from meeting opportunity',
        'meeting',
        'active',
        CASE WHEN NEW.achieved THEN 100 ELSE 0 END
      )
      RETURNING id INTO v_new_goal_id;
      
      -- Set the user_goal_id for this meeting_goal
      NEW.user_goal_id := v_new_goal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create user goals
DROP TRIGGER IF EXISTS trigger_auto_create_user_goal ON meeting_goals;
CREATE TRIGGER trigger_auto_create_user_goal
  BEFORE INSERT ON meeting_goals
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_goal_for_meeting();

-- Create trigger to update user_goal progress when meeting_goal is updated
DROP TRIGGER IF EXISTS trigger_update_user_goal_progress ON meeting_goals;
CREATE TRIGGER trigger_update_user_goal_progress
  AFTER INSERT OR UPDATE ON meeting_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_goal_progress();

-- Create trigger to update user_goal progress when meeting_goal is deleted
DROP TRIGGER IF EXISTS trigger_update_user_goal_progress_on_delete ON meeting_goals;
CREATE TRIGGER trigger_update_user_goal_progress_on_delete
  AFTER DELETE ON meeting_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_goal_progress_on_delete();