-- Create comprehensive database schema for contact management system

-- Create enums for type safety
CREATE TYPE interaction_type AS ENUM ('meeting', 'call', 'email', 'coffee', 'event', 'other');
CREATE TYPE opportunity_type AS ENUM ('event', 'meeting', 'appointment', 'conference', 'other');
CREATE TYPE registration_status AS ENUM ('registered', 'considering', 'confirmed');
CREATE TYPE preferred_channel AS ENUM ('email', 'phone', 'linkedin', 'in-person', 'video-call', 'other');

-- Profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Contacts table
CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  avatar TEXT,
  notes TEXT DEFAULT '',
  last_contact TIMESTAMP WITH TIME ZONE,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referred_by TEXT,
  linkedin_connections TEXT[],
  current_projects TEXT,
  mutual_benefit TEXT,
  cooperation_rating INTEGER DEFAULT 3 CHECK (cooperation_rating >= 1 AND cooperation_rating <= 5),
  potential_score INTEGER DEFAULT 3 CHECK (potential_score >= 1 AND potential_score <= 5),
  affiliation TEXT,
  offering TEXT,
  looking_for TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact preferences table
CREATE TABLE public.contact_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'English',
  preferred_channel preferred_channel DEFAULT 'email',
  available_times TEXT,
  meeting_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact tags table (many-to-many relationship)
CREATE TABLE public.contact_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, tag)
);

-- Social links table
CREATE TABLE public.contact_social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, platform)
);

-- Interactions table for historical tracking
CREATE TABLE public.interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  outcome TEXT,
  contacted_by UUID REFERENCES public.profiles(id),
  channel TEXT,
  evaluation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  type opportunity_type NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT,
  registration_status registration_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting goals table
CREATE TABLE public.meeting_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participation history
CREATE TABLE public.event_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT,
  participation_type TEXT, -- attended, speaker, organizer, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Past collaborations table
CREATE TABLE public.collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  outcome TEXT,
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard priorities table
CREATE TABLE public.dashboard_priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  priority_type TEXT NOT NULL, -- scheduled_meeting, follow_up_action, introduction_opportunity
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Network intelligence trends
CREATE TABLE public.network_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  trend_score INTEGER DEFAULT 1,
  description TEXT,
  contacts_mentioned UUID[],
  date_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy calendar events
CREATE TABLE public.policy_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL, -- consultation, conference, deadline
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  relevant_contacts UUID[],
  importance_level INTEGER DEFAULT 3 CHECK (importance_level >= 1 AND importance_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for contacts (accessible to all authenticated users for collaboration)
CREATE POLICY "Authenticated users can view all contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (true);

-- RLS Policies for contact preferences
CREATE POLICY "Authenticated users can manage contact preferences" ON public.contact_preferences FOR ALL TO authenticated USING (true);

-- RLS Policies for contact tags
CREATE POLICY "Authenticated users can manage contact tags" ON public.contact_tags FOR ALL TO authenticated USING (true);

-- RLS Policies for social links
CREATE POLICY "Authenticated users can manage social links" ON public.contact_social_links FOR ALL TO authenticated USING (true);

-- RLS Policies for interactions
CREATE POLICY "Authenticated users can manage interactions" ON public.interactions FOR ALL TO authenticated USING (true);

-- RLS Policies for opportunities
CREATE POLICY "Authenticated users can manage opportunities" ON public.opportunities FOR ALL TO authenticated USING (true);

-- RLS Policies for meeting goals
CREATE POLICY "Authenticated users can manage meeting goals" ON public.meeting_goals FOR ALL TO authenticated USING (true);

-- RLS Policies for event participations
CREATE POLICY "Authenticated users can manage event participations" ON public.event_participations FOR ALL TO authenticated USING (true);

-- RLS Policies for collaborations
CREATE POLICY "Authenticated users can manage collaborations" ON public.collaborations FOR ALL TO authenticated USING (true);

-- RLS Policies for dashboard priorities
CREATE POLICY "Users can manage their own priorities" ON public.dashboard_priorities FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for network trends (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view network trends" ON public.network_trends FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage network trends" ON public.network_trends FOR ALL TO service_role USING (true);

-- RLS Policies for policy events (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view policy events" ON public.policy_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage policy events" ON public.policy_events FOR ALL TO service_role USING (true);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables with updated_at columns
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_preferences_updated_at BEFORE UPDATE ON public.contact_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON public.interactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meeting_goals_updated_at BEFORE UPDATE ON public.meeting_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON public.collaborations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_priorities_updated_at BEFORE UPDATE ON public.dashboard_priorities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policy_events_updated_at BEFORE UPDATE ON public.policy_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX contacts_assigned_to_idx ON public.contacts(assigned_to);
CREATE INDEX contacts_created_by_idx ON public.contacts(created_by);
CREATE INDEX contacts_email_idx ON public.contacts(email);
CREATE INDEX contacts_company_idx ON public.contacts(company);
CREATE INDEX contact_tags_tag_idx ON public.contact_tags(tag);
CREATE INDEX interactions_contact_id_idx ON public.interactions(contact_id);
CREATE INDEX interactions_date_idx ON public.interactions(date);
CREATE INDEX opportunities_contact_id_idx ON public.opportunities(contact_id);
CREATE INDEX opportunities_date_idx ON public.opportunities(date);
CREATE INDEX event_participations_contact_id_idx ON public.event_participations(contact_id);
CREATE INDEX collaborations_contact_id_idx ON public.collaborations(contact_id);
CREATE INDEX dashboard_priorities_user_id_idx ON public.dashboard_priorities(user_id);
CREATE INDEX policy_events_date_idx ON public.policy_events(date);