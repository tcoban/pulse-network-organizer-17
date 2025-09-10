-- Insert synthetic contacts for ETH Zurich economic research institute
-- Fix: Use valid cooperation_rating values (1-5) and potential_score values (1-5)

-- Insert main contacts with corrected rating values
INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit, referred_by) VALUES
('Dr. Andrea Weber', 'andrea.weber@snb.ch', '+41 44 631 31 11', 'Swiss National Bank', 'Senior Economist, Monetary Policy', 'Expert in monetary policy transmission mechanisms. Regular speaker at SNB conferences.', 5, 5, 'Swiss National Bank', 'Central bank policy insights, macro data', 'Academic research on cryptocurrency impact', NULL, NULL, 'Digital franc feasibility study', 'SNB insights on monetary policy implementation', 'Prof. Ernst Baltensperger'),
('Prof. Thomas Zimmermann', 'thomas.zimmermann@seco.admin.ch', '+41 58 462 56 56', 'State Secretariat for Economic Affairs (SECO)', 'Head of Macroeconomic Analysis', 'Leading government economist. Key contact for fiscal policy research collaboration.', 4, 5, 'Swiss Federal Government', 'Government economic perspectives, policy data', 'Economic modeling expertise', NULL, NULL, 'COVID-19 economic recovery analysis', 'Government economic data access', ''),
('Dr. Maria Rodriguez', 'm.rodriguez@imf.org', '+1 202 623 7000', 'International Monetary Fund', 'Senior Economist, European Department', 'IMF mission chief for Switzerland. Expert in international monetary systems.', 4, 5, 'International Monetary Fund', 'International perspective, cross-country data', 'Swiss economic research, local insights', NULL, NULL, 'Article IV consultation Switzerland 2024', 'IMF research collaboration opportunities', 'Dr. Andrea Weber'),
('Prof. Jean-Claude Trichet', 'jean-claude.trichet@oecd.org', '+33 1 45 24 82 00', 'OECD', 'Senior Advisor, Economics Department', 'Former ECB President. Now OECD senior advisor. Influential voice in European monetary policy.', 3, 4, 'OECD', 'Policy frameworks, international best practices', 'Academic expertise on digital finance', NULL, NULL, 'Digital currencies policy framework', 'OECD platform for research dissemination', ''),
('Prof. Carmen Reinhart', 'creinhart@hks.harvard.edu', '+1 617 495 1155', 'Harvard Kennedy School', 'Minos A. Zombanakis Professor of the International Financial System', 'World-renowned expert on financial crises and sovereign debt. Former World Bank Chief Economist.', 3, 5, 'Harvard University', 'Financial crisis expertise, historical data', 'European financial stability research', NULL, NULL, 'This Time is Different - Updated Analysis', 'Joint research on financial stability', ''),
('Prof. Kenneth Rogoff', 'krogoff@harvard.edu', '+1 617 495 4511', 'Harvard University', 'Thomas D. Cabot Professor of Public Policy', 'Former IMF Chief Economist. Expert in international economics and exchange rates.', 2, 5, 'Harvard University', 'International macro expertise', 'Swiss monetary policy insights', NULL, NULL, 'Cash and the COVID-19 pandemic', 'Collaboration on international monetary issues', ''),
('Prof. Beatrice Weder di Mauro', 'beatrice.wederdimauro@econ.uzh.ch', '+41 44 634 37 28', 'University of Zurich', 'Professor of International and Monetary Economics', 'Former German Council of Economic Experts member. Expert in international finance.', 5, 5, 'University of Zurich', 'International banking expertise', 'Swiss financial sector analysis', NULL, NULL, 'European banking union assessment', 'Cross-university research collaboration', ''),
('Prof. Michel Habib', 'michel.habib@graduateinstitute.ch', '+41 22 908 57 00', 'Graduate Institute Geneva', 'Professor of International Economics', 'Expert in development economics and international trade. Strong networks in emerging markets.', 4, 4, 'Graduate Institute Geneva', 'Development economics insights', 'Quantitative methods expertise', NULL, NULL, 'Trade and development in sub-Saharan Africa', 'Development economics collaboration', ''),
('Dr. Sarah Mueller', 'sarah.mueller@ubs.com', '+41 44 234 11 11', 'UBS', 'Chief Economist Switzerland', 'Leading bank economist. Regular media commentator on Swiss economic developments.', 4, 4, 'UBS', 'Banking sector insights, market data', 'Academic economic forecasting methods', NULL, NULL, 'Swiss real estate market analysis', 'Industry insights and data sharing', ''),
('Dr. Marco Huwiler', 'marco.huwiler@credit-suisse.com', '+41 44 333 11 11', 'Credit Suisse', 'Senior Economist', 'Specialist in wealth management and private banking economics.', 4, 4, 'Credit Suisse', 'Wealth management data', 'Academic research on inequality', NULL, NULL, 'Wealth inequality trends in Switzerland', 'Private banking sector insights', ''),
('Dr. Alexandra Janssen', 'a.janssen@avenir-suisse.ch', '+41 44 445 90 00', 'Avenir Suisse', 'Senior Research Fellow', 'Liberal think tank researcher. Focus on economic policy and structural reforms.', 4, 4, 'Avenir Suisse', 'Policy analysis, reform proposals', 'Empirical economic research', NULL, NULL, 'Digital transformation of Swiss economy', 'Policy research collaboration', ''),
('Prof. Daniel Lampart', 'daniel.lampart@sgb.ch', '+41 31 377 01 01', 'Swiss Trade Union Federation', 'Chief Economist', 'Leading voice on labor economics and social policy in Switzerland.', 3, 4, 'Swiss Trade Union Federation', 'Labor market insights', 'Academic labor economics research', NULL, NULL, 'Impact of automation on Swiss labor market', 'Labor market research insights', ''),
('Dr. Hans Kaufmann', 'hans.kaufmann@ethz.ch', '+41 44 632 21 11', 'ETH Zurich', 'Professor of Behavioral Economics', 'Expert in behavioral economics and experimental methods. Active researcher in the field.', 4, 4, 'ETH Zurich', 'Experimental methods expertise', 'Policy guidance', NULL, NULL, 'Research project on behavioral economics', 'behavioral economics expertise sharing', ''),
('Prof. Anna Schmitt', 'anna.schmitt@uzh.ch', '+41 44 634 28 28', 'University of Zurich', 'Professor of Development Economics', 'Expert in development economics and emerging markets. Frequent conference speaker.', 4, 4, 'University of Zurich', 'Development economics insights', 'Market insights', NULL, NULL, 'Research project on development economics', 'development economics expertise sharing', ''),
('Dr. Peter Richter', 'peter.richter@unisg.ch', '+41 71 224 21 11', 'University of St. Gallen', 'Senior Researcher in Financial Markets', 'Expert in financial markets and banking. Active researcher in the field.', 3, 3, 'University of St. Gallen', 'Financial markets expertise', 'Academic collaboration', NULL, NULL, 'Research project on financial markets', 'financial markets expertise sharing', ''),
('Prof. Julia Weber', 'julia.weber@epfl.ch', '+41 21 693 11 11', 'EPFL', 'Professor of Digital Economics', 'Expert in digital economics and fintech. Frequent conference speaker.', 4, 5, 'EPFL', 'Digital economics insights', 'Research partnerships', NULL, NULL, 'Research project on digital economics', 'digital economics expertise sharing', ''),
('Dr. Michael Brown', 'michael.brown@swissre.com', '+41 43 285 21 21', 'Swiss Re', 'Chief Risk Officer', 'Expert in risk management and insurance. Active researcher in the field.', 4, 4, 'Swiss Re', 'Risk management expertise', 'Academic networks', NULL, NULL, 'Research project on risk management', 'risk management expertise sharing', ''),
('Prof. Elena Petrova', 'elena.petrova@mit.edu', '+1 617 253 10 00', 'MIT', 'Professor of Econometrics', 'Expert in econometrics and data science. Frequent conference speaker.', 3, 5, 'MIT', 'Econometric modeling', 'International networks', NULL, NULL, 'Research project on econometrics', 'econometrics expertise sharing', 'Conference contact'),
('Dr. Robert Chen', 'robert.chen@stanford.edu', '+1 650 723 20 00', 'Stanford University', 'Associate Professor of Economics', 'Expert in behavioral economics and psychology. Active researcher in the field.', 2, 4, 'Stanford University', 'Behavioral economics insights', 'Methodological expertise', NULL, NULL, 'Research project on behavioral economics', 'behavioral economics expertise sharing', ''),
('Prof. Catherine Davies', 'catherine.davies@lse.ac.uk', '+44 20 7405 72 86', 'London School of Economics', 'Professor of International Economics', 'Expert in international trade and globalization. Frequent conference speaker.', 3, 4, 'London School of Economics', 'International trade insights', 'Funding opportunities', NULL, NULL, 'Research project on international trade', 'international trade expertise sharing', '');

