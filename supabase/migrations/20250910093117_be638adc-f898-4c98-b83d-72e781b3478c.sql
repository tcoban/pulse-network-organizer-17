-- Create team members if they don't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'anna.mueller@kof.ethz.ch', crypt('TempPass123!', gen_salt('bf')), now(), '{"first_name": "Anna", "last_name": "Müller"}', now(), now()),
  (gen_random_uuid(), 'marco.schneider@kof.ethz.ch', crypt('TempPass123!', gen_salt('bf')), now(), '{"first_name": "Marco", "last_name": "Schneider"}', now(), now()),
  (gen_random_uuid(), 'sarah.weber@kof.ethz.ch', crypt('TempPass123!', gen_salt('bf')), now(), '{"first_name": "Sarah", "last_name": "Weber"}', now(), now()),
  (gen_random_uuid(), 'thomas.fischer@kof.ethz.ch', crypt('TempPass123!', gen_salt('bf')), now(), '{"first_name": "Thomas", "last_name": "Fischer"}', now(), now()),
  (gen_random_uuid(), 'nina.becker@kof.ethz.ch', crypt('TempPass123!', gen_salt('bf')), now(), '{"first_name": "Nina", "last_name": "Becker"}', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Create profiles for team members
INSERT INTO profiles (id, first_name, last_name, email, role)
SELECT u.id, u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'last_name', u.email, 'user'
FROM auth.users u
WHERE u.email LIKE '%@kof.ethz.ch'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

-- Assign user roles
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'user'::app_role
FROM profiles p
WHERE p.email LIKE '%@kof.ethz.ch'
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign all unassigned contacts to team members randomly
WITH team_members AS (
  SELECT id FROM profiles WHERE email LIKE '%@kof.ethz.ch'
),
unassigned_contacts AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM contacts 
  WHERE assigned_to IS NULL
),
assignments AS (
  SELECT 
    uc.id as contact_id,
    (SELECT id FROM team_members ORDER BY random() LIMIT 1) as team_member_id
  FROM unassigned_contacts uc
)
UPDATE contacts 
SET assigned_to = assignments.team_member_id
FROM assignments
WHERE contacts.id = assignments.contact_id;