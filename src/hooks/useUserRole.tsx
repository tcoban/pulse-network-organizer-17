import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else if (data && data.length > 0) {
          setRole(data[0].role as UserRole);
        } else {
          setRole('user'); // Default to user role if no role found
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return {
    role,
    loading,
    isAdmin,
    isUser,
  };
};