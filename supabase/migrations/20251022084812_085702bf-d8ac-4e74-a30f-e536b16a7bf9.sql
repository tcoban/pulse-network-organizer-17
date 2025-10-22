-- Check if registration_status enum exists, create if not
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('considering', 'registered', 'confirmed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to existing opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS synced_to_calendar BOOLEAN DEFAULT FALSE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Update meeting_goals table to add related_project column if not exists
ALTER TABLE meeting_goals ADD COLUMN IF NOT EXISTS related_project TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_date ON opportunities(date);
CREATE INDEX IF NOT EXISTS idx_opportunities_calendar_event_id ON opportunities(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_goals_opportunity_id ON meeting_goals(opportunity_id);

-- Update RLS policies for opportunities (replace existing)
DROP POLICY IF EXISTS "Authenticated users can manage opportunities" ON opportunities;

CREATE POLICY "Users can view opportunities for their assigned contacts"
  ON opportunities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = opportunities.contact_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can create opportunities for their assigned contacts"
  ON opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = opportunities.contact_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can update opportunities for their assigned contacts"
  ON opportunities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = opportunities.contact_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can delete opportunities for their assigned contacts"
  ON opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = opportunities.contact_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Update RLS policies for meeting_goals (replace existing)
DROP POLICY IF EXISTS "Authenticated users can manage meeting goals" ON meeting_goals;

CREATE POLICY "Users can view meeting goals for accessible opportunities"
  ON meeting_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM opportunities 
      JOIN contacts ON contacts.id = opportunities.contact_id
      WHERE opportunities.id = meeting_goals.opportunity_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can manage meeting goals for accessible opportunities"
  ON meeting_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM opportunities 
      JOIN contacts ON contacts.id = opportunities.contact_id
      WHERE opportunities.id = meeting_goals.opportunity_id 
      AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Add opportunity_type and source columns to calendar_events for display
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS opportunity_type opportunity_type;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'm365_sync';