-- Continue with more contacts using valid rating ranges (1-5)
INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit, referred_by) VALUES
('Dr. François Martin', 'francois.martin@sciencespo.fr', '+33 1 45 49 50 50', 'Sciences Po', 'Senior Economist', 'Expert in public finance and taxation. Active researcher in the field.', 3, 3, 'Sciences Po', 'Public finance expertise', 'Publication venues', NULL, NULL, 'Research project on public finance', 'public finance expertise sharing', 'Conference contact'),
('Prof. Giovanni Rossi', 'giovanni.rossi@mckinsey.com', '+41 44 268 11 11', 'McKinsey & Company', 'Partner in Economics Practice', 'Expert in innovation and entrepreneurship. Frequent conference speaker.', 4, 4, 'McKinsey & Company', 'Innovation insights', 'Conference speakers', NULL, NULL, 'Research project on innovation', 'innovation expertise sharing', ''),
('Dr. Lisa Johnson', 'lisa.johnson@bcg.com', '+41 22 561 33 33', 'Boston Consulting Group', 'Principal Economist', 'Expert in competition policy and regulation. Active researcher in the field.', 3, 4, 'Boston Consulting Group', 'Competition policy insights', 'Advisory roles', NULL, NULL, 'Research project on competition policy', 'competition policy expertise sharing', ''),
('Prof. David Wilson', 'david.wilson@deloitte.com', '+41 58 279 60 00', 'Deloitte', 'Director of Economic Research', 'Expert in urban economics and housing. Frequent conference speaker.', 3, 3, 'Deloitte', 'Urban economics insights', 'Consulting projects', NULL, NULL, 'Research project on urban economics', 'urban economics expertise sharing', ''),
('Dr. Sophie Laurent', 'sophie.laurent@ft.com', '+44 20 7873 30 00', 'Financial Times', 'Economic Correspondent', 'Expert in environmental economics and sustainability. Active researcher in the field.', 2, 3, 'Financial Times', 'Environmental economics insights', 'Data sharing opportunities', NULL, NULL, 'Research project on environmental economics', 'environmental economics expertise sharing', 'Conference contact'),
('Prof. James Anderson', 'james.anderson@economist.com', '+44 20 7830 70 00', 'The Economist', 'Editor, Economic Research', 'Expert in health economics and demographics. Frequent conference speaker.', 3, 3, 'The Economist', 'Health economics insights', 'Policy guidance', NULL, NULL, 'Research project on health economics', 'health economics expertise sharing', ''),
('Dr. Maria Lopez', 'maria.lopez@bloomberg.com', '+1 212 318 20 00', 'Bloomberg', 'Senior Economic Analyst', 'Expert in pension systems and social security. Active researcher in the field.', 3, 4, 'Bloomberg', 'Pension systems insights', 'Market insights', NULL, NULL, 'Research project on pension systems', 'pension systems expertise sharing', ''),
('Prof. Alessandro Bianchi', 'alessandro.bianchi@worldbank.org', '+1 202 473 10 00', 'World Bank', 'Senior Economist', 'Expert in labor economics and employment. Frequent conference speaker.', 4, 4, 'World Bank', 'Labor economics insights', 'Academic collaboration', NULL, NULL, 'Research project on labor economics', 'labor economics expertise sharing', ''),
('Dr. Nicole Weber', 'nicole.weber@eib.org', '+352 43 79 1', 'European Investment Bank', 'Principal Economist', 'Expert in macroeconomics and monetary policy. Active researcher in the field.', 3, 4, 'European Investment Bank', 'Macroeconomics insights', 'Research partnerships', NULL, NULL, 'Research project on macroeconomics', 'macroeconomics expertise sharing', 'Conference contact'),
('Prof. Klaus Mueller', 'klaus.mueller@bis.org', '+41 61 280 80 80', 'Bank for International Settlements', 'Head of Research', 'Expert in international economics and central banking. Frequent conference speaker.', 4, 5, 'Bank for International Settlements', 'Central banking insights', 'International networks', NULL, NULL, 'Research project on international economics', 'international economics expertise sharing', ''),
('Dr. Francesca Romano', 'francesca.romano@ecb.europa.eu', '+49 69 1344 0', 'European Central Bank', 'Senior Economist', 'Expert in monetary policy and financial stability. Active researcher in the field.', 4, 4, 'European Central Bank', 'Monetary policy insights', 'Methodological expertise', NULL, NULL, 'Research project on monetary policy', 'monetary policy expertise sharing', '');

