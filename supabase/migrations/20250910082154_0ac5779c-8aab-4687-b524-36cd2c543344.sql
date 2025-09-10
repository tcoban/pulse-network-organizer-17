-- Clear existing demo contacts to avoid duplicates
DELETE FROM public.contacts WHERE email LIKE '%@demo.%' OR company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance');

-- Insert enriched contacts with proper assignments using names
INSERT INTO public.contacts (
  id, name, email, phone, company, position, 
  assigned_to, created_by, affiliation, offering, looking_for,
  mutual_benefit, current_projects, notes, referred_by,
  linkedin_connections, cooperation_rating, potential_score,
  last_contact, added_date
) VALUES
  (
    gen_random_uuid(),
    'Dr. Thomas Jordan',
    'thomas.jordan@snb.ch',
    '+41 44 631 31 11',
    'Swiss National Bank',
    'Chairman of the Governing Board',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Central Bank',
    'Monetary policy insights, financial stability expertise',
    'Economic research collaboration, international policy coordination',
    'Joint research on digital currencies and monetary policy transmission',
    'CBDC research project, inflation targeting framework analysis',
    'Key contact for Swiss monetary policy. Very influential in international central banking circles.',
    'Christine Lagarde',
    ARRAY['Christine Lagarde', 'Jerome Powell', 'Haruhiko Kuroda'],
    5,
    5,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '120 days'
  ),
  (
    gen_random_uuid(),
    'Marie-Gabrielle Ineichen-Fleisch',
    'marie.ineichen@seco.admin.ch',
    '+41 58 462 56 56',
    'State Secretariat for Economic Affairs',
    'State Secretary',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Government',
    'Trade policy expertise, economic diplomacy',
    'Academic insights on international trade, policy research',
    'Research collaboration on trade policy impact assessment',
    'WTO reform discussions, bilateral trade agreement analysis',
    'Leading Swiss trade policy. Excellent connections to international trade organizations.',
    'Pascal Lamy',
    ARRAY['Roberto Azevêdo', 'Pascal Lamy', 'Ngozi Okonjo-Iweala'],
    4,
    5,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '80 days'
  ),
  (
    gen_random_uuid(),
    'Prof. Dr. Ernst Fehr',
    'ernst.fehr@econ.uzh.ch',
    '+41 44 634 37 29',
    'University of Zurich',
    'Professor of Microeconomics and Experimental Economics',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Academia',
    'Behavioral economics research, experimental methodologies',
    'Collaboration on central bank behavior, policy psychology',
    'Joint research on behavioral aspects of monetary policy',
    'Trust in institutions research, behavioral central banking study',
    'World-renowned behavioral economist. Multiple Nature/Science publications.',
    'Daniel Kahneman',
    ARRAY['Daniel Kahneman', 'Richard Thaler', 'Robert Shiller'],
    5,
    4,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '45 days'
  ),
  (
    gen_random_uuid(),
    'Sergio Ermotti',
    'sergio.ermotti@ubs.com',
    '+41 44 234 11 11',
    'UBS Group AG',
    'Chairman',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Financial Sector',
    'Banking industry insights, risk management expertise',
    'Academic research on banking regulation, financial stability',
    'Research on banking supervision and systemic risk',
    'Basel III implementation study, too-big-to-fail research',
    'Former UBS CEO, now Chairman. Deep knowledge of global banking.',
    'Jamie Dimon',
    ARRAY['Jamie Dimon', 'Brian Moynihan', 'David Solomon'],
    4,
    5,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '90 days'
  ),
  (
    gen_random_uuid(),
    'Dr. Aymo Brunetti',
    'aymo.brunetti@seco.admin.ch',
    '+41 58 462 29 17',
    'State Secretariat for Economic Affairs',
    'Chief Economist',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Government',
    'Macroeconomic analysis, economic forecasting',
    'Academic collaboration on Swiss economic policy',
    'Joint analysis of Swiss competitiveness and productivity',
    'Swiss economic outlook 2024, productivity growth analysis',
    'Former University of Bern professor. Key economic advisor to Federal Council.',
    'Klaas Knot',
    ARRAY['Klaas Knot', 'Philip Lane', 'Isabel Schnabel'],
    4,
    4,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '60 days'
  ),
  (
    gen_random_uuid(),
    'Dr. Philipp Hildebrand',
    'philipp.hildebrand@blackrock.com',
    '+1 212 810 5300',
    'BlackRock',
    'Vice Chairman',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Financial Sector',
    'Asset management insights, sustainable finance expertise',
    'Research on central bank asset purchases, climate finance',
    'Research collaboration on ESG investing and monetary policy',
    'Climate risk assessment project, sustainable finance framework',
    'Former SNB Chairman. Now leading sustainable finance at BlackRock.',
    'Larry Fink',
    ARRAY['Larry Fink', 'Mark Carney', 'François Villeroy de Galhau'],
    4,
    5,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '150 days'
  ),
  (
    gen_random_uuid(),
    'Prof. Dr. Cédric Tille',
    'cedric.tille@graduateinstitute.ch',
    '+41 22 908 57 50',
    'Graduate Institute Geneva',
    'Professor of International Economics',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Academia',
    'International macroeconomics, exchange rate analysis',
    'Collaboration on Swiss franc dynamics, international spillovers',
    'Joint research on safe haven currencies and monetary spillovers',
    'Swiss franc appreciation study, international monetary coordination',
    'Leading expert on Swiss franc and international economics.',
    'Maurice Obstfeld',
    ARRAY['Maurice Obstfeld', 'Gita Gopinath', 'Kenneth Rogoff'],
    5,
    4,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    gen_random_uuid(),
    'Christine Lagarde',
    'christine.lagarde@ecb.europa.eu',
    '+49 69 1344 0',
    'European Central Bank',
    'President',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Central Bank',
    'European monetary policy, international coordination',
    'Research on monetary policy transmission, digital euros',
    'Comparative analysis of ECB and SNB policy frameworks',
    'Digital euro research, green monetary policy study',
    'ECB President. Previously IMF Managing Director. Excellent for EU-Swiss discussions.',
    'Mario Draghi',
    ARRAY['Mario Draghi', 'Jerome Powell', 'Mark Carney'],
    3,
    5,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '200 days'
  ),
  (
    gen_random_uuid(),
    'Prof. Dr. Jean-Pierre Danthine',
    'jean-pierre.danthine@unil.ch',
    '+41 21 692 34 00',
    'University of Lausanne',
    'Professor of Finance',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Academia',
    'Banking regulation, financial stability research',
    'Collaboration on Swiss banking sector analysis',
    'Joint research on banking regulation effectiveness',
    'Swiss banking competitiveness study, fintech regulation analysis',
    'Former SNB Governing Board member. Expert on banking and finance.',
    'Thomas Jordan',
    ARRAY['Thomas Jordan', 'Andrea Enria', 'Pablo Hernández de Cos'],
    4,
    4,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '75 days'
  ),
  (
    gen_random_uuid(),
    'Dr. Karin Keller-Sutter',
    'karin.keller-sutter@ejpd.admin.ch',
    '+41 58 462 18 18',
    'Federal Department of Finance',
    'Federal Councillor',
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'tcoban@ethz.ch' LIMIT 1),
    'Government',
    'Financial market regulation, tax policy expertise',
    'Academic insights on financial regulation impact',
    'Research on fintech regulation and tax policy coordination',
    'Financial market supervision reform, crypto regulation framework',
    'Finance Minister. Former Justice Minister. Key contact for financial policy.',
    'Bruno Le Maire',
    ARRAY['Bruno Le Maire', 'Olaf Scholz', 'Nadia Calviño'],
    4,
    5,
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '110 days'
  );

