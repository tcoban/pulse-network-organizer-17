-- Add user_goal_id to meeting_goals table to link meeting goals with strategic user goals
ALTER TABLE meeting_goals 
ADD COLUMN user_goal_id uuid REFERENCES user_goals(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_meeting_goals_user_goal ON meeting_goals(user_goal_id);

-- Auto-progress calculation trigger function
CREATE OR REPLACE FUNCTION update_user_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_goal_id IS NOT NULL THEN
    UPDATE user_goals
    SET progress_percentage = (
      SELECT COALESCE(
        ROUND((COUNT(*) FILTER (WHERE achieved = true)::float / 
               NULLIF(COUNT(*), 0)) * 100)::integer,
        0
      )
      FROM meeting_goals
      WHERE user_goal_id = NEW.user_goal_id
    ),
    updated_at = NOW()
    WHERE id = NEW.user_goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update user goal progress when meeting goals are achieved
CREATE TRIGGER trigger_update_user_goal_progress
AFTER INSERT OR UPDATE OF achieved, user_goal_id ON meeting_goals
FOR EACH ROW
WHEN (NEW.user_goal_id IS NOT NULL)
EXECUTE FUNCTION update_user_goal_progress();

-- Also update when meeting goals are deleted
CREATE OR REPLACE FUNCTION update_user_goal_progress_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.user_goal_id IS NOT NULL THEN
    UPDATE user_goals
    SET progress_percentage = (
      SELECT COALESCE(
        ROUND((COUNT(*) FILTER (WHERE achieved = true)::float / 
               NULLIF(COUNT(*), 0)) * 100)::integer,
        0
      )
      FROM meeting_goals
      WHERE user_goal_id = OLD.user_goal_id
    ),
    updated_at = NOW()
    WHERE id = OLD.user_goal_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_user_goal_progress_on_delete
AFTER DELETE ON meeting_goals
FOR EACH ROW
WHEN (OLD.user_goal_id IS NOT NULL)
EXECUTE FUNCTION update_user_goal_progress_on_delete();