-- Generate 100+ additional contacts programmatically to reach 150+ total
DO $$
DECLARE
    i INTEGER;
    companies TEXT[] := ARRAY['ETH Zurich', 'University of Zurich', 'EPFL', 'University of Basel', 'University of St. Gallen', 'Swiss Re', 'UBS', 'Credit Suisse', 'Zurich Insurance', 'Roche', 'Novartis', 'Nestlé', 'World Bank', 'IMF', 'OECD', 'European Central Bank', 'Bank for International Settlements', 'MIT', 'Harvard University', 'Stanford University', 'London School of Economics', 'Oxford University', 'Cambridge University', 'Sciences Po', 'McKinsey & Company', 'Boston Consulting Group', 'Deloitte'];
    positions TEXT[] := ARRAY['Professor of Economics', 'Senior Economist', 'Research Fellow', 'Principal Economist', 'Associate Professor', 'Senior Researcher', 'Director of Research', 'Chief Economist', 'Economic Advisor', 'Senior Analyst'];
    expertise TEXT[] := ARRAY['macroeconomics', 'financial-markets', 'international-trade', 'labor-economics', 'digital-economics', 'behavioral-economics', 'development-economics', 'econometrics', 'monetary-policy', 'banking'];
    offerings TEXT[] := ARRAY['Economic analysis expertise', 'Research collaboration', 'Policy insights', 'Data sharing', 'Quantitative methods', 'International perspective', 'Industry connections', 'Academic networks'];
    seeking TEXT[] := ARRAY['Research partnerships', 'Academic collaboration', 'Data sharing opportunities', 'Policy guidance', 'Market insights', 'Methodological expertise', 'International networks', 'Funding opportunities'];
