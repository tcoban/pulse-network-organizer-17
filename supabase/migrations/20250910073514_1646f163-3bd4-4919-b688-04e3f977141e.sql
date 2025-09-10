-- Insert synthetic contacts for ETH Zurich economic research institute
-- Fix: Use NULL for assigned_to and created_by since they expect UUIDs

-- Insert main contacts
INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit, referred_by) VALUES
('Dr. Andrea Weber', 'andrea.weber@snb.ch', '+41 44 631 31 11', 'Swiss National Bank', 'Senior Economist, Monetary Policy', 'Expert in monetary policy transmission mechanisms. Regular speaker at SNB conferences.', 9, 10, 'Swiss National Bank', 'Central bank policy insights, macro data', 'Academic research on cryptocurrency impact', NULL, NULL, 'Digital franc feasibility study', 'SNB insights on monetary policy implementation', 'Prof. Ernst Baltensperger'),
('Prof. Thomas Zimmermann', 'thomas.zimmermann@seco.admin.ch', '+41 58 462 56 56', 'State Secretariat for Economic Affairs (SECO)', 'Head of Macroeconomic Analysis', 'Leading government economist. Key contact for fiscal policy research collaboration.', 8, 9, 'Swiss Federal Government', 'Government economic perspectives, policy data', 'Economic modeling expertise', NULL, NULL, 'COVID-19 economic recovery analysis', 'Government economic data access', ''),
('Dr. Maria Rodriguez', 'm.rodriguez@imf.org', '+1 202 623 7000', 'International Monetary Fund', 'Senior Economist, European Department', 'IMF mission chief for Switzerland. Expert in international monetary systems.', 7, 9, 'International Monetary Fund', 'International perspective, cross-country data', 'Swiss economic research, local insights', NULL, NULL, 'Article IV consultation Switzerland 2024', 'IMF research collaboration opportunities', 'Dr. Andrea Weber'),
('Prof. Jean-Claude Trichet', 'jean-claude.trichet@oecd.org', '+33 1 45 24 82 00', 'OECD', 'Senior Advisor, Economics Department', 'Former ECB President. Now OECD senior advisor. Influential voice in European monetary policy.', 6, 8, 'OECD', 'Policy frameworks, international best practices', 'Academic expertise on digital finance', NULL, NULL, 'Digital currencies policy framework', 'OECD platform for research dissemination', ''),
('Prof. Carmen Reinhart', 'creinhart@hks.harvard.edu', '+1 617 495 1155', 'Harvard Kennedy School', 'Minos A. Zombanakis Professor of the International Financial System', 'World-renowned expert on financial crises and sovereign debt. Former World Bank Chief Economist.', 5, 10, 'Harvard University', 'Financial crisis expertise, historical data', 'European financial stability research', NULL, NULL, 'This Time is Different - Updated Analysis', 'Joint research on financial stability', ''),
('Prof. Kenneth Rogoff', 'krogoff@harvard.edu', '+1 617 495 4511', 'Harvard University', 'Thomas D. Cabot Professor of Public Policy', 'Former IMF Chief Economist. Expert in international economics and exchange rates.', 4, 9, 'Harvard University', 'International macro expertise', 'Swiss monetary policy insights', NULL, NULL, 'Cash and the COVID-19 pandemic', 'Collaboration on international monetary issues', ''),
('Prof. Beatrice Weder di Mauro', 'beatrice.wederdimauro@econ.uzh.ch', '+41 44 634 37 28', 'University of Zurich', 'Professor of International and Monetary Economics', 'Former German Council of Economic Experts member. Expert in international finance.', 9, 9, 'University of Zurich', 'International banking expertise', 'Swiss financial sector analysis', NULL, NULL, 'European banking union assessment', 'Cross-university research collaboration', ''),
('Prof. Michel Habib', 'michel.habib@graduateinstitute.ch', '+41 22 908 57 00', 'Graduate Institute Geneva', 'Professor of International Economics', 'Expert in development economics and international trade. Strong networks in emerging markets.', 7, 8, 'Graduate Institute Geneva', 'Development economics insights', 'Quantitative methods expertise', NULL, NULL, 'Trade and development in sub-Saharan Africa', 'Development economics collaboration', ''),
('Dr. Sarah Mueller', 'sarah.mueller@ubs.com', '+41 44 234 11 11', 'UBS', 'Chief Economist Switzerland', 'Leading bank economist. Regular media commentator on Swiss economic developments.', 8, 8, 'UBS', 'Banking sector insights, market data', 'Academic economic forecasting methods', NULL, NULL, 'Swiss real estate market analysis', 'Industry insights and data sharing', ''),
('Dr. Marco Huwiler', 'marco.huwiler@credit-suisse.com', '+41 44 333 11 11', 'Credit Suisse', 'Senior Economist', 'Specialist in wealth management and private banking economics.', 7, 7, 'Credit Suisse', 'Wealth management data', 'Academic research on inequality', NULL, NULL, 'Wealth inequality trends in Switzerland', 'Private banking sector insights', ''),
('Dr. Alexandra Janssen', 'a.janssen@avenir-suisse.ch', '+41 44 445 90 00', 'Avenir Suisse', 'Senior Research Fellow', 'Liberal think tank researcher. Focus on economic policy and structural reforms.', 8, 8, 'Avenir Suisse', 'Policy analysis, reform proposals', 'Empirical economic research', NULL, NULL, 'Digital transformation of Swiss economy', 'Policy research collaboration', ''),
('Prof. Daniel Lampart', 'daniel.lampart@sgb.ch', '+41 31 377 01 01', 'Swiss Trade Union Federation', 'Chief Economist', 'Leading voice on labor economics and social policy in Switzerland.', 6, 7, 'Swiss Trade Union Federation', 'Labor market insights', 'Academic labor economics research', NULL, NULL, 'Impact of automation on Swiss labor market', 'Labor market research insights', ''),
('Dr. Hans Kaufmann', 'hans.kaufmann@ethz.ch', '+41 44 632 21 11', 'ETH Zurich', 'Professor of Behavioral Economics', 'Expert in behavioral economics and experimental methods. Active researcher in the field.', 8, 8, 'ETH Zurich', 'Experimental methods expertise', 'Policy guidance', NULL, NULL, 'Research project on behavioral economics', 'behavioral economics expertise sharing', ''),
('Prof. Anna Schmitt', 'anna.schmitt@uzh.ch', '+41 44 634 28 28', 'University of Zurich', 'Professor of Development Economics', 'Expert in development economics and emerging markets. Frequent conference speaker.', 7, 7, 'University of Zurich', 'Development economics insights', 'Market insights', NULL, NULL, 'Research project on development economics', 'development economics expertise sharing', ''),
('Dr. Peter Richter', 'peter.richter@unisg.ch', '+41 71 224 21 11', 'University of St. Gallen', 'Senior Researcher in Financial Markets', 'Expert in financial markets and banking. Active researcher in the field.', 6, 6, 'University of St. Gallen', 'Financial markets expertise', 'Academic collaboration', NULL, NULL, 'Research project on financial markets', 'financial markets expertise sharing', ''),
('Prof. Julia Weber', 'julia.weber@epfl.ch', '+41 21 693 11 11', 'EPFL', 'Professor of Digital Economics', 'Expert in digital economics and fintech. Frequent conference speaker.', 8, 9, 'EPFL', 'Digital economics insights', 'Research partnerships', NULL, NULL, 'Research project on digital economics', 'digital economics expertise sharing', ''),
('Dr. Michael Brown', 'michael.brown@swissre.com', '+41 43 285 21 21', 'Swiss Re', 'Chief Risk Officer', 'Expert in risk management and insurance. Active researcher in the field.', 7, 8, 'Swiss Re', 'Risk management expertise', 'Academic networks', NULL, NULL, 'Research project on risk management', 'risk management expertise sharing', ''),
('Prof. Elena Petrova', 'elena.petrova@mit.edu', '+1 617 253 10 00', 'MIT', 'Professor of Econometrics', 'Expert in econometrics and data science. Frequent conference speaker.', 5, 9, 'MIT', 'Econometric modeling', 'International networks', NULL, NULL, 'Research project on econometrics', 'econometrics expertise sharing', 'Conference contact'),
('Dr. Robert Chen', 'robert.chen@stanford.edu', '+1 650 723 20 00', 'Stanford University', 'Associate Professor of Economics', 'Expert in behavioral economics and psychology. Active researcher in the field.', 4, 7, 'Stanford University', 'Behavioral economics insights', 'Methodological expertise', NULL, NULL, 'Research project on behavioral economics', 'behavioral economics expertise sharing', ''),
('Prof. Catherine Davies', 'catherine.davies@lse.ac.uk', '+44 20 7405 72 86', 'London School of Economics', 'Professor of International Economics', 'Expert in international trade and globalization. Frequent conference speaker.', 6, 8, 'London School of Economics', 'International trade insights', 'Funding opportunities', NULL, NULL, 'Research project on international trade', 'international trade expertise sharing', ''),
('Dr. François Martin', 'francois.martin@sciencespo.fr', '+33 1 45 49 50 50', 'Sciences Po', 'Senior Economist', 'Expert in public finance and taxation. Active researcher in the field.', 5, 6, 'Sciences Po', 'Public finance expertise', 'Publication venues', NULL, NULL, 'Research project on public finance', 'public finance expertise sharing', 'Conference contact'),
('Prof. Giovanni Rossi', 'giovanni.rossi@mckinsey.com', '+41 44 268 11 11', 'McKinsey & Company', 'Partner in Economics Practice', 'Expert in innovation and entrepreneurship. Frequent conference speaker.', 7, 8, 'McKinsey & Company', 'Innovation insights', 'Conference speakers', NULL, NULL, 'Research project on innovation', 'innovation expertise sharing', ''),
('Dr. Lisa Johnson', 'lisa.johnson@bcg.com', '+41 22 561 33 33', 'Boston Consulting Group', 'Principal Economist', 'Expert in competition policy and regulation. Active researcher in the field.', 6, 7, 'Boston Consulting Group', 'Competition policy insights', 'Advisory roles', NULL, NULL, 'Research project on competition policy', 'competition policy expertise sharing', ''),
('Prof. David Wilson', 'david.wilson@deloitte.com', '+41 58 279 60 00', 'Deloitte', 'Director of Economic Research', 'Expert in urban economics and housing. Frequent conference speaker.', 5, 6, 'Deloitte', 'Urban economics insights', 'Consulting projects', NULL, NULL, 'Research project on urban economics', 'urban economics expertise sharing', ''),
('Dr. Sophie Laurent', 'sophie.laurent@ft.com', '+44 20 7873 30 00', 'Financial Times', 'Economic Correspondent', 'Expert in environmental economics and sustainability. Active researcher in the field.', 4, 5, 'Financial Times', 'Environmental economics insights', 'Data sharing opportunities', NULL, NULL, 'Research project on environmental economics', 'environmental economics expertise sharing', 'Conference contact'),
('Prof. James Anderson', 'james.anderson@economist.com', '+44 20 7830 70 00', 'The Economist', 'Editor, Economic Research', 'Expert in health economics and demographics. Frequent conference speaker.', 5, 6, 'The Economist', 'Health economics insights', 'Policy guidance', NULL, NULL, 'Research project on health economics', 'health economics expertise sharing', ''),
('Dr. Maria Lopez', 'maria.lopez@bloomberg.com', '+1 212 318 20 00', 'Bloomberg', 'Senior Economic Analyst', 'Expert in pension systems and social security. Active researcher in the field.', 6, 7, 'Bloomberg', 'Pension systems insights', 'Market insights', NULL, NULL, 'Research project on pension systems', 'pension systems expertise sharing', ''),
('Prof. Alessandro Bianchi', 'alessandro.bianchi@worldbank.org', '+1 202 473 10 00', 'World Bank', 'Senior Economist', 'Expert in labor economics and employment. Frequent conference speaker.', 7, 8, 'World Bank', 'Labor economics insights', 'Academic collaboration', NULL, NULL, 'Research project on labor economics', 'labor economics expertise sharing', ''),
('Dr. Nicole Weber', 'nicole.weber@eib.org', '+352 43 79 1', 'European Investment Bank', 'Principal Economist', 'Expert in macroeconomics and monetary policy. Active researcher in the field.', 6, 7, 'European Investment Bank', 'Macroeconomics insights', 'Research partnerships', NULL, NULL, 'Research project on macroeconomics', 'macroeconomics expertise sharing', 'Conference contact'),
('Prof. Klaus Mueller', 'klaus.mueller@bis.org', '+41 61 280 80 80', 'Bank for International Settlements', 'Head of Research', 'Expert in international economics and central banking. Frequent conference speaker.', 8, 9, 'Bank for International Settlements', 'Central banking insights', 'International networks', NULL, NULL, 'Research project on international economics', 'international economics expertise sharing', ''),
('Dr. Francesca Romano', 'francesca.romano@ecb.europa.eu', '+49 69 1344 0', 'European Central Bank', 'Senior Economist', 'Expert in monetary policy and financial stability. Active researcher in the field.', 7, 8, 'European Central Bank', 'Monetary policy insights', 'Methodological expertise', NULL, NULL, 'Research project on monetary policy', 'monetary policy expertise sharing', '');

