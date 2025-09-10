-- Set admin role for tcoban@ethz.ch
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID for tcoban@ethz.ch
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'tcoban@ethz.ch';
    
    -- Set admin role if user exists
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- Insert demo contacts assigned to tcoban@ethz.ch
DO $$
DECLARE
    target_user_id UUID;
    contact_id_1 UUID;
    contact_id_2 UUID;
    contact_id_3 UUID;
    contact_id_4 UUID;
    contact_id_5 UUID;
    contact_id_6 UUID;
BEGIN
    -- Get user ID for tcoban@ethz.ch
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'tcoban@ethz.ch';
    
    IF target_user_id IS NOT NULL THEN
        -- Insert Swiss National Bank contacts
        INSERT INTO public.contacts (id, name, email, phone, company, position, notes, assigned_to, created_by, cooperation_rating, potential_score, affiliation, offering, looking_for)
        VALUES 
        (gen_random_uuid(), 'Dr. Thomas Jordan', 'thomas.jordan@snb.ch', '+41 44 631 31 11', 'Swiss National Bank', 'Chairman of the Governing Board', 'Former SNB Chairman, expert in monetary policy and financial stability', target_user_id, target_user_id, 5, 5, 'Government Official', 'Monetary policy insights, central banking expertise', 'Economic research collaboration, policy impact analysis'),
        (gen_random_uuid(), 'Dr. Andréa Maechler', 'andrea.maechler@snb.ch', '+41 44 631 32 22', 'Swiss National Bank', 'Member of the Governing Board', 'Expert in financial markets and monetary policy implementation', target_user_id, target_user_id, 4, 4, 'Government Official', 'Financial stability analysis, banking supervision insights', 'Academic research partnerships'),
        (gen_random_uuid(), 'Prof. Dr. Marie Schlegel', 'marie.schlegel@seco.admin.ch', '+41 58 462 56 56', 'SECO', 'Head of Economic Policy Directorate', 'Leading economist in Swiss federal administration', target_user_id, target_user_id, 4, 5, 'Government Official', 'Economic policy analysis, labor market insights', 'Evidence-based policy research');

        -- Insert International Organization contacts
        INSERT INTO public.contacts (id, name, email, phone, company, position, notes, assigned_to, created_by, cooperation_rating, potential_score, affiliation, offering, looking_for)
        VALUES 
        (gen_random_uuid(), 'Dr. Christine Lagarde', 'christine.lagarde@ecb.europa.eu', '+49 69 1344 0', 'European Central Bank', 'President', 'Former IMF Managing Director, expert in international finance', target_user_id, target_user_id, 5, 5, 'International Organization', 'Monetary policy coordination, European integration insights', 'Swiss economic perspectives, research collaboration'),
        (gen_random_uuid(), 'Prof. Dr. Laurence Boone', 'laurence.boone@oecd.org', '+33 1 45 24 82 00', 'OECD', 'Chief Economist', 'Leading expert on global economic trends and policy', target_user_id, target_user_id, 4, 4, 'International Organization', 'Global economic analysis, policy recommendations', 'Country-specific research, data collaboration'),
        (gen_random_uuid(), 'Dr. Kristalina Georgieva', 'kgeorgieva@imf.org', '+1 202 623 7000', 'International Monetary Fund', 'Managing Director', 'Expert in international finance and crisis management', target_user_id, target_user_id, 5, 5, 'International Organization', 'Crisis management expertise, global financial stability', 'Swiss financial sector insights');

        -- Insert Academic contacts
        INSERT INTO public.contacts (id, name, email, phone, company, position, notes, assigned_to, created_by, cooperation_rating, potential_score, affiliation, offering, looking_for)
        VALUES 
        (gen_random_uuid(), 'Prof. Dr. Ernst Fehr', 'ernst.fehr@econ.uzh.ch', '+41 44 634 37 29', 'University of Zurich', 'Professor of Economics', 'World-renowned behavioral economist, close collaboration potential', target_user_id, target_user_id, 5, 5, 'Academic', 'Behavioral economics research, experimental methods', 'KOF data access, joint research projects'),
        (gen_random_uuid(), 'Prof. Dr. Rafael Lalive', 'rafael.lalive@unil.ch', '+41 21 692 34 35', 'University of Lausanne', 'Professor of Economics', 'Expert in labor economics and public policy evaluation', target_user_id, target_user_id, 4, 4, 'Academic', 'Labor market analysis, policy evaluation methods', 'Swiss labor market data, research collaboration'),
        (gen_random_uuid(), 'Prof. Dr. Daron Acemoglu', 'daron@mit.edu', '+1 617 253 1927', 'MIT', 'Institute Professor', 'Nobel Prize winner, expert in institutions and growth', target_user_id, target_user_id, 5, 5, 'Academic', 'Institutional analysis, growth theory', 'Swiss institutional data, visiting scholar opportunities');

        -- Insert Financial Sector contacts  
        INSERT INTO public.contacts (id, name, email, phone, company, position, notes, assigned_to, created_by, cooperation_rating, potential_score, affiliation, offering, looking_for)
        VALUES 
        (gen_random_uuid(), 'Dr. Ralph Hamers', 'ralph.hamers@ubs.com', '+41 44 234 1111', 'UBS', 'CEO', 'Leading Swiss banking executive with global perspective', target_user_id, target_user_id, 4, 4, 'Financial Sector', 'Banking industry insights, digital transformation', 'Economic forecasts, policy impact analysis'),
        (gen_random_uuid(), 'Dr. Thomas Gottstein', 'thomas.gottstein@credit-suisse.com', '+41 44 333 1111', 'Credit Suisse', 'Former CEO', 'Experienced in investment banking and wealth management', target_user_id, target_user_id, 3, 3, 'Financial Sector', 'Investment banking expertise, market analysis', 'Economic indicators, research partnerships'),
        (gen_random_uuid(), 'Dr. Philipp Hildebrand', 'philipp.hildebrand@blackrock.com', '+1 212 810 5300', 'BlackRock', 'Vice Chairman', 'Former SNB Chairman, now in asset management', target_user_id, target_user_id, 5, 5, 'Financial Sector', 'Asset management insights, former central banking experience', 'Swiss economic research, policy discussions');

        -- Insert Think Tank contacts
        INSERT INTO public.contacts (id, name, email, phone, company, position, notes, assigned_to, created_by, cooperation_rating, potential_score, affiliation, offering, looking_for)
        VALUES 
        (gen_random_uuid(), 'Dr. Reiner Eichenberger', 'reiner.eichenberger@unifr.ch', '+41 26 300 82 70', 'CREMA', 'Director', 'Expert in public economics and Swiss fiscal federalism', target_user_id, target_user_id, 4, 4, 'Think Tank', 'Public finance research, federalism analysis', 'KOF public sector data, joint policy studies'),
        (gen_random_uuid(), 'Prof. Dr. Aymo Brunetti', 'aymo.brunetti@vwi.unibe.ch', '+41 31 684 31 25', 'University of Bern', 'Professor of Economics', 'Former State Secretariat economist, growth expert', target_user_id, target_user_id, 4, 4, 'Think Tank', 'Growth analysis, innovation policy', 'Economic indicators, research collaboration'),
        (gen_random_uuid(), 'Dr. Rudolf Minsch', 'rudolf.minsch@economiesuisse.ch', '+41 44 421 35 35', 'economiesuisse', 'Chief Economist', 'Leading voice of Swiss business community', target_user_id, target_user_id, 4, 4, 'Think Tank', 'Business sentiment analysis, policy advocacy', 'Economic forecasts, business cycle research');

        -- Store contact IDs for tag insertion
        SELECT id INTO contact_id_1 FROM public.contacts WHERE email = 'thomas.jordan@snb.ch';
        SELECT id INTO contact_id_2 FROM public.contacts WHERE email = 'ernst.fehr@econ.uzh.ch';
        SELECT id INTO contact_id_3 FROM public.contacts WHERE email = 'christine.lagarde@ecb.europa.eu';
        SELECT id INTO contact_id_4 FROM public.contacts WHERE email = 'ralph.hamers@ubs.com';
        SELECT id INTO contact_id_5 FROM public.contacts WHERE email = 'reiner.eichenberger@unifr.ch';
        SELECT id INTO contact_id_6 FROM public.contacts WHERE email = 'daron@mit.edu';

        -- Insert relevant tags
        INSERT INTO public.contact_tags (contact_id, tag)
        VALUES 
        (contact_id_1, 'Central Banking'),
        (contact_id_1, 'Monetary Policy'),
        (contact_id_1, 'VIP'),
        (contact_id_2, 'Behavioral Economics'),
        (contact_id_2, 'Academic'),
        (contact_id_2, 'Research Partner'),
        (contact_id_3, 'European Central Bank'),
        (contact_id_3, 'International'),
        (contact_id_3, 'VIP'),
        (contact_id_4, 'Banking'),
        (contact_id_4, 'Financial Services'),
        (contact_id_5, 'Public Economics'),
        (contact_id_5, 'Think Tank'),
        (contact_id_6, 'Nobel Prize'),
        (contact_id_6, 'MIT'),
        (contact_id_6, 'VIP');
    END IF;
END $$;