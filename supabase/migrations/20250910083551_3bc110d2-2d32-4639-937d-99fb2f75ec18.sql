-- Clear existing demo contacts completely to avoid duplicates
DELETE FROM public.contact_tags WHERE contact_id IN (
  SELECT id FROM public.contacts WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance')
);
DELETE FROM public.interactions WHERE contact_id IN (
  SELECT id FROM public.contacts WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance')
);
DELETE FROM public.meeting_goals WHERE opportunity_id IN (
  SELECT id FROM public.opportunities WHERE contact_id IN (
    SELECT id FROM public.contacts WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance')
  )
);
DELETE FROM public.opportunities WHERE contact_id IN (
  SELECT id FROM public.contacts WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance')
);
DELETE FROM public.contacts WHERE company IN ('Swiss National Bank', 'State Secretariat for Economic Affairs', 'Federal Department of Finance');

-- Insert enriched contacts with proper assignments using user ID
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

-- Add contact tags for enriched contacts with simpler approach to avoid duplicates
DO $$
DECLARE
    contact_rec RECORD;
    tag_to_insert TEXT;
BEGIN
    -- SNB contacts
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company = 'Swiss National Bank' LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Central Banking') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Monetary Policy') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'VIP') ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- SECO contacts
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company = 'State Secretariat for Economic Affairs' LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Government') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Trade Policy') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Economics') ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- University contacts
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company LIKE '%University%' LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Academia') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Research') ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Banking contacts
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company IN ('UBS Group AG', 'BlackRock') LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Banking') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Financial Services') ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- ECB contact
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company = 'European Central Bank' LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Central Banking') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'EU Policy') ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Government contacts
    FOR contact_rec IN SELECT id FROM public.contacts WHERE company = 'Federal Department of Finance' LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Government') ON CONFLICT DO NOTHING;
        INSERT INTO public.contact_tags (contact_id, tag) VALUES (contact_rec.id, 'Financial Regulation') ON CONFLICT DO NOTHING;
    END LOOP;
END $$;