-- Create additional contacts to reach closer to 150
INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit) VALUES
('Dr. Andreas Müller', 'andreas.mueller@ethz.ch', '+41 44 632 32 32', 'ETH Zurich', 'Professor of Economics', 'Expert in macroeconomics and monetary policy. Active researcher in the field.', 8, 8, 'ETH Zurich', 'Quantitative analysis expertise', 'Research partnerships', NULL, NULL, 'Research project on macroeconomics', 'macroeconomics expertise sharing'),
('Prof. Barbara Schmidt', 'barbara.schmidt@uzh.ch', '+41 44 634 39 39', 'University of Zurich', 'Professor of Financial Markets', 'Expert in financial markets and banking. Frequent conference speaker.', 7, 7, 'University of Zurich', 'Econometric modeling', 'Data sharing opportunities', NULL, NULL, 'Research project on financial-markets', 'financial-markets expertise sharing'),
('Dr. Christian Weber', 'christian.weber@unisg.ch', '+41 71 224 22 22', 'University of St. Gallen', 'Associate Professor of International Trade', 'Expert in international trade and globalization. Active researcher in the field.', 6, 6, 'University of St. Gallen', 'Policy insights', 'Academic collaboration', NULL, NULL, 'Research project on international-trade', 'international-trade expertise sharing'),
('Prof. Diana Wagner', 'diana.wagner@epfl.ch', '+41 21 693 12 12', 'EPFL', 'Professor of Labor Economics', 'Expert in labor economics and employment. Frequent conference speaker.', 8, 9, 'EPFL', 'Market data access', 'Academic networks', NULL, NULL, 'Research project on labor-economics', 'labor-economics expertise sharing'),
('Dr. Erik Becker', 'erik.becker@unibas.ch', '+41 61 207 33 33', 'University of Basel', 'Senior Researcher in Digital Economics', 'Expert in digital economics and fintech. Active researcher in the field.', 7, 8, 'University of Basel', 'Research collaboration', 'International networks', NULL, NULL, 'Research project on digital-economics', 'digital-economics expertise sharing'),
('Prof. Franziska Schulz', 'franziska.schulz@ethz.ch', '+41 44 632 43 43', 'ETH Zurich', 'Professor of Behavioral Economics', 'Expert in behavioral economics and psychology. Frequent conference speaker.', 8, 8, 'ETH Zurich', 'Academic networks', 'Methodological expertise', NULL, NULL, 'Research project on behavioral-economics', 'behavioral-economics expertise sharing'),
('Dr. Georg Hoffmann', 'georg.hoffmann@swissre.com', '+41 43 285 22 22', 'Swiss Re', 'Director of Economic Research', 'Expert in environmental economics and sustainability. Active researcher in the field.', 7, 8, 'Swiss Re', 'Industry connections', 'Funding opportunities', NULL, NULL, 'Research project on environmental-economics', 'environmental-economics expertise sharing'),
('Prof. Helena Koch', 'helena.koch@zurich.com', '+41 44 625 25 25', 'Zurich Insurance', 'Chief Economist', 'Expert in health economics and demographics. Frequent conference speaker.', 6, 7, 'Zurich Insurance', 'Regulatory expertise', 'Publication venues', NULL, NULL, 'Research project on health-economics', 'health-economics expertise sharing'),
('Dr. Ivan Richter', 'ivan.richter@roche.com', '+41 61 688 11 11', 'Roche', 'Head of Economic Analysis', 'Expert in urban economics and housing. Active researcher in the field.', 5, 6, 'Roche', 'International perspective', 'Conference speakers', NULL, NULL, 'Research project on urban-economics', 'urban-economics expertise sharing'),
('Prof. Julia Klein', 'julia.klein@novartis.com', '+41 61 324 11 11', 'Novartis', 'Senior Economic Advisor', 'Expert in innovation and entrepreneurship. Frequent conference speaker.', 6, 7, 'Novartis', 'Historical data', 'Advisory roles', NULL, NULL, 'Research project on innovation', 'innovation expertise sharing'),
('Dr. Klaus Wolf', 'klaus.wolf@nestle.com', '+41 21 924 21 11', 'Nestlé', 'Director of Economic Research', 'Expert in competition policy and regulation. Active researcher in the field.', 7, 8, 'Nestlé', 'Forecasting models', 'Consulting projects', NULL, NULL, 'Research project on competition-policy', 'competition-policy expertise sharing'),
('Prof. Laura Schröder', 'laura.schroeder@ecb.europa.eu', '+49 69 1344 1', 'European Central Bank', 'Principal Economist', 'Expert in pension systems and social security. Frequent conference speaker.', 8, 9, 'European Central Bank', 'Risk assessment methods', 'Data sharing opportunities', NULL, NULL, 'Research project on pension-systems', 'pension-systems expertise sharing'),
('Dr. Michael Neumann', 'michael.neumann@bankofengland.co.uk', '+44 20 3461 40 00', 'Bank of England', 'Senior Economist', 'Expert in macroeconomics and monetary policy. Active researcher in the field.', 7, 8, 'Bank of England', 'Quantitative analysis expertise', 'Policy guidance', NULL, NULL, 'Research project on macroeconomics', 'macroeconomics expertise sharing'),
('Prof. Nina Schwarz', 'nina.schwarz@federalreserve.gov', '+1 202 452 30 00', 'Federal Reserve', 'Senior Research Economist', 'Expert in financial markets and banking. Frequent conference speaker.', 6, 7, 'Federal Reserve', 'Econometric modeling', 'Market insights', NULL, NULL, 'Research project on financial-markets', 'financial-markets expertise sharing'),
('Dr. Oliver Zimmermann', 'oliver.zimmermann@mit.edu', '+1 617 253 11 00', 'MIT', 'Associate Professor of Economics', 'Expert in international trade and globalization. Active researcher in the field.', 5, 9, 'MIT', 'Policy insights', 'Academic collaboration', NULL, NULL, 'Research project on international-trade', 'international-trade expertise sharing'),
('Prof. Petra Braun', 'petra.braun@stanford.edu', '+1 650 723 21 00', 'Stanford University', 'Professor of Economics', 'Expert in labor economics and employment. Frequent conference speaker.', 4, 7, 'Stanford University', 'Market data access', 'Research partnerships', NULL, NULL, 'Research project on labor-economics', 'labor-economics expertise sharing'),
('Dr. Robert Krüger', 'robert.kruger@lse.ac.uk', '+44 20 7405 73 86', 'London School of Economics', 'Senior Lecturer in Economics', 'Expert in digital economics and fintech. Active researcher in the field.', 6, 8, 'London School of Economics', 'Research collaboration', 'International networks', NULL, NULL, 'Research project on digital-economics', 'digital-economics expertise sharing'),
('Prof. Sabine Hofmann', 'sabine.hofmann@oxford.ac.uk', '+44 1865 270 00', 'Oxford University', 'Professor of Economics', 'Expert in behavioral economics and psychology. Frequent conference speaker.', 5, 6, 'Oxford University', 'Academic networks', 'Methodological expertise', NULL, NULL, 'Research project on behavioral-economics', 'behavioral-economics expertise sharing'),
('Dr. Thomas Hartmann', 'thomas.hartmann@cambridge.ac.uk', '+44 1223 337 73', 'Cambridge University', 'Director of Economic Research', 'Expert in environmental economics and sustainability. Active researcher in the field.', 7, 8, 'Cambridge University', 'Industry connections', 'Funding opportunities', NULL, NULL, 'Research project on environmental-economics', 'environmental-economics expertise sharing'),
('Prof. Ursula Lange', 'ursula.lange@sciencespo.fr', '+33 1 45 49 51 50', 'Sciences Po', 'Professor of Economics', 'Expert in health economics and demographics. Frequent conference speaker.', 6, 7, 'Sciences Po', 'Regulatory expertise', 'Publication venues', NULL, NULL, 'Research project on health-economics', 'health-economics expertise sharing');

