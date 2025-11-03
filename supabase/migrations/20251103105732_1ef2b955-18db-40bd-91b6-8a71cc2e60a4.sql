-- Phase 1: Referral Tracking System
CREATE TABLE IF NOT EXISTS public.referrals_given (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  given_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  referred_to_contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  referred_to_name TEXT,
  referred_to_company TEXT,
  service_description TEXT NOT NULL,
  estimated_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
  outcome_notes TEXT,
  closed_value NUMERIC DEFAULT 0,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals_received (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  service_description TEXT NOT NULL,
  estimated_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'lost')),
  outcome_notes TEXT,
  closed_value NUMERIC DEFAULT 0,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.introduction_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduced_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_a_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  contact_b_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  introduction_reason TEXT NOT NULL,
  match_confidence INTEGER CHECK (match_confidence >= 0 AND match_confidence <= 100),
  outcome TEXT CHECK (outcome IN ('pending', 'meeting_scheduled', 'meeting_completed', 'business_generated', 'no_response', 'not_interested')),
  business_value NUMERIC DEFAULT 0,
  feedback_a TEXT,
  feedback_b TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 2: GAINS Meeting Framework
CREATE TABLE IF NOT EXISTS public.gains_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  goals TEXT,
  accomplishments TEXT,
  interests TEXT,
  networks TEXT,
  skills TEXT,
  target_market TEXT,
  ideal_referral TEXT,
  how_to_help TEXT,
  preparation_notes TEXT,
  follow_up_actions JSONB DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 3: Weekly Commitment System
CREATE TABLE IF NOT EXISTS public.weekly_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  target_one_to_ones INTEGER DEFAULT 2,
  completed_one_to_ones INTEGER DEFAULT 0,
  target_referrals_given INTEGER DEFAULT 1,
  completed_referrals_given INTEGER DEFAULT 0,
  target_visibility_days INTEGER DEFAULT 1,
  completed_visibility_days INTEGER DEFAULT 0,
  target_follow_ups INTEGER DEFAULT 5,
  completed_follow_ups INTEGER DEFAULT 0,
  streak_weeks INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Phase 4: Network Value Tracking
CREATE TABLE IF NOT EXISTS public.contact_network_value (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_referrals_given INTEGER DEFAULT 0,
  total_referrals_received INTEGER DEFAULT 0,
  total_business_generated NUMERIC DEFAULT 0,
  total_business_received NUMERIC DEFAULT 0,
  reciprocity_score NUMERIC DEFAULT 0,
  relationship_strength INTEGER DEFAULT 0 CHECK (relationship_strength >= 0 AND relationship_strength <= 100),
  lifetime_value NUMERIC DEFAULT 0,
  last_interaction_date TIMESTAMP WITH TIME ZONE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 5: Touch Point Automation
CREATE TABLE IF NOT EXISTS public.touch_point_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('high_value', 'medium_value', 'low_value', 'nurture', 'reactivation')),
  frequency_days INTEGER NOT NULL,
  preferred_channels TEXT[] DEFAULT ARRAY['email']::TEXT[],
  next_touch_date DATE NOT NULL,
  last_touch_date DATE,
  touch_count INTEGER DEFAULT 0,
  template_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.touch_point_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'phone', 'linkedin', 'in_person')),
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  category TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 6: BNI Chapter Management
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_name TEXT NOT NULL,
  meeting_day TEXT CHECK (meeting_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meeting_time TIME,
  meeting_location TEXT,
  chapter_director UUID REFERENCES public.team_members(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  industry_category TEXT NOT NULL,
  joined_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chapter_id, team_member_id)
);

