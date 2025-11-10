-- Check and drop triggers that reference the non-existent targets table
-- Drop the trigger on goals table that tries to update targets
DROP TRIGGER IF EXISTS update_target_progress_trigger ON goals;
DROP TRIGGER IF EXISTS update_targets_on_goal_change ON goals;

-- Drop the trigger on projects table that tries to update targets
DROP TRIGGER IF EXISTS update_project_progress_trigger ON projects;
DROP TRIGGER IF EXISTS update_targets_on_project_change ON projects;

-- These functions reference the non-existent targets table, but we'll keep them
-- in case the targets table is added in the future. They won't cause issues
-- now that the triggers are removed.