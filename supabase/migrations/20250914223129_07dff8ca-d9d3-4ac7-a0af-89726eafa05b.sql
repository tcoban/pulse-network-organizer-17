-- Insert Swiss KOF team members with their specializations
INSERT INTO team_members (first_name, last_name, email, department, role, specializations, bio) VALUES
-- Senior Management
('Dr. Hans', 'Zimmermann', 'hans.zimmermann@kof.ethz.ch', 'Management', 'Director', 
 ARRAY['strategic-planning', 'international-relations', 'policy-analysis'], 
 'Director with expertise in strategic planning and international economic relations.'),

('Prof. Elisabeth', 'Weber', 'elisabeth.weber@kof.ethz.ch', 'Research', 'Head of Research', 
 ARRAY['macroeconomics', 'forecasting', 'policy-research'], 
 'Head of Research specializing in macroeconomic forecasting and policy analysis.'),

-- Senior Research Team
('Dr. Andreas', 'Müller', 'andreas.mueller@kof.ethz.ch', 'Research', 'Senior Economist', 
 ARRAY['monetary-policy', 'banking', 'financial-markets'], 
 'Senior economist with deep expertise in monetary policy and financial markets.'),

('Dr. Claudia', 'Fischer', 'claudia.fischer@kof.ethz.ch', 'Research', 'Senior Economist', 
 ARRAY['labor-economics', 'education', 'social-policy'], 
 'Expert in labor economics, education policy and social security systems.'),

('Dr. Thomas', 'Huber', 'thomas.huber@kof.ethz.ch', 'Research', 'Senior Economist', 
 ARRAY['international-trade', 'globalization', 'emerging-markets'], 
 'Specialist in international trade, globalization trends and emerging market analysis.'),

('Dr. Margrit', 'Baumgartner', 'margrit.baumgartner@kof.ethz.ch', 'Research', 'Senior Economist', 
 ARRAY['innovation', 'technology', 'entrepreneurship'], 
 'Innovation researcher focusing on technology transfer and entrepreneurship ecosystems.'),

-- Research Associates
('Stefan', 'Meier', 'stefan.meier@kof.ethz.ch', 'Research', 'Research Associate', 
 ARRAY['econometrics', 'data-analysis', 'forecasting'], 
 'Research associate specializing in econometric modeling and data analysis.'),

('Nicole', 'Graf', 'nicole.graf@kof.ethz.ch', 'Research', 'Research Associate', 
 ARRAY['business-cycles', 'indicators', 'surveys'], 
 'Expert in business cycle analysis and economic indicator development.'),

('Daniel', 'Schneider', 'daniel.schneider@kof.ethz.ch', 'Research', 'Research Associate', 
 ARRAY['regional-economics', 'urban-development', 'housing'], 
 'Regional economist focusing on urban development and housing market analysis.'),

('Sandra', 'Keller', 'sandra.keller@kof.ethz.ch', 'Research', 'Research Associate', 
 ARRAY['energy-economics', 'sustainability', 'climate-policy'], 
 'Energy economist specializing in sustainability and climate policy research.'),

('Markus', 'Steiner', 'markus.steiner@kof.ethz.ch', 'Research', 'Research Associate', 
 ARRAY['corporate-finance', 'investment', 'capital-markets'], 
 'Corporate finance expert with focus on investment analysis and capital markets.'),

-- Data Services Team
('Beat', 'Wyss', 'beat.wyss@kof.ethz.ch', 'Data Services', 'Head of Data Services', 
 ARRAY['data-management', 'statistics', 'database-systems'], 
 'Head of Data Services managing statistical databases and data infrastructure.'),

('Petra', 'Hofmann', 'petra.hofmann@kof.ethz.ch', 'Data Services', 'Data Analyst', 
 ARRAY['statistical-analysis', 'data-visualization', 'reporting'], 
 'Data analyst specializing in statistical analysis and data visualization.'),

('Lukas', 'Brunner', 'lukas.brunner@kof.ethz.ch', 'Data Services', 'Data Scientist', 
 ARRAY['machine-learning', 'big-data', 'predictive-analytics'], 
 'Data scientist with expertise in machine learning and predictive analytics.'),

-- Communications & Outreach
('Carmen', 'Roth', 'carmen.roth@kof.ethz.ch', 'Communications', 'Communications Manager', 
 ARRAY['public-relations', 'media', 'stakeholder-engagement'], 
 'Communications manager handling media relations and stakeholder engagement.'),

('Michael', 'Baumann', 'michael.baumann@kof.ethz.ch', 'Communications', 'Communications Specialist', 
 ARRAY['content-creation', 'digital-media', 'events'], 
 'Communications specialist for content creation and digital media management.'),

-- International Relations
('Dr. Simone', 'Gerber', 'simone.gerber@kof.ethz.ch', 'International', 'International Relations Manager', 
 ARRAY['international-cooperation', 'EU-relations', 'multilateral-organizations'], 
 'Manager of international relations with focus on EU cooperation and multilateral organizations.'),

('Patrick', 'Lehmann', 'patrick.lehmann@kof.ethz.ch', 'International', 'International Relations Specialist', 
 ARRAY['development-economics', 'emerging-markets', 'trade-policy'], 
 'International relations specialist focusing on development economics and trade policy.'),

-- Administration & Operations
('Ursula', 'Frei', 'ursula.frei@kof.ethz.ch', 'Administration', 'Operations Manager', 
 ARRAY['operations', 'finance', 'human-resources'], 
 'Operations manager overseeing finance, HR and administrative operations.'),

('Werner', 'Schmid', 'werner.schmid@kof.ethz.ch', 'Administration', 'IT Manager', 
 ARRAY['information-technology', 'systems', 'security'], 
 'IT manager responsible for information systems and cybersecurity.'),

-- Junior Researchers
('Julia', 'Widmer', 'julia.widmer@kof.ethz.ch', 'Research', 'Junior Researcher', 
 ARRAY['health-economics', 'demographics', 'social-security'], 
 'Junior researcher specializing in health economics and demographic analysis.'),

('Marco', 'Vogel', 'marco.vogel@kof.ethz.ch', 'Research', 'Junior Researcher', 
 ARRAY['behavioral-economics', 'consumer-behavior', 'market-research'], 
 'Junior researcher focusing on behavioral economics and consumer behavior analysis.');