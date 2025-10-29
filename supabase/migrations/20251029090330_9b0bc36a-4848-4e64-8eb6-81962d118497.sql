-- Step 1: Remove user_id column from goals table (use assigned_to as single source of truth)
ALTER TABLE goals DROP COLUMN IF EXISTS user_id;

-- Step 2: Create trigger function to auto-update goal progress from meeting_goals
CREATE OR REPLACE FUNCTION update_goal_progress_from_meeting_goals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the goal's progress based on meeting_goals achievements
  UPDATE goals
  SET progress_percentage = (
    SELECT COALESCE(
      ROUND((COUNT(*) FILTER (WHERE achieved = true)::float / 
             NULLIF(COUNT(*), 0)) * 100)::INTEGER,
      0
    )
    FROM meeting_goals
    WHERE user_goal_id = COALESCE(NEW.user_goal_id, OLD.user_goal_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.user_goal_id, OLD.user_goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 3: Create trigger on meeting_goals to automatically update goal progress
DROP TRIGGER IF EXISTS update_goal_progress_from_meeting_goals_trigger ON meeting_goals;
CREATE TRIGGER update_goal_progress_from_meeting_goals_trigger
AFTER INSERT OR UPDATE OR DELETE ON meeting_goals
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress_from_meeting_goals();