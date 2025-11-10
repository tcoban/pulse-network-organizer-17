-- Fix project RLS policies for admin god mode
DROP POLICY IF EXISTS "Team members can view assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;

CREATE POLICY "Admins have full god mode access to all projects"
ON public.projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view their assigned projects"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM project_assignments pa
    JOIN team_members tm ON tm.id = pa.team_member_id
    WHERE pa.project_id = projects.id
      AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Fix goals RLS policies for admin god mode
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
DROP POLICY IF EXISTS "Admins can manage all goals" ON public.goals;
DROP POLICY IF EXISTS "Team members can view assigned goals" ON public.goals;
DROP POLICY IF EXISTS "Team members can update their assigned goals" ON public.goals;

CREATE POLICY "Admins have full god mode access to all goals"
ON public.goals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team members can view their assigned goals"
ON public.goals
FOR SELECT
USING (
  assigned_to IN (
    SELECT id FROM team_members 
    WHERE email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM goal_assignments ga
    JOIN team_members tm ON tm.id = ga.team_member_id
    WHERE ga.goal_id = goals.id
      AND tm.email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Team members can update their assigned goals"
ON public.goals
FOR UPDATE
USING (
  assigned_to IN (
    SELECT id FROM team_members 
    WHERE email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
);

-- Fix contacts RLS for admin god mode
DROP POLICY IF EXISTS "Users can view assigned contacts and admins can view all" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their assigned contacts and admins can update " ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete any contact, users can delete their assigned" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert contacts assigned to them" ON public.contacts;

CREATE POLICY "Admins have full god mode access to all contacts"
ON public.contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their assigned contacts"
ON public.contacts
FOR SELECT
USING (assigned_to = auth.uid());

CREATE POLICY "Users can manage their assigned contacts"
ON public.contacts
FOR ALL
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- Fix opportunities RLS for admin god mode
DROP POLICY IF EXISTS "Users can view opportunities for their assigned contacts" ON public.opportunities;
DROP POLICY IF EXISTS "Users can create opportunities for their assigned contacts" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update opportunities for their assigned contacts" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete opportunities for their assigned contacts" ON public.opportunities;

CREATE POLICY "Admins have full god mode access to all opportunities"
ON public.opportunities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view opportunities for their contacts"
ON public.opportunities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = opportunities.contact_id
      AND contacts.assigned_to = auth.uid()
  )
);

CREATE POLICY "Users can manage opportunities for their contacts"
ON public.opportunities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = opportunities.contact_id
      AND contacts.assigned_to = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = opportunities.contact_id
      AND contacts.assigned_to = auth.uid()
  )
);

-- Fix referrals_given RLS for admin god mode
DROP POLICY IF EXISTS "Users can manage their own referrals given" ON public.referrals_given;

CREATE POLICY "Admins have full god mode access to all referrals given"
ON public.referrals_given
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own referrals given"
ON public.referrals_given
FOR ALL
USING (auth.uid() = given_by)
WITH CHECK (auth.uid() = given_by);

-- Fix referrals_received RLS for admin god mode
DROP POLICY IF EXISTS "Users can manage their own referrals received" ON public.referrals_received;

CREATE POLICY "Admins have full god mode access to all referrals received"
ON public.referrals_received
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own referrals received"
ON public.referrals_received
FOR ALL
USING (auth.uid() = received_by)
WITH CHECK (auth.uid() = received_by);