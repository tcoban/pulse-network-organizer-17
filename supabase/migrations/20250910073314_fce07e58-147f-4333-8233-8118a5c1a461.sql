-- Insert synthetic contacts for ETH Zurich economic research institute

-- Insert main contacts
INSERT INTO public.contacts (name, email, phone, company, position, notes, cooperation_rating, potential_score, affiliation, offering, looking_for, assigned_to, created_by, current_projects, mutual_benefit, referred_by) VALUES
('Dr. Andrea Weber', 'andrea.weber@snb.ch', '+41 44 631 31 11', 'Swiss National Bank', 'Senior Economist, Monetary Policy', 'Expert in monetary policy transmission mechanisms. Regular speaker at SNB conferences.', 9, 10, 'Swiss National Bank', 'Central bank policy insights, macro data', 'Academic research on cryptocurrency impact', 'team', 'team', 'Digital franc feasibility study', 'SNB insights on monetary policy implementation', 'Prof. Ernst Baltensperger'),
('Prof. Thomas Zimmermann', 'thomas.zimmermann@seco.admin.ch', '+41 58 462 56 56', 'State Secretariat for Economic Affairs (SECO)', 'Head of Macroeconomic Analysis', 'Leading government economist. Key contact for fiscal policy research collaboration.', 8, 9, 'Swiss Federal Government', 'Government economic perspectives, policy data', 'Economic modeling expertise', 'team', 'team', 'COVID-19 economic recovery analysis', 'Government economic data access', ''),
('Dr. Maria Rodriguez', 'm.rodriguez@imf.org', '+1 202 623 7000', 'International Monetary Fund', 'Senior Economist, European Department', 'IMF mission chief for Switzerland. Expert in international monetary systems.', 7, 9, 'International Monetary Fund', 'International perspective, cross-country data', 'Swiss economic research, local insights', 'team', 'team', 'Article IV consultation Switzerland 2024', 'IMF research collaboration opportunities', 'Dr. Andrea Weber'),
('Prof. Jean-Claude Trichet', 'jean-claude.trichet@oecd.org', '+33 1 45 24 82 00', 'OECD', 'Senior Advisor, Economics Department', 'Former ECB President. Now OECD senior advisor. Influential voice in European monetary policy.', 6, 8, 'OECD', 'Policy frameworks, international best practices', 'Academic expertise on digital finance', 'team', 'team', 'Digital currencies policy framework', 'OECD platform for research dissemination', ''),
('Prof. Carmen Reinhart', 'creinhart@hks.harvard.edu', '+1 617 495 1155', 'Harvard Kennedy School', 'Minos A. Zombanakis Professor of the International Financial System', 'World-renowned expert on financial crises and sovereign debt. Former World Bank Chief Economist.', 5, 10, 'Harvard University', 'Financial crisis expertise, historical data', 'European financial stability research', 'team', 'team', 'This Time is Different - Updated Analysis', 'Joint research on financial stability', ''),
('Prof. Kenneth Rogoff', 'krogoff@harvard.edu', '+1 617 495 4511', 'Harvard University', 'Thomas D. Cabot Professor of Public Policy', 'Former IMF Chief Economist. Expert in international economics and exchange rates.', 4, 9, 'Harvard University', 'International macro expertise', 'Swiss monetary policy insights', 'team', 'team', 'Cash and the COVID-19 pandemic', 'Collaboration on international monetary issues', ''),
('Prof. Beatrice Weder di Mauro', 'beatrice.wederdimauro@econ.uzh.ch', '+41 44 634 37 28', 'University of Zurich', 'Professor of International and Monetary Economics', 'Former German Council of Economic Experts member. Expert in international finance.', 9, 9, 'University of Zurich', 'International banking expertise', 'Swiss financial sector analysis', 'team', 'team', 'European banking union assessment', 'Cross-university research collaboration', ''),
('Prof. Michel Habib', 'michel.habib@graduateinstitute.ch', '+41 22 908 57 00', 'Graduate Institute Geneva', 'Professor of International Economics', 'Expert in development economics and international trade. Strong networks in emerging markets.', 7, 8, 'Graduate Institute Geneva', 'Development economics insights', 'Quantitative methods expertise', 'team', 'team', 'Trade and development in sub-Saharan Africa', 'Development economics collaboration', ''),
('Dr. Sarah Mueller', 'sarah.mueller@ubs.com', '+41 44 234 11 11', 'UBS', 'Chief Economist Switzerland', 'Leading bank economist. Regular media commentator on Swiss economic developments.', 8, 8, 'UBS', 'Banking sector insights, market data', 'Academic economic forecasting methods', 'team', 'team', 'Swiss real estate market analysis', 'Industry insights and data sharing', ''),
('Dr. Marco Huwiler', 'marco.huwiler@credit-suisse.com', '+41 44 333 11 11', 'Credit Suisse', 'Senior Economist', 'Specialist in wealth management and private banking economics.', 7, 7, 'Credit Suisse', 'Wealth management data', 'Academic research on inequality', 'team', 'team', 'Wealth inequality trends in Switzerland', 'Private banking sector insights', ''),
('Dr. Alexandra Janssen', 'a.janssen@avenir-suisse.ch', '+41 44 445 90 00', 'Avenir Suisse', 'Senior Research Fellow', 'Liberal think tank researcher. Focus on economic policy and structural reforms.', 8, 8, 'Avenir Suisse', 'Policy analysis, reform proposals', 'Empirical economic research', 'team', 'team', 'Digital transformation of Swiss economy', 'Policy research collaboration', ''),
('Prof. Daniel Lampart', 'daniel.lampart@sgb.ch', '+41 31 377 01 01', 'Swiss Trade Union Federation', 'Chief Economist', 'Leading voice on labor economics and social policy in Switzerland.', 6, 7, 'Swiss Trade Union Federation', 'Labor market insights', 'Academic labor economics research', 'team', 'team', 'Impact of automation on Swiss labor market', 'Labor market research insights', ''),
('Dr. Hans Kaufmann', 'hans.kaufmann@ethz.ch', '+41 44 632 21 11', 'ETH Zurich', 'Professor of Behavioral Economics', 'Expert in behavioral economics and experimental methods. Active researcher in the field.', 8, 8, 'ETH Zurich', 'Experimental methods expertise', 'Policy guidance', 'team', 'team', 'Research project on behavioral-economics', 'behavioral-economics expertise sharing', ''),
('Prof. Anna Schmitt', 'anna.schmitt@uzh.ch', '+41 44 634 28 28', 'University of Zurich', 'Professor of Development Economics', 'Expert in development economics and emerging markets. Frequent conference speaker.', 7, 7, 'University of Zurich', 'Development economics insights', 'Market insights', 'team', 'team', 'Research project on development-economics', 'development-economics expertise sharing', ''),
('Dr. Peter Richter', 'peter.richter@unisg.ch', '+41 71 224 21 11', 'University of St. Gallen', 'Senior Researcher in Financial Markets', 'Expert in financial markets and banking. Active researcher in the field.', 6, 6, 'University of St. Gallen', 'Financial markets expertise', 'Academic collaboration', 'team', 'team', 'Research project on financial-markets', 'financial-markets expertise sharing', ''),
('Prof. Julia Weber', 'julia.weber@epfl.ch', '+41 21 693 11 11', 'EPFL', 'Professor of Digital Economics', 'Expert in digital economics and fintech. Frequent conference speaker.', 8, 9, 'EPFL', 'Digital economics insights', 'Research partnerships', 'team', 'team', 'Research project on digital-economics', 'digital-economics expertise sharing', ''),
('Dr. Michael Brown', 'michael.brown@swissre.com', '+41 43 285 21 21', 'Swiss Re', 'Chief Risk Officer', 'Expert in risk management and insurance. Active researcher in the field.', 7, 8, 'Swiss Re', 'Risk management expertise', 'Academic networks', 'team', 'team', 'Research project on risk-management', 'risk-management expertise sharing', ''),
('Prof. Elena Petrova', 'elena.petrova@mit.edu', '+1 617 253 10 00', 'MIT', 'Professor of Econometrics', 'Expert in econometrics and data science. Frequent conference speaker.', 5, 9, 'MIT', 'Econometric modeling', 'International networks', 'team', 'team', 'Research project on econometrics', 'econometrics expertise sharing', 'Conference contact'),
('Dr. Robert Chen', 'robert.chen@stanford.edu', '+1 650 723 20 00', 'Stanford University', 'Associate Professor of Economics', 'Expert in behavioral economics and psychology. Active researcher in the field.', 4, 7, 'Stanford University', 'Behavioral economics insights', 'Methodological expertise', 'team', 'team', 'Research project on behavioral-economics', 'behavioral-economics expertise sharing', ''),
('Prof. Catherine Davies', 'catherine.davies@lse.ac.uk', '+44 20 7405 72 86', 'London School of Economics', 'Professor of International Economics', 'Expert in international trade and globalization. Frequent conference speaker.', 6, 8, 'London School of Economics', 'International trade insights', 'Funding opportunities', 'team', 'team', 'Research project on international-trade', 'international-trade expertise sharing', ''),
('Dr. François Martin', 'francois.martin@sciencespo.fr', '+33 1 45 49 50 50', 'Sciences Po', 'Senior Economist', 'Expert in public finance and taxation. Active researcher in the field.', 5, 6, 'Sciences Po', 'Public finance expertise', 'Publication venues', 'team', 'team', 'Research project on public-finance', 'public-finance expertise sharing', 'Conference contact'),
('Prof. Giovanni Rossi', 'giovanni.rossi@mckinsey.com', '+41 44 268 11 11', 'McKinsey & Company', 'Partner in Economics Practice', 'Expert in innovation and entrepreneurship. Frequent conference speaker.', 7, 8, 'McKinsey & Company', 'Innovation insights', 'Conference speakers', 'team', 'team', 'Research project on innovation', 'innovation expertise sharing', ''),
('Dr. Lisa Johnson', 'lisa.johnson@bcg.com', '+41 22 561 33 33', 'Boston Consulting Group', 'Principal Economist', 'Expert in competition policy and regulation. Active researcher in the field.', 6, 7, 'Boston Consulting Group', 'Competition policy insights', 'Advisory roles', 'team', 'team', 'Research project on competition-policy', 'competition-policy expertise sharing', ''),
('Prof. David Wilson', 'david.wilson@deloitte.com', '+41 58 279 60 00', 'Deloitte', 'Director of Economic Research', 'Expert in urban economics and housing. Frequent conference speaker.', 5, 6, 'Deloitte', 'Urban economics insights', 'Consulting projects', 'team', 'team', 'Research project on urban-economics', 'urban-economics expertise sharing', ''),
('Dr. Sophie Laurent', 'sophie.laurent@ft.com', '+44 20 7873 30 00', 'Financial Times', 'Economic Correspondent', 'Expert in environmental economics and sustainability. Active researcher in the field.', 4, 5, 'Financial Times', 'Environmental economics insights', 'Data sharing opportunities', 'team', 'team', 'Research project on environmental-economics', 'environmental-economics expertise sharing', 'Conference contact'),
('Prof. James Anderson', 'james.anderson@economist.com', '+44 20 7830 70 00', 'The Economist', 'Editor, Economic Research', 'Expert in health economics and demographics. Frequent conference speaker.', 5, 6, 'The Economist', 'Health economics insights', 'Policy guidance', 'team', 'team', 'Research project on health-economics', 'health-economics expertise sharing', ''),
('Dr. Maria Lopez', 'maria.lopez@bloomberg.com', '+1 212 318 20 00', 'Bloomberg', 'Senior Economic Analyst', 'Expert in pension systems and social security. Active researcher in the field.', 6, 7, 'Bloomberg', 'Pension systems insights', 'Market insights', 'team', 'team', 'Research project on pension-systems', 'pension-systems expertise sharing', ''),
('Prof. Alessandro Bianchi', 'alessandro.bianchi@worldbank.org', '+1 202 473 10 00', 'World Bank', 'Senior Economist', 'Expert in labor economics and employment. Frequent conference speaker.', 7, 8, 'World Bank', 'Labor economics insights', 'Academic collaboration', 'team', 'team', 'Research project on labor-economics', 'labor-economics expertise sharing', ''),
('Dr. Nicole Weber', 'nicole.weber@eib.org', '+352 43 79 1', 'European Investment Bank', 'Principal Economist', 'Expert in macroeconomics and monetary policy. Active researcher in the field.', 6, 7, 'European Investment Bank', 'Macroeconomics insights', 'Research partnerships', 'team', 'team', 'Research project on macroeconomics', 'macroeconomics expertise sharing', 'Conference contact'),
('Prof. Klaus Mueller', 'klaus.mueller@bis.org', '+41 61 280 80 80', 'Bank for International Settlements', 'Head of Research', 'Expert in international economics and central banking. Frequent conference speaker.', 8, 9, 'Bank for International Settlements', 'Central banking insights', 'International networks', 'team', 'team', 'Research project on international-economics', 'international-economics expertise sharing', ''),
('Dr. Francesca Romano', 'francesca.romano@ecb.europa.eu', '+49 69 1344 0', 'European Central Bank', 'Senior Economist', 'Expert in monetary policy and financial stability. Active researcher in the field.', 7, 8, 'European Central Bank', 'Monetary policy insights', 'Methodological expertise', 'team', 'team', 'Research project on monetary-policy', 'monetary-policy expertise sharing', '');

