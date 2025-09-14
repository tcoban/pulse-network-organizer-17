-- Update existing contacts to be assigned to team members instead of the generic profile
-- First, let's see if we can get some team member IDs
DO $$
DECLARE
    team_member_ids UUID[];
    contact_count INTEGER;
    assignment_index INTEGER := 0;
    contact_record RECORD;
BEGIN
    -- Get all team member IDs
    SELECT ARRAY(SELECT id FROM team_members WHERE is_active = true ORDER BY created_at) INTO team_member_ids;
    
    -- Get total contact count
    SELECT COUNT(*) INTO contact_count FROM contacts;
    
    -- Assign contacts to team members in round-robin fashion
    FOR contact_record IN SELECT id FROM contacts ORDER BY created_at LOOP
        UPDATE contacts 
        SET assigned_to = team_member_ids[(assignment_index % array_length(team_member_ids, 1)) + 1]
        WHERE id = contact_record.id;
        
        assignment_index := assignment_index + 1;
    END LOOP;
    
    RAISE NOTICE 'Assigned % contacts to % team members', contact_count, array_length(team_member_ids, 1);
END $$;