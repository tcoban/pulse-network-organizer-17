import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export interface TeamMemberView {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: string;
}

export const useGhostMode = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [ghostUserId, setGhostUserId] = useState<string | null>(null);
  const [availableMembers, setAvailableMembers] = useState<TeamMemberView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [isAdmin]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setAvailableMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableGhostMode = (teamMemberId: string) => {
    if (!isAdmin) return;
    setGhostUserId(teamMemberId);
  };

  const disableGhostMode = () => {
    setGhostUserId(null);
  };

  const getActiveUserId = () => {
    return ghostUserId || user?.id || null;
  };

  const isGhostModeActive = ghostUserId !== null;

  return {
    isGhostModeActive,
    ghostUserId,
    availableMembers,
    loading,
    enableGhostMode,
    disableGhostMode,
    getActiveUserId,
    canUseGhostMode: isAdmin,
  };
};
