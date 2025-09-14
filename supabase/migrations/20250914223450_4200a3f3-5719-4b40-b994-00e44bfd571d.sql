-- First, clear all existing assignments to avoid foreign key constraint errors
UPDATE contacts SET assigned_to = NULL;

-- Now assign contacts to team members
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
    
    -- Only proceed if we have team members
    IF array_length(team_member_ids, 1) > 0 THEN
        -- Assign contacts to team members in round-robin fashion
        FOR contact_record IN SELECT id FROM contacts ORDER BY created_at LOOP
            UPDATE contacts 
            SET assigned_to = team_member_ids[(assignment_index % array_length(team_member_ids, 1)) + 1]
            WHERE id = contact_record.id;
            
            assignment_index := assignment_index + 1;
        END LOOP;
        
        RAISE NOTICE 'Assigned % contacts to % team members', contact_count, array_length(team_member_ids, 1);
    ELSE
        RAISE NOTICE 'No team members found for assignment';
    END IF;
END $$;