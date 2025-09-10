-- Update the existing profile to have proper name
UPDATE profiles 
SET first_name = 'Team', last_name = 'Member'
WHERE id = '5cd7e66a-3640-444a-bb4d-e4b46663ff33';

-- Assign all unassigned contacts to the existing team member
UPDATE contacts 
SET assigned_to = '5cd7e66a-3640-444a-bb4d-e4b46663ff33'
WHERE assigned_to IS NULL;