BEGIN
    FOR i IN 1..120 LOOP
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
            'Contact_' || i, 
            'contact' || i || '@example.com',
            '+41 44 632 ' || LPAD((10 + i)::text, 2, '0') || ' ' || LPAD((10 + i)::text, 2, '0'),
            companies[(i % array_length(companies, 1)) + 1],
            positions[(i % array_length(positions, 1)) + 1],
            'Expert in economics and finance. Active researcher in the field.',
            ((i % 5) + 1), -- cooperation_rating 1-5
            ((i % 5) + 1), -- potential_score 1-5
            companies[(i % array_length(companies, 1)) + 1],
            offerings[(i % array_length(offerings, 1)) + 1],
            seeking[(i % array_length(seeking, 1)) + 1],
            NULL,
            NULL,
            'Research project on ' || expertise[(i % array_length(expertise, 1)) + 1],
            expertise[(i % array_length(expertise, 1)) + 1] || ' expertise sharing'
        );
        
        -- Add tags for each contact
        INSERT INTO public.contact_tags (contact_id, tag) 
        SELECT 
            id,
            expertise[(i % array_length(expertise, 1)) + 1]
        FROM public.contacts 
        WHERE name = 'Contact_' || i;
        
        INSERT INTO public.contact_tags (contact_id, tag) 
        SELECT 
            id,
            CASE (i % 5)
                WHEN 1 THEN 'research'
                WHEN 2 THEN 'academia'
                WHEN 3 THEN 'policy'
                WHEN 4 THEN 'consulting'
                ELSE 'banking'
            END
        FROM public.contacts 
        WHERE name = 'Contact_' || i;
    END LOOP;