-- Add contact tags for the enriched contacts
INSERT INTO public.contact_tags (contact_id, tag)
SELECT c.id, tag
FROM public.contacts c
CROSS JOIN (
  SELECT UNNEST(CASE 
    WHEN c2.company = 'Swiss National Bank' THEN ARRAY['Central Banking', 'Monetary Policy', 'VIP']
    WHEN c2.company = 'State Secretariat for Economic Affairs' THEN ARRAY['Government', 'Trade Policy', 'Economics']
    WHEN c2.company = 'University of Zurich' THEN ARRAY['Academia', 'Research', 'Behavioral Economics']
    WHEN c2.company = 'UBS Group AG' THEN ARRAY['Banking', 'Financial Services', 'Leadership']
    WHEN c2.company = 'BlackRock' THEN ARRAY['Asset Management', 'Sustainable Finance', 'Former Central Banker']
    WHEN c2.company = 'Graduate Institute Geneva' THEN ARRAY['Academia', 'International Economics', 'Research']
    WHEN c2.company = 'European Central Bank' THEN ARRAY['Central Banking', 'EU Policy', 'International']
    WHEN c2.company = 'University of Lausanne' THEN ARRAY['Academia', 'Banking Research', 'Former SNB']
    WHEN c2.company = 'Federal Department of Finance' THEN ARRAY['Government', 'Financial Regulation', 'Minister']
    ELSE ARRAY['General']
  END) as tag
  FROM public.contacts c2 
  WHERE c2.id = c.id
) t(tag)
WHERE c.company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'BlackRock', 'Graduate Institute Geneva', 'European Central Bank', 'University of Lausanne', 'Federal Department of Finance');

