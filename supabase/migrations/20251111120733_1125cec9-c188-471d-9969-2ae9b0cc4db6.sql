
-- Comprehensive cleanup of remaining obsolete references from user_goals -> goals migration

-- 1. Drop the duplicate/obsolete trigger on goals table
-- There are two triggers: update_goals_updated_at (correct) and update_user_goals_updated_at (obsolete)
DROP TRIGGER IF EXISTS update_user_goals_updated_at ON goals;

-- 2. Rename the foreign key constraint to reflect the new table name
-- Currently: user_goals_linked_opportunity_id_fkey (obsolete name)
-- Should be: goals_linked_opportunity_id_fkey (correct name)
ALTER TABLE goals 
  DROP CONSTRAINT IF EXISTS user_goals_linked_opportunity_id_fkey;

ALTER TABLE goals
  ADD CONSTRAINT goals_linked_opportunity_id_fkey
  FOREIGN KEY (linked_opportunity_id)
  REFERENCES opportunities(id)
  ON DELETE SET NULL;

-- Verification queries (commented out, for reference):
-- SELECT tgname FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE c.relname = 'goals' AND t.tgisinternal = false;
-- SELECT conname FROM pg_constraint WHERE conrelid = 'goals'::regclass AND contype = 'f';