CREATE TABLE IF NOT EXISTS public.chapter_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  meeting_date DATE NOT NULL,
  attendance JSONB DEFAULT '[]'::jsonb,
  referrals_given INTEGER DEFAULT 0,
  total_business_value NUMERIC DEFAULT 0,
  spotlight_member UUID REFERENCES public.team_members(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 7: Referral Slips
CREATE TABLE IF NOT EXISTS public.referral_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals_given(id) ON DELETE CASCADE NOT NULL,
  slip_number TEXT NOT NULL UNIQUE,
  qr_code_data TEXT,
  pdf_url TEXT,
  printed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.referrals_given ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introduction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gains_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_network_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touch_point_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touch_point_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_slips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals_given
CREATE POLICY "Users can manage their own referrals given"
  ON public.referrals_given
  FOR ALL
  USING (auth.uid() = given_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals_received
CREATE POLICY "Users can manage their own referrals received"
  ON public.referrals_received
  FOR ALL
  USING (auth.uid() = received_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for introduction_outcomes
CREATE POLICY "Users can manage introductions they made"
  ON public.introduction_outcomes
  FOR ALL
  USING (auth.uid() = introduced_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for gains_meetings
CREATE POLICY "Users can manage GAINS meetings they conducted"
  ON public.gains_meetings
  FOR ALL
  USING (auth.uid() = conducted_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for weekly_commitments
CREATE POLICY "Users can manage their own commitments"
  ON public.weekly_commitments
  FOR ALL
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_network_value
CREATE POLICY "Users can view network value for their contacts"
  ON public.contact_network_value
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_network_value.contact_id 
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "System can update network value"
  ON public.contact_network_value
  FOR ALL
  USING (true);

-- RLS Policies for touch_point_strategies
CREATE POLICY "Users can manage touch points for their contacts"
  ON public.touch_point_strategies
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = touch_point_strategies.contact_id 
    AND (contacts.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'))
  ));

-- RLS Policies for touch_point_templates
CREATE POLICY "Users can view all templates"
  ON public.touch_point_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own templates"
  ON public.touch_point_templates
  FOR ALL
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- RLS Policies for chapters
CREATE POLICY "Admins can manage chapters"
  ON public.chapters
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active chapters"
  ON public.chapters
  FOR SELECT
  USING (active = true);

-- RLS Policies for chapter_members
CREATE POLICY "Admins can manage chapter members"
  ON public.chapter_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view chapter members"
  ON public.chapter_members
  FOR SELECT
  USING (true);

-- RLS Policies for chapter_meetings
CREATE POLICY "Admins can manage chapter meetings"
  ON public.chapter_meetings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view chapter meetings"
  ON public.chapter_meetings
  FOR SELECT
  USING (true);

-- RLS Policies for referral_slips
CREATE POLICY "Users can view their referral slips"
  ON public.referral_slips
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM referrals_given 
    WHERE referrals_given.id = referral_slips.referral_id 
    AND (referrals_given.given_by = auth.uid() OR has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "System can create referral slips"
  ON public.referral_slips
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_referrals_given_contact ON public.referrals_given(contact_id);
CREATE INDEX idx_referrals_given_user ON public.referrals_given(given_by);
CREATE INDEX idx_referrals_received_contact ON public.referrals_received(from_contact_id);
CREATE INDEX idx_referrals_received_user ON public.referrals_received(received_by);
CREATE INDEX idx_introduction_outcomes_contacts ON public.introduction_outcomes(contact_a_id, contact_b_id);
CREATE INDEX idx_gains_meetings_contact ON public.gains_meetings(contact_id);
CREATE INDEX idx_weekly_commitments_user_week ON public.weekly_commitments(user_id, week_start_date);
CREATE INDEX idx_contact_network_value_contact ON public.contact_network_value(contact_id);
CREATE INDEX idx_touch_point_strategies_next_touch ON public.touch_point_strategies(next_touch_date) WHERE active = true;
CREATE INDEX idx_chapter_members_chapter ON public.chapter_members(chapter_id);

-- Create triggers for updated_at
CREATE TRIGGER update_referrals_given_updated_at BEFORE UPDATE ON public.referrals_given
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_received_updated_at BEFORE UPDATE ON public.referrals_received
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_introduction_outcomes_updated_at BEFORE UPDATE ON public.introduction_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gains_meetings_updated_at BEFORE UPDATE ON public.gains_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_commitments_updated_at BEFORE UPDATE ON public.weekly_commitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_network_value_updated_at BEFORE UPDATE ON public.contact_network_value
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_touch_point_strategies_updated_at BEFORE UPDATE ON public.touch_point_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_touch_point_templates_updated_at BEFORE UPDATE ON public.touch_point_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_meetings_updated_at BEFORE UPDATE ON public.chapter_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();