END $$;

-- Add tags for the main contacts
DO $$
DECLARE
    contact_record RECORD;
BEGIN
    -- Add tags for Dr. Andrea Weber
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'monetary-policy' FROM public.contacts WHERE name = 'Dr. Andrea Weber';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'central-banking' FROM public.contacts WHERE name = 'Dr. Andrea Weber';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'swiss-economy' FROM public.contacts WHERE name = 'Dr. Andrea Weber';
    
    -- Add tags for Prof. Thomas Zimmermann  
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'fiscal-policy' FROM public.contacts WHERE name = 'Prof. Thomas Zimmermann';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'macroeconomics' FROM public.contacts WHERE name = 'Prof. Thomas Zimmermann';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'swiss-government' FROM public.contacts WHERE name = 'Prof. Thomas Zimmermann';
    
    -- Add tags for Dr. Maria Rodriguez
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'international-economics' FROM public.contacts WHERE name = 'Dr. Maria Rodriguez';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'IMF' FROM public.contacts WHERE name = 'Dr. Maria Rodriguez';
    INSERT INTO public.contact_tags (contact_id, tag) 
    SELECT id, 'european-economy' FROM public.contacts WHERE name = 'Dr. Maria Rodriguez';
    
    -- Add social links for some key contacts
    INSERT INTO public.contact_social_links (contact_id, platform, url)
    SELECT id, 'linkedin', 'https://linkedin.com/in/andrea-weber-snb'
    FROM public.contacts WHERE name = 'Dr. Andrea Weber';
    
    INSERT INTO public.contact_social_links (contact_id, platform, url)
    SELECT id, 'linkedin', 'https://linkedin.com/in/thomas-zimmermann-seco'
    FROM public.contacts WHERE name = 'Prof. Thomas Zimmermann';
    
    INSERT INTO public.contact_social_links (contact_id, platform, url)
    SELECT id, 'linkedin', 'https://linkedin.com/in/maria-rodriguez-imf'
    FROM public.contacts WHERE name = 'Dr. Maria Rodriguez';
    
    -- Add preferences for some contacts
    INSERT INTO public.contact_preferences (contact_id, language, preferred_channel, available_times, meeting_location)
    SELECT id, 'German', 'email', 'Weekdays 9-17', 'Zurich'
    FROM public.contacts WHERE name = 'Dr. Andrea Weber';
    
    INSERT INTO public.contact_preferences (contact_id, language, preferred_channel, available_times, meeting_location)
    SELECT id, 'German', 'phone', 'Weekdays 8-18', 'Bern'
    FROM public.contacts WHERE name = 'Prof. Thomas Zimmermann';
    
    INSERT INTO public.contact_preferences (contact_id, language, preferred_channel, available_times, meeting_location)
    SELECT id, 'English', 'email', 'Weekdays 14-22', 'Washington DC'
    FROM public.contacts WHERE name = 'Dr. Maria Rodriguez';
    
END $$;