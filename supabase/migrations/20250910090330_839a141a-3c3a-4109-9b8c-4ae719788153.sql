-- Keep only the 50 most enriched contacts with complete data
-- Fixed ORDER BY issue by adding the column to SELECT

WITH enriched_contacts AS (
  SELECT DISTINCT c.id, c.created_at
  FROM contacts c
  LEFT JOIN interactions i ON c.id = i.contact_id
  LEFT JOIN opportunities o ON c.id = o.contact_id  
  LEFT JOIN meeting_goals mg ON o.id = mg.opportunity_id
  WHERE (i.id IS NOT NULL OR o.id IS NOT NULL OR mg.id IS NOT NULL)
    AND c.notes IS NOT NULL 
    AND c.notes != ''
    AND c.company IS NOT NULL
    AND c.position IS NOT NULL
  ORDER BY c.created_at DESC
  LIMIT 50
),
contacts_to_keep AS (
  SELECT id FROM enriched_contacts
)
-- Delete related data first due to foreign key constraints
DELETE FROM meeting_goals 
WHERE opportunity_id IN (
  SELECT o.id FROM opportunities o 
  WHERE o.contact_id NOT IN (SELECT id FROM contacts_to_keep)
);

DELETE FROM opportunities 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM interactions 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM contact_social_links 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM contact_tags 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM contact_preferences 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM collaborations 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM event_participations 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

DELETE FROM dashboard_priorities 
WHERE contact_id NOT IN (SELECT id FROM contacts_to_keep);

-- Finally delete the contacts themselves
DELETE FROM contacts 
WHERE id NOT IN (SELECT id FROM contacts_to_keep);