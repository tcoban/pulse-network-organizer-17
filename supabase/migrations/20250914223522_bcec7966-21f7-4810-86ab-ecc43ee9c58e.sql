-- Let's first check and drop ALL foreign key constraints related to assigned_to
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find and drop all foreign key constraints on contacts.assigned_to
    FOR r IN (
        SELECT conname FROM pg_constraint 
        WHERE conrelid = 'contacts'::regclass 
        AND contype = 'f' 
        AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'contacts'::regclass AND attname = 'assigned_to')
    ) LOOP
        EXECUTE 'ALTER TABLE contacts DROP CONSTRAINT ' || r.conname;
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Clear all existing assignments first
UPDATE contacts SET assigned_to = NULL;

-- Add the correct foreign key constraint to team_members
ALTER TABLE contacts ADD CONSTRAINT contacts_assigned_to_team_members_fkey 
FOREIGN KEY (assigned_to) REFERENCES team_members(id) ON DELETE SET NULL;

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
    
    RAISE NOTICE 'Found % team members and % contacts', array_length(team_member_ids, 1), contact_count;
    
    -- Only proceed if we have team members
    IF array_length(team_member_ids, 1) > 0 THEN
        -- Assign contacts to team members in round-robin fashion
        FOR contact_record IN SELECT id FROM contacts ORDER BY created_at LOOP
            UPDATE contacts 
            SET assigned_to = team_member_ids[(assignment_index % array_length(team_member_ids, 1)) + 1]
            WHERE id = contact_record.id;
            
            assignment_index := assignment_index + 1;
        END LOOP;
        
        RAISE NOTICE 'Successfully assigned % contacts to % team members', contact_count, array_length(team_member_ids, 1);
    ELSE
        RAISE NOTICE 'No team members found for assignment';
    END IF;
END $$;