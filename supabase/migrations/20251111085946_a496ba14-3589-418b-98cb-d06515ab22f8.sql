-- Comprehensive cleanup of obsolete references to the removed `targets` table
-- This migration safely drops remaining triggers and functions that reference `targets`

-- 1) Drop any lingering triggers on goals/projects that referenced targets (guarded)
DO $$
BEGIN
  -- Drop a trigger named 'update_target_progress_trigger' on goals if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_target_progress_trigger'
      AND n.nspname = 'public'
      AND c.relname = 'goals'
  ) THEN
    EXECUTE 'DROP TRIGGER update_target_progress_trigger ON public.goals;';
  END IF;

  -- Drop a trigger named 'trigger_update_target_progress' on goals if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trigger_update_target_progress'
      AND n.nspname = 'public'
      AND c.relname = 'goals'
  ) THEN
    EXECUTE 'DROP TRIGGER trigger_update_target_progress ON public.goals;';
  END IF;

  -- Drop a trigger named 'update_project_progress_trigger' on projects if it exists
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_project_progress_trigger'
      AND n.nspname = 'public'
      AND c.relname = 'projects'
  ) THEN
    EXECUTE 'DROP TRIGGER update_project_progress_trigger ON public.projects;';
  END IF;
END $$;

-- 2) Drop any obsolete functions that reference the removed targets table
-- These functions are safe to drop and not used anymore
DROP FUNCTION IF EXISTS public.update_target_progress();
DROP FUNCTION IF EXISTS public.update_project_progress();
DROP FUNCTION IF EXISTS public.user_has_target_access(uuid, uuid);

-- Notes:
-- - The `targets` and `target_assignments` tables were previously dropped
-- - This ensures no future calls can accidentally reference the missing relation
-- - No changes to existing data or RLS on current tables
