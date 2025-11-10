-- Create contact_goals table for direct linking
CREATE TABLE IF NOT EXISTS public.contact_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  relevance_note TEXT,
  linked_by UUID REFERENCES auth.users(id),
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, goal_id)
);

-- Enable RLS
ALTER TABLE public.contact_goals ENABLE ROW LEVEL SECURITY;

-- Policies for contact_goals
CREATE POLICY "Users can view contact goals for their contacts"
ON public.contact_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_goals.contact_id
    AND (contacts.assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can manage contact goals for their contacts"
ON public.contact_goals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_goals.contact_id
    AND (contacts.assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Insert KOF offering as system setting
INSERT INTO public.system_settings (setting_key, category, setting_value, updated_by)
VALUES (
  'kof_offering',
  'organization',
  '{"title": "KOF Institute Offering", "description": "The KOF Institute provides independent economic research and analysis on Switzerland and the international economy. It publishes economic forecasts, indicators, and time series data and serves as a bridge between academia and the public, including through publications such as KOF Insights. It is also an important center for economic policy discussions and provides access to research data via the KOF Microdata Center.\n\nResearch and analysis:\n- Research focus: The institute deals with a wide range of economic issues, including the economy, innovation, internationalization, and government regulations.\n- Data collection: An important basis for this work is the regular business surveys conducted in Switzerland, which form a unique and valuable database.\n- National tasks: The KOF is tasked with observing and analyzing the Swiss economy.\n\nData and forecasts:\n- KOF indicators and forecasts: The institute provides various indicators and economic forecasts based on its research free of charge.\n- Time series data: It offers access to an extensive database of aggregated national and international time series data.\n- Microdata: Under certain conditions, researchers can apply for access to anonymized microdata for research purposes.\n\nEconomic policy and social role:\n- Knowledge transfer: The institute acts as a platform for presenting research results in a way that is understandable to the general public, thereby supporting economic policy discussions.\n- Networking: It is an important meeting place for economists and is active in national and international networks such as AIECE and Euroconstruct.\n- Education: As part of the Department of Management, Technology and Economics (D-MTEC) at ETH Zurich, KOF also contributes to the education of young scientists."}'::jsonb,
  auth.uid()
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;