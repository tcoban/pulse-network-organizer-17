-- Add interaction history for the new contacts with correct enum values
INSERT INTO public.interactions (contact_id, type, date, description, channel, outcome, contacted_by)
SELECT 
  c.id,
  (ARRAY['meeting', 'email', 'call', 'event']::interaction_type[])[floor(random() * 4 + 1)],
  NOW() - INTERVAL '1 month' * random() * 6,
  CASE 
    WHEN c.company = 'Swiss National Bank' THEN 'Discussed CBDC research collaboration and monetary policy framework'
    WHEN c.company = 'State Secretariat for Economic Affairs' THEN 'Meeting on trade policy research and WTO reform'
    WHEN c.company LIKE '%University%' THEN 'Academic collaboration discussion and joint research proposal'
    WHEN c.company = 'European Central Bank' THEN 'EU-Swiss monetary cooperation discussion'
    WHEN c.company = 'UBS Group AG' THEN 'Banking supervision and fintech regulation meeting'
    WHEN c.company = 'BlackRock' THEN 'Sustainable finance and ESG investing discussion'
    ELSE 'Strategic partnership discussion and potential collaboration'
  END,
  (ARRAY['email', 'linkedin', 'phone', 'in_person'])[floor(random() * 4 + 1)],
  (ARRAY['positive', 'neutral', 'follow_up_needed'])[floor(random() * 3 + 1)],
  c.assigned_to
FROM public.contacts c
WHERE c.company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'BlackRock', 'European Central Bank', 'Graduate Institute Geneva', 'University of Lausanne', 'Federal Department of Finance');

-- Add upcoming opportunities for the contacts with correct enum values
INSERT INTO public.opportunities (contact_id, type, title, date, location, description, registration_status)
SELECT 
  c.id,
  (ARRAY['conference', 'meeting', 'appointment', 'event']::opportunity_type[])[floor(random() * 4 + 1)],
  CASE 
    WHEN c.company = 'Swiss National Bank' THEN 'SNB Annual Conference 2024'
    WHEN c.company = 'State Secretariat for Economic Affairs' THEN 'WTO Trade Policy Review'
    WHEN c.company = 'University of Zurich' THEN 'Behavioral Economics Workshop'
    WHEN c.company = 'UBS Group AG' THEN 'UBS Annual Investor Day'
    WHEN c.company = 'European Central Bank' THEN 'ECB Forum on Central Banking'
    WHEN c.company = 'Graduate Institute Geneva' THEN 'International Economics Conference'
    WHEN c.company = 'University of Lausanne' THEN 'Banking & Finance Symposium'
    WHEN c.company = 'BlackRock' THEN 'Sustainable Finance Summit'
    WHEN c.company = 'Federal Department of Finance' THEN 'Swiss Financial Regulation Forum'
    ELSE 'Industry Leadership Summit'
  END,
  NOW() + INTERVAL '1 month' * (random() * 6 + 1),
  CASE 
    WHEN c.company LIKE '%Swiss%' OR c.company LIKE '%UBS%' THEN 'Zurich, Switzerland'
    WHEN c.company = 'Graduate Institute Geneva' THEN 'Geneva, Switzerland'
    WHEN c.company = 'University of Lausanne' THEN 'Lausanne, Switzerland'
    WHEN c.company = 'European Central Bank' THEN 'Frankfurt, Germany'
    WHEN c.company = 'BlackRock' THEN 'New York, USA'
    ELSE 'Various Locations'
  END,
  'High-value networking and collaboration opportunity with key stakeholders',
  (ARRAY['registered', 'considering', 'confirmed']::registration_status[])[floor(random() * 3 + 1)]
FROM public.contacts c
WHERE c.company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'European Central Bank', 'Graduate Institute Geneva', 'University of Lausanne', 'BlackRock', 'Federal Department of Finance')
AND random() < 0.85; -- 85% chance of having an opportunity

-- Add meeting goals for the opportunities
INSERT INTO public.meeting_goals (opportunity_id, description, achieved)
SELECT 
  o.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Establish joint research partnership'
    WHEN 1 THEN 'Discuss funding opportunities for collaborative projects'
    WHEN 2 THEN 'Plan follow-up collaboration meetings'
    WHEN 3 THEN 'Present research findings and methodology'
    WHEN 4 THEN 'Exchange contact information and establish rapport'
    ELSE 'Explore mutual research interests and synergies'
  END,
  random() < 0.4 -- 40% chance of being achieved
FROM public.opportunities o
WHERE o.contact_id IN (
  SELECT id FROM public.contacts 
  WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'European Central Bank', 'Graduate Institute Geneva', 'University of Lausanne', 'BlackRock', 'Federal Department of Finance')
);

-- Add additional meeting goals for some opportunities
INSERT INTO public.meeting_goals (opportunity_id, description, achieved)
SELECT 
  o.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Explore co-authoring opportunities for academic papers'
    WHEN 1 THEN 'Discuss policy implications of research findings'
    WHEN 2 THEN 'Schedule follow-up meeting within 2 weeks'
    WHEN 3 THEN 'Identify specific mutual research interests'
    WHEN 4 THEN 'Establish long-term collaboration framework'
    ELSE 'Share relevant industry insights and trends'
  END,
  random() < 0.35 -- 35% chance of being achieved
FROM public.opportunities o
WHERE o.contact_id IN (
  SELECT id FROM public.contacts 
  WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'European Central Bank', 'Graduate Institute Geneva', 'University of Lausanne', 'BlackRock', 'Federal Department of Finance')
)
AND random() < 0.7; -- 70% of opportunities get a second goal