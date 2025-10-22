-- First, create missing user_goals for all meeting_goals that don't have them
-- Only for contacts with valid assigned_to users in profiles
INSERT INTO user_goals (user_id, title, description, category, status, progress_percentage)
SELECT DISTINCT
  c.assigned_to as user_id,
  mg.description as title,
  'Created from meeting opportunity' as description,
  'meeting' as category,
  'active' as status,
  CASE WHEN mg.achieved THEN 100 ELSE 0 END as progress_percentage
FROM meeting_goals mg
JOIN opportunities o ON o.id = mg.opportunity_id
JOIN contacts c ON c.id = o.contact_id
JOIN profiles p ON p.id = c.assigned_to
WHERE mg.user_goal_id IS NULL
ON CONFLICT DO NOTHING;

-- Link the meeting_goals to the newly created user_goals
UPDATE meeting_goals mg
SET user_goal_id = ug.id
FROM opportunities o, contacts c, user_goals ug
WHERE mg.opportunity_id = o.id
  AND o.contact_id = c.id
  AND ug.user_id = c.assigned_to
  AND ug.title = mg.description
  AND mg.user_goal_id IS NULL;