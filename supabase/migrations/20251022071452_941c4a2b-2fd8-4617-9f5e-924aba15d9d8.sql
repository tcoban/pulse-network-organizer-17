-- Create M365 sync tracking table
CREATE TABLE public.m365_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('contacts', 'calendar', 'email')),
  last_sync_at TIMESTAMPTZ,
  delta_token TEXT,
  sync_errors JSONB DEFAULT '[]'::jsonb,
  is_mock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Outlook contact mapping table
CREATE TABLE public.outlook_contact_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  outlook_contact_id TEXT UNIQUE NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('from_outlook', 'to_outlook', 'bidirectional')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email interactions table
CREATE TABLE public.email_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  outlook_message_id TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  subject TEXT,
  sentiment_score INTEGER CHECK (sentiment_score >= -5 AND sentiment_score <= 5),
  response_received BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlook_event_id TEXT UNIQUE NOT NULL,
  contact_ids UUID[] DEFAULT ARRAY[]::UUID[],
  event_title TEXT NOT NULL,
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_prep_sent BOOLEAN DEFAULT false,
  outcome_captured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.m365_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlook_contact_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for m365_sync_status
CREATE POLICY "Users can view their own sync status"
ON public.m365_sync_status
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync status"
ON public.m365_sync_status
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for outlook_contact_mappings
CREATE POLICY "Users can view outlook mappings for their contacts"
ON public.outlook_contact_mappings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = outlook_contact_mappings.contact_id
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can manage outlook mappings for their contacts"
ON public.outlook_contact_mappings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = outlook_contact_mappings.contact_id
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- RLS Policies for email_interactions
CREATE POLICY "Users can view email interactions for their contacts"
ON public.email_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = email_interactions.contact_id
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can manage email interactions for their contacts"
ON public.email_interactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contacts
    WHERE contacts.id = email_interactions.contact_id
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- RLS Policies for calendar_events
CREATE POLICY "Authenticated users can view calendar events"
ON public.calendar_events
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage calendar events"
ON public.calendar_events
FOR ALL
USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_m365_sync_status_updated_at
BEFORE UPDATE ON public.m365_sync_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();