-- Add some interaction history
INSERT INTO public.interactions (contact_id, type, date, description, channel, outcome, contacted_by)
SELECT 
  c.id,
  (ARRAY['meeting', 'email', 'phone_call', 'conference'])[floor(random() * 4 + 1)],
  NOW() - INTERVAL '1 month' * random() * 6,
  CASE 
    WHEN c.company = 'Swiss National Bank' THEN 'Discussed CBDC research collaboration and monetary policy framework'
    WHEN c.company = 'State Secretariat for Economic Affairs' THEN 'Meeting on trade policy research and WTO reform'
    WHEN c.company LIKE '%University%' THEN 'Academic collaboration discussion and joint research proposal'
    WHEN c.company = 'European Central Bank' THEN 'EU-Swiss monetary cooperation discussion'
    ELSE 'Strategic partnership discussion and potential collaboration'
  END,
  (ARRAY['email', 'linkedin', 'phone', 'in_person'])[floor(random() * 4 + 1)],
  (ARRAY['positive', 'neutral', 'follow_up_needed'])[floor(random() * 3 + 1)],
  c.assigned_to
FROM public.contacts c
WHERE c.company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'BlackRock', 'European Central Bank');

-- Add upcoming opportunities
INSERT INTO public.opportunities (contact_id, type, title, date, location, description, registration_status)
SELECT 
  c.id,
  (ARRAY['conference', 'meeting', 'workshop', 'networking_event'])[floor(random() * 4 + 1)],
  CASE 
    WHEN c.company = 'Swiss National Bank' THEN 'SNB Annual Conference 2024'
    WHEN c.company = 'State Secretariat for Economic Affairs' THEN 'WTO Trade Policy Review'
    WHEN c.company = 'University of Zurich' THEN 'Behavioral Economics Workshop'
    WHEN c.company = 'UBS Group AG' THEN 'UBS Annual Investor Day'
    WHEN c.company = 'European Central Bank' THEN 'ECB Forum on Central Banking'
    WHEN c.company = 'Graduate Institute Geneva' THEN 'International Economics Conference'
    ELSE 'Industry Leadership Summit'
  END,
  NOW() + INTERVAL '1 month' * (random() * 6 + 1),
  CASE 
    WHEN c.company LIKE '%Swiss%' OR c.company LIKE '%UBS%' THEN 'Zurich, Switzerland'
    WHEN c.company = 'Graduate Institute Geneva' THEN 'Geneva, Switzerland'
    WHEN c.company = 'European Central Bank' THEN 'Frankfurt, Germany'
    ELSE 'Various Locations'
  END,
  'High-value networking and collaboration opportunity',
  (ARRAY['registered', 'pending', 'considering'])[floor(random() * 3 + 1)]
FROM public.contacts c
WHERE c.company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'University of Zurich', 'UBS Group AG', 'European Central Bank', 'Graduate Institute Geneva', 'University of Lausanne')
AND random() < 0.8; -- 80% chance of having an opportunity

-- Add meeting goals for the opportunities
INSERT INTO public.meeting_goals (opportunity_id, description, achieved)
SELECT 
  o.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Establish joint research partnership'
    WHEN 1 THEN 'Discuss funding opportunities'
    WHEN 2 THEN 'Plan follow-up collaboration'
    WHEN 3 THEN 'Present research findings'
    ELSE 'Exchange contact information and establish rapport'
  END,
  random() < 0.35 -- 35% chance of being achieved
FROM public.opportunities o;

-- Add additional meeting goals for some opportunities
INSERT INTO public.meeting_goals (opportunity_id, description, achieved)
SELECT 
  o.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Explore co-authoring opportunities'
    WHEN 1 THEN 'Discuss policy implications'
    WHEN 2 THEN 'Schedule follow-up meeting'
    WHEN 3 THEN 'Identify mutual research interests'
    ELSE 'Establish long-term collaboration framework'
  END,
  random() < 0.4 -- 40% chance of being achieved
FROM public.opportunities o
WHERE random() < 0.6; -- 60% of opportunities get a second goal