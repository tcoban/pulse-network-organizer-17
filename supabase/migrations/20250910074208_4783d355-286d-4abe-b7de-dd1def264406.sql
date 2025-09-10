-- Insert 150 synthetic contacts for ETH Zurich economic research institute
-- Fixed enum casting for preferred_channel

DO $$
DECLARE
    i INTEGER;
    new_contact_id UUID;
    companies TEXT[] := ARRAY['ETH Zurich', 'University of Zurich', 'EPFL', 'University of Basel', 'University of St. Gallen', 'Swiss Re', 'UBS', 'Credit Suisse', 'Zurich Insurance', 'Roche', 'Novartis', 'Nestlé', 'World Bank', 'IMF', 'OECD', 'European Central Bank', 'Bank for International Settlements', 'MIT', 'Harvard University', 'Stanford University', 'London School of Economics', 'Oxford University', 'Cambridge University', 'Sciences Po', 'McKinsey & Company', 'Boston Consulting Group', 'Deloitte', 'Swiss National Bank', 'Graduate Institute Geneva', 'Avenir Suisse'];
    positions TEXT[] := ARRAY['Professor of Economics', 'Senior Economist', 'Research Fellow', 'Principal Economist', 'Associate Professor', 'Senior Researcher', 'Director of Research', 'Chief Economist', 'Economic Advisor', 'Senior Analyst', 'Professor of Finance', 'Head of Research', 'Managing Director', 'Senior Consultant', 'Economic Correspondent'];
    first_names TEXT[] := ARRAY['Andreas', 'Barbara', 'Christian', 'Diana', 'Erik', 'Franziska', 'Georg', 'Helena', 'Ivan', 'Julia', 'Klaus', 'Laura', 'Michael', 'Nina', 'Oliver', 'Petra', 'Robert', 'Sabine', 'Thomas', 'Ursula', 'Viktor', 'Werner', 'Yvonne', 'Zora', 'Alessandro', 'Bianca', 'Carlos', 'Daniela', 'Elena', 'Francesco'];
    last_names TEXT[] := ARRAY['Müller', 'Schmidt', 'Weber', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Huber', 'Mayer', 'Herrmann', 'König'];
    expertise_areas TEXT[] := ARRAY['macroeconomics', 'financial-markets', 'international-trade', 'labor-economics', 'digital-economics', 'behavioral-economics', 'development-economics', 'econometrics', 'monetary-policy', 'banking', 'innovation', 'sustainability', 'health-economics', 'urban-economics', 'public-finance'];
    offerings TEXT[] := ARRAY['Economic analysis expertise', 'Research collaboration', 'Policy insights', 'Data sharing', 'Quantitative methods', 'International perspective', 'Industry connections', 'Academic networks', 'Econometric modeling', 'Market data access'];
    seeking TEXT[] := ARRAY['Research partnerships', 'Academic collaboration', 'Data sharing opportunities', 'Policy guidance', 'Market insights', 'Methodological expertise', 'International networks', 'Funding opportunities', 'Publication venues', 'Conference speakers'];
BEGIN
    -- Insert 150 contacts
    FOR i IN 1..150 LOOP
        INSERT INTO public.contacts (
            name, 
            email, 
            phone, 
            company, 
            position, 
            notes, 
            cooperation_rating, 
            potential_score, 
            affiliation, 
            offering, 
            looking_for, 
            assigned_to, 
            created_by, 
            current_projects, 
            mutual_benefit
        ) VALUES (
            CASE 
                WHEN i <= 30 THEN 'Dr. ' || first_names[(i % array_length(first_names, 1)) + 1] || ' ' || last_names[(i % array_length(last_names, 1)) + 1]
                ELSE 'Prof. ' || first_names[((i-30) % array_length(first_names, 1)) + 1] || ' ' || last_names[((i-30) % array_length(last_names, 1)) + 1]
            END,
            CASE 
                WHEN i <= 30 THEN lower(first_names[(i % array_length(first_names, 1)) + 1]) || '.' || lower(last_names[(i % array_length(last_names, 1)) + 1]) || '@' || lower(replace(companies[(i % array_length(companies, 1)) + 1], ' ', '')) || '.com'
                ELSE lower(first_names[((i-30) % array_length(first_names, 1)) + 1]) || '.' || lower(last_names[((i-30) % array_length(last_names, 1)) + 1]) || '@' || lower(replace(companies[((i-30) % array_length(companies, 1)) + 1], ' ', '')) || '.edu'
            END,
            '+41 44 632 ' || LPAD((10 + (i % 89))::text, 2, '0') || ' ' || LPAD((10 + (i % 89))::text, 2, '0'),
            companies[(i % array_length(companies, 1)) + 1],
            positions[(i % array_length(positions, 1)) + 1],
            'Expert in ' || expertise_areas[(i % array_length(expertise_areas, 1)) + 1] || ' and economics. ' || 
            CASE WHEN i % 2 = 0 THEN 'Active researcher in the field.' ELSE 'Frequent conference speaker.' END,
            ((i % 5) + 1), -- cooperation_rating 1-5
            ((i % 5) + 1), -- potential_score 1-5
            companies[(i % array_length(companies, 1)) + 1],
            offerings[(i % array_length(offerings, 1)) + 1],
            seeking[(i % array_length(seeking, 1)) + 1],
            NULL,
            NULL,
            'Research project on ' || expertise_areas[(i % array_length(expertise_areas, 1)) + 1],
            expertise_areas[(i % array_length(expertise_areas, 1)) + 1] || ' expertise sharing'
        ) RETURNING id INTO new_contact_id;
        
        -- Add primary expertise tag
        INSERT INTO public.contact_tags (contact_id, tag) 
        VALUES (new_contact_id, expertise_areas[(i % array_length(expertise_areas, 1)) + 1]);
        
        -- Add secondary tag based on institution type
        INSERT INTO public.contact_tags (contact_id, tag) 
        VALUES (new_contact_id, 
            CASE 
                WHEN companies[(i % array_length(companies, 1)) + 1] IN ('ETH Zurich', 'University of Zurich', 'EPFL', 'University of Basel', 'University of St. Gallen', 'MIT', 'Harvard University', 'Stanford University', 'London School of Economics', 'Oxford University', 'Cambridge University', 'Sciences Po', 'Graduate Institute Geneva') THEN 'academia'
                WHEN companies[(i % array_length(companies, 1)) + 1] IN ('Swiss Re', 'UBS', 'Credit Suisse', 'Zurich Insurance', 'Roche', 'Novartis', 'Nestlé') THEN 'industry'
                WHEN companies[(i % array_length(companies, 1)) + 1] IN ('World Bank', 'IMF', 'OECD', 'European Central Bank', 'Bank for International Settlements', 'Swiss National Bank') THEN 'policy'
                WHEN companies[(i % array_length(companies, 1)) + 1] IN ('McKinsey & Company', 'Boston Consulting Group', 'Deloitte') THEN 'consulting'
                ELSE 'research'
            END
        );
        
        -- Add contact preferences for every 5th contact
        IF i % 5 = 0 THEN
            INSERT INTO public.contact_preferences (contact_id, language, preferred_channel, available_times, meeting_location)
            VALUES (
                new_contact_id,
                CASE (i % 3) 
                    WHEN 0 THEN 'German'
                    WHEN 1 THEN 'English' 
                    ELSE 'French'
                END,
                CASE (i % 3)
                    WHEN 0 THEN 'email'::preferred_channel
                    WHEN 1 THEN 'phone'::preferred_channel
                    ELSE 'linkedin'::preferred_channel
                END,
                'Weekdays 9-17',
                CASE (i % 4)
                    WHEN 0 THEN 'Zurich'
                    WHEN 1 THEN 'Geneva'
                    WHEN 2 THEN 'Basel'
                    ELSE 'Remote'
                END
            );
        END IF;
        
        -- Add LinkedIn profile for every 3rd contact
        IF i % 3 = 0 THEN
            INSERT INTO public.contact_social_links (contact_id, platform, url)
            VALUES (
                new_contact_id,
                'linkedin',
                'https://linkedin.com/in/' || lower(first_names[(i % array_length(first_names, 1)) + 1]) || '-' || lower(last_names[(i % array_length(last_names, 1)) + 1]) || '-' || i
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully inserted 150 synthetic contacts with tags, preferences, and social links';
END $$;