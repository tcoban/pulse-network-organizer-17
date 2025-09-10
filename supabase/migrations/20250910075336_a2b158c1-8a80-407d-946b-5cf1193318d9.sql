-- Create a function to make the first user an admin automatically
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    first_user_id UUID;
    admin_count INTEGER;
BEGIN
    -- Check if there are any admins already
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_roles 
    WHERE role = 'admin';
    
    -- If no admins exist, make the first user an admin
    IF admin_count = 0 THEN
        -- Get the first user (oldest account)
        SELECT id INTO first_user_id 
        FROM auth.users 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Make them an admin if they exist
        IF first_user_id IS NOT NULL THEN
            INSERT INTO public.user_roles (user_id, role)
            VALUES (first_user_id, 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
        END IF;
    END IF;
END;
$$;

-- Execute the function to make the first user an admin
SELECT public.make_first_user_admin();