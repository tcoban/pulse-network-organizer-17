-- Fix failing goal updates/inserts caused by a stale trigger referencing a non-existent "targets" table
-- Safely drop the trigger and function if they exist

-- 1) Drop trigger on public.goals if present
DO $$
BEGIN
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
END $$;

-- 2) Drop the obsolete function if present
DROP FUNCTION IF EXISTS public.update_target_progress();

-- Notes:
-- - Other triggers like update_goals_updated_at and update_user_goals_updated_at are kept intact
-- - No schema changes to goals table; we are only removing the broken trigger/function that causes 42P01 errors
