import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');

      if (error) throw error;

      const members = profiles?.map(profile => ({
        id: profile.id,
        name: profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile.email || 'Unknown Team Member',
        email: profile.email || ''
      })) || [];

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(m => m.id === id);
    return member?.name || 'Team Member';
  };

  return { teamMembers, loading, getTeamMemberName, fetchTeamMembers };
};