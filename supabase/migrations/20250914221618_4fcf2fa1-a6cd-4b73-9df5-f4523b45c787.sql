-- First, let's add the Swiss team members to the profiles table
-- Insert Swiss KOF team members
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES
  (gen_random_uuid(), 'hans.zimmermann@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Hans", "last_name": "Zimmermann"}'),
  (gen_random_uuid(), 'elisabeth.weber@kof.ethz.ch', now(), now(), now(), '{"first_name": "Prof. Elisabeth", "last_name": "Weber"}'),
  (gen_random_uuid(), 'andreas.mueller@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Andreas", "last_name": "Müller"}'),
  (gen_random_uuid(), 'claudia.fischer@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Claudia", "last_name": "Fischer"}'),
  (gen_random_uuid(), 'thomas.huber@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Thomas", "last_name": "Huber"}'),
  (gen_random_uuid(), 'margrit.baumgartner@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Margrit", "last_name": "Baumgartner"}'),
  (gen_random_uuid(), 'stefan.meier@kof.ethz.ch', now(), now(), now(), '{"first_name": "Stefan", "last_name": "Meier"}'),
  (gen_random_uuid(), 'nicole.graf@kof.ethz.ch', now(), now(), now(), '{"first_name": "Nicole", "last_name": "Graf"}'),
  (gen_random_uuid(), 'daniel.schneider@kof.ethz.ch', now(), now(), now(), '{"first_name": "Daniel", "last_name": "Schneider"}'),
  (gen_random_uuid(), 'sandra.keller@kof.ethz.ch', now(), now(), now(), '{"first_name": "Sandra", "last_name": "Keller"}'),
  (gen_random_uuid(), 'markus.steiner@kof.ethz.ch', now(), now(), now(), '{"first_name": "Markus", "last_name": "Steiner"}'),
  (gen_random_uuid(), 'beat.wyss@kof.ethz.ch', now(), now(), now(), '{"first_name": "Beat", "last_name": "Wyss"}'),
  (gen_random_uuid(), 'petra.hofmann@kof.ethz.ch', now(), now(), now(), '{"first_name": "Petra", "last_name": "Hofmann"}'),
  (gen_random_uuid(), 'lukas.brunner@kof.ethz.ch', now(), now(), now(), '{"first_name": "Lukas", "last_name": "Brunner"}'),
  (gen_random_uuid(), 'carmen.roth@kof.ethz.ch', now(), now(), now(), '{"first_name": "Carmen", "last_name": "Roth"}'),
  (gen_random_uuid(), 'michael.baumann@kof.ethz.ch', now(), now(), now(), '{"first_name": "Michael", "last_name": "Baumann"}'),
  (gen_random_uuid(), 'simone.gerber@kof.ethz.ch', now(), now(), now(), '{"first_name": "Dr. Simone", "last_name": "Gerber"}'),
  (gen_random_uuid(), 'patrick.lehmann@kof.ethz.ch', now(), now(), now(), '{"first_name": "Patrick", "last_name": "Lehmann"}'),
  (gen_random_uuid(), 'ursula.frei@kof.ethz.ch', now(), now(), now(), '{"first_name": "Ursula", "last_name": "Frei"}'),
  (gen_random_uuid(), 'werner.schmid@kof.ethz.ch', now(), now(), now(), '{"first_name": "Werner", "last_name": "Schmid"}'),
  (gen_random_uuid(), 'julia.widmer@kof.ethz.ch', now(), now(), now(), '{"first_name": "Julia", "last_name": "Widmer"}'),
  (gen_random_uuid(), 'marco.vogel@kof.ethz.ch', now(), now(), now(), '{"first_name": "Marco", "last_name": "Vogel"}')
ON CONFLICT (email) DO NOTHING;

-- Assign team member user roles
WITH team_user_ids AS (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@kof.ethz.ch' 
  AND email != 'tcoban@ethz.ch'
)
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'::app_role FROM team_user_ids
ON CONFLICT (user_id, role) DO NOTHING;