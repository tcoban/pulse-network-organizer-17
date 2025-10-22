-- Update all contacts that are assigned to non-existent team members
-- Assign them to the first valid team member
UPDATE contacts c
SET assigned_to = (SELECT id FROM team_members WHERE is_active = true ORDER BY created_at ASC LIMIT 1)
WHERE c.assigned_to IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.id = c.assigned_to);

-- Now create the user_goal for your account specifically
-- Get your user_id from profiles and create goals for meeting_goals
INSERT INTO user_goals (user_id, title, description, category, status, progress_percentage)
SELECT DISTINCT
  p.id as user_id,
  mg.description as title,
  'Created from meeting opportunity' as description,
  'meeting' as category,
  'active' as status,
  CASE WHEN mg.achieved THEN 100 ELSE 0 END as progress_percentage
FROM meeting_goals mg
JOIN opportunities o ON o.id = mg.opportunity_id
JOIN contacts c ON c.id = o.contact_id
CROSS JOIN profiles p  -- Get the current user's profile
WHERE mg.user_goal_id IS NULL
ON CONFLICT DO NOTHING;

-- Link the meeting_goals to the newly created user_goals
UPDATE meeting_goals mg
SET user_goal_id = ug.id
FROM opportunities o, contacts c, user_goals ug, profiles p
WHERE mg.opportunity_id = o.id
  AND o.contact_id = c.id
  AND ug.user_id = p.id
  AND ug.title = mg.description
  AND mg.user_goal_id IS NULL;