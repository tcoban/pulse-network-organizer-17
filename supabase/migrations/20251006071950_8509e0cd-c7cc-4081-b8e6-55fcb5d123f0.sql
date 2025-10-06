-- Add indexes for faster contact queries
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contact ON contacts(last_contact);
CREATE INDEX IF NOT EXISTS idx_contacts_cooperation_rating ON contacts(cooperation_rating DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_potential_score ON contacts(potential_score DESC);

-- Add indexes for faster lookups on related tables
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_date ON opportunities(date);
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_offering ON contacts(assigned_to, offering) WHERE offering IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_lookingfor ON contacts(assigned_to, looking_for) WHERE looking_for IS NOT NULL;

-- Add index for event participations
CREATE INDEX IF NOT EXISTS idx_event_participations_contact_id ON event_participations(contact_id);
CREATE INDEX IF NOT EXISTS idx_event_participations_date ON event_participations(event_date DESC);

-- Add index for collaborations
CREATE INDEX IF NOT EXISTS idx_collaborations_contact_id ON collaborations(contact_id);

-- Add comments for documentation
COMMENT ON INDEX idx_contacts_assigned_to IS 'Speed up contact queries by assigned user';
COMMENT ON INDEX idx_contacts_last_contact IS 'Speed up follow-up queries';
COMMENT ON INDEX idx_contacts_cooperation_rating IS 'Speed up sorting by cooperation rating';
COMMENT ON INDEX idx_contacts_potential_score IS 'Speed up sorting by potential score';