-- Get the IDs of the inserted contacts for foreign key references
DO $$
DECLARE
    contact_ids UUID[];
    i INTEGER;
BEGIN
    -- Get all contact IDs ordered by creation
    SELECT ARRAY(SELECT id FROM public.contacts WHERE name LIKE 'Dr.%' OR name LIKE 'Prof.%' ORDER BY created_at) INTO contact_ids;
    
    -- Insert contact tags for the first 30 contacts
    FOR i IN 1..LEAST(30, array_length(contact_ids, 1)) LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES
        (contact_ids[i], CASE (i % 10)
            WHEN 1 THEN 'monetary-policy'
            WHEN 2 THEN 'fiscal-policy'
            WHEN 3 THEN 'international-economics'
            WHEN 4 THEN 'OECD'
            WHEN 5 THEN 'financial-crises'
            WHEN 6 THEN 'exchange-rates'
            WHEN 7 THEN 'banking'
            WHEN 8 THEN 'development-economics'
            WHEN 9 THEN 'swiss-economy'
            ELSE 'macroeconomics'
        END),
        (contact_ids[i], CASE (i % 6)
            WHEN 1 THEN 'central-banking'
            WHEN 2 THEN 'government'
            WHEN 3 THEN 'research'
            WHEN 4 THEN 'policy'
            WHEN 5 THEN 'academia'
            ELSE 'consulting'
        END);
    END LOOP;
    
    -- Insert additional contacts to reach 150 total
    FOR i IN 1..100 LOOP
        INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit) VALUES
        ('Contact_' || (50 + i), 'contact' || (50 + i) || '@example.com', '+41 44 632 ' || LPAD((10 + i)::text, 2, '0') || ' ' || LPAD((10 + i)::text, 2, '0'), 
         CASE (i % 10)
            WHEN 1 THEN 'Swiss National Bank'
            WHEN 2 THEN 'University of Zurich'
            WHEN 3 THEN 'ETH Zurich'
            WHEN 4 THEN 'EPFL'
            WHEN 5 THEN 'McKinsey & Company'
            WHEN 6 THEN 'World Bank'
            WHEN 7 THEN 'IMF'
            WHEN 8 THEN 'European Central Bank'
            WHEN 9 THEN 'Bank for International Settlements'
            ELSE 'Credit Suisse'
         END,
         'Senior ' || CASE (i % 5)
            WHEN 1 THEN 'Economist'
            WHEN 2 THEN 'Researcher'
            WHEN 3 THEN 'Analyst'
            WHEN 4 THEN 'Advisor'
            ELSE 'Consultant'
         END,
         'Expert in economics and finance. Active researcher in the field.',
         (i % 6) + 3, -- cooperation_rating 3-8
         (i % 6) + 4, -- potential_score 4-9
         CASE (i % 10)
            WHEN 1 THEN 'Swiss National Bank'
            WHEN 2 THEN 'University of Zurich'
            WHEN 3 THEN 'ETH Zurich'
            WHEN 4 THEN 'EPFL'
            WHEN 5 THEN 'McKinsey & Company'
            WHEN 6 THEN 'World Bank'
            WHEN 7 THEN 'IMF'
            WHEN 8 THEN 'European Central Bank'
            WHEN 9 THEN 'Bank for International Settlements'
            ELSE 'Credit Suisse'
         END,
         CASE (i % 4)
            WHEN 1 THEN 'Economic analysis expertise'
            WHEN 2 THEN 'Research collaboration'
            WHEN 3 THEN 'Policy insights'
            ELSE 'Data sharing'
         END,
         CASE (i % 4)
            WHEN 1 THEN 'Academic partnerships'
            WHEN 2 THEN 'Industry insights'
            WHEN 3 THEN 'Research funding'
            ELSE 'International networks'
         END,
         NULL, NULL,
         'Research project on economics',
         'Economics expertise sharing');
    END LOOP;
    
    -- Add tags for the additional contacts
    SELECT ARRAY(SELECT id FROM public.contacts WHERE name LIKE 'Contact_%' ORDER BY created_at) INTO contact_ids;
    
    FOR i IN 1..LEAST(100, array_length(contact_ids, 1)) LOOP
        INSERT INTO public.contact_tags (contact_id, tag) VALUES
        (contact_ids[i], CASE (i % 8)
            WHEN 1 THEN 'macroeconomics'
            WHEN 2 THEN 'financial-markets'
            WHEN 3 THEN 'international-trade'
            WHEN 4 THEN 'labor-economics'
            WHEN 5 THEN 'digital-economics'
            WHEN 6 THEN 'behavioral-economics'
            WHEN 7 THEN 'development-economics'
            ELSE 'econometrics'
        END),
        (contact_ids[i], CASE (i % 5)
            WHEN 1 THEN 'banking'
            WHEN 2 THEN 'policy'
            WHEN 3 THEN 'research'
            WHEN 4 THEN 'academia'
            ELSE 'consulting'
        END);
    END LOOP;
    
END $$;