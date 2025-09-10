-- Create team member profiles directly (without conflict clause)
INSERT INTO profiles (id, first_name, last_name, email, role)
VALUES 
  (gen_random_uuid(), 'Anna', 'Müller', 'anna.mueller@kof.ethz.ch', 'user'),
  (gen_random_uuid(), 'Marco', 'Schneider', 'marco.schneider@kof.ethz.ch', 'user'),
  (gen_random_uuid(), 'Sarah', 'Weber', 'sarah.weber@kof.ethz.ch', 'user'),
  (gen_random_uuid(), 'Thomas', 'Fischer', 'thomas.fischer@kof.ethz.ch', 'user'),
  (gen_random_uuid(), 'Nina', 'Becker', 'nina.becker@kof.ethz.ch', 'user');

-- Assign user roles for new team members  
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'user'::app_role
FROM profiles p
WHERE p.email LIKE '%@kof.ethz.ch'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'user'::app_role
  );

-- Assign all unassigned contacts to team members randomly
UPDATE contacts 
SET assigned_to = (
  SELECT id 
  FROM profiles 
  WHERE email LIKE '%@kof.ethz.ch' 
  ORDER BY random() 
  LIMIT 1
)
WHERE assigned_to IS NULL;