-- Get the IDs of the inserted contacts for foreign key references
DO $$
DECLARE
    contact_ids UUID[];
    current_contact_id UUID;
    i INTEGER;
BEGIN
    -- Get all contact IDs
    SELECT ARRAY(SELECT id FROM public.contacts ORDER BY created_at) INTO contact_ids;
    
    -- Insert contact tags
    INSERT INTO public.contact_tags (contact_id, tag) VALUES
    -- Dr. Andrea Weber tags
    (contact_ids[1], 'monetary-policy'),
    (contact_ids[1], 'central-banking'),
    (contact_ids[1], 'swiss-economy'),
    -- Prof. Thomas Zimmermann tags
    (contact_ids[2], 'fiscal-policy'),
    (contact_ids[2], 'macroeconomics'),
    (contact_ids[2], 'swiss-government'),
    -- Dr. Maria Rodriguez tags
    (contact_ids[3], 'international-economics'),
    (contact_ids[3], 'IMF'),
    (contact_ids[3], 'european-economy'),
    -- Prof. Jean-Claude Trichet tags
    (contact_ids[4], 'OECD'),
    (contact_ids[4], 'monetary-policy'),
    (contact_ids[4], 'european-integration'),
    -- Prof. Carmen Reinhart tags
    (contact_ids[5], 'financial-crises'),
    (contact_ids[5], 'sovereign-debt'),
    (contact_ids[5], 'harvard'),
    -- Prof. Kenneth Rogoff tags
    (contact_ids[6], 'international-economics'),
    (contact_ids[6], 'exchange-rates'),
    (contact_ids[6], 'harvard'),
    -- Prof. Beatrice Weder di Mauro tags
    (contact_ids[7], 'UZH'),
    (contact_ids[7], 'international-economics'),
    (contact_ids[7], 'financial-stability'),
    -- Prof. Michel Habib tags
    (contact_ids[8], 'IHEID'),
    (contact_ids[8], 'development-economics'),
    (contact_ids[8], 'trade'),
    -- Dr. Sarah Mueller tags
    (contact_ids[9], 'UBS'),
    (contact_ids[9], 'banking'),
    (contact_ids[9], 'swiss-economy'),
    -- Dr. Marco Huwiler tags
    (contact_ids[10], 'credit-suisse'),
    (contact_ids[10], 'banking'),
    (contact_ids[10], 'wealth-management'),
    -- Dr. Alexandra Janssen tags
    (contact_ids[11], 'think-tank'),
    (contact_ids[11], 'economic-policy'),
    (contact_ids[11], 'switzerland'),
    -- Prof. Daniel Lampart tags
    (contact_ids[12], 'labor-economics'),
    (contact_ids[12], 'trade-unions'),
    (contact_ids[12], 'social-policy');
    
    -- Add random tags for remaining contacts
    FOR i IN 13..30 LOOP
        IF i <= array_length(contact_ids, 1) THEN
            INSERT INTO public.contact_tags (contact_id, tag) VALUES
            (contact_ids[i], CASE (i % 8)
                WHEN 0 THEN 'macroeconomics'
                WHEN 1 THEN 'financial-markets'
                WHEN 2 THEN 'international-trade'
                WHEN 3 THEN 'labor-economics'
                WHEN 4 THEN 'digital-economics'
                WHEN 5 THEN 'behavioral-economics'
                WHEN 6 THEN 'development-economics'
                ELSE 'econometrics'
            END),
            (contact_ids[i], CASE (i % 5)
                WHEN 0 THEN 'banking'
                WHEN 1 THEN 'policy'
                WHEN 2 THEN 'research'
                WHEN 3 THEN 'academia'
                ELSE 'consulting'
            END);
        END IF;
    END LOOP;
    
    -- Insert contact preferences for some contacts
    INSERT INTO public.contact_preferences (contact_id, language, preferred_channel, available_times, meeting_location) VALUES
    (contact_ids[1], 'German', 'email', 'Weekdays 9-17', 'Zurich'),
    (contact_ids[2], 'German', 'phone', 'Weekdays 8-18', 'Bern'),
    (contact_ids[3], 'English', 'email', 'Weekdays 14-22', 'Washington DC'),
    (contact_ids[4], 'French', 'email', 'Weekdays 9-17', 'Paris'),
    (contact_ids[5], 'English', 'email', 'Weekdays 14-22', 'Cambridge'),
    (contact_ids[7], 'German', 'phone', 'Weekdays 9-17', 'Zurich'),
    (contact_ids[8], 'French', 'email', 'Weekdays 9-17', 'Geneva'),
    (contact_ids[9], 'German', 'phone', 'Weekdays 8-18', 'Zurich'),
    (contact_ids[11], 'German', 'email', 'Weekdays 9-17', 'Zurich'),
    (contact_ids[12], 'German', 'phone', 'Weekdays 9-17', 'Bern');
    
    -- Insert social links for contacts
    INSERT INTO public.contact_social_links (contact_id, platform, url) VALUES
    (contact_ids[1], 'linkedin', 'https://linkedin.com/in/andrea-weber-snb'),
    (contact_ids[2], 'linkedin', 'https://linkedin.com/in/thomas-zimmermann-seco'),
    (contact_ids[3], 'linkedin', 'https://linkedin.com/in/maria-rodriguez-imf'),
    (contact_ids[4], 'linkedin', 'https://linkedin.com/in/jc-trichet-oecd'),
    (contact_ids[5], 'linkedin', 'https://linkedin.com/in/carmen-reinhart-harvard'),
    (contact_ids[6], 'linkedin', 'https://linkedin.com/in/kenneth-rogoff'),
    (contact_ids[7], 'linkedin', 'https://linkedin.com/in/beatrice-weder-di-mauro'),
    (contact_ids[8], 'linkedin', 'https://linkedin.com/in/michel-habib-geneva'),
    (contact_ids[9], 'linkedin', 'https://linkedin.com/in/sarah-mueller-ubs'),
    (contact_ids[10], 'linkedin', 'https://linkedin.com/in/marco-huwiler-cs'),
    (contact_ids[11], 'linkedin', 'https://linkedin.com/in/alexandra-janssen-avenir'),
    (contact_ids[12], 'linkedin', 'https://linkedin.com/in/daniel-lampart-sgb');
    
    -- Add LinkedIn profiles for remaining contacts
    FOR i IN 13..30 LOOP
        IF i <= array_length(contact_ids, 1) THEN
            INSERT INTO public.contact_social_links (contact_id, platform, url) VALUES
            (contact_ids[i], 'linkedin', 'https://linkedin.com/in/contact-' || i);
        END IF;
    END LOOP;
    
END $$;