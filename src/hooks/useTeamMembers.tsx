import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  department: string;
  role: string;
  specializations: string[];
  bio?: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch from team_members table instead of profiles
      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('department', { ascending: true })
        .order('role', { ascending: true });

      if (error) throw error;

      const transformedMembers = members?.map(member => ({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        department: member.department,
        role: member.role,
        specializations: member.specializations || [],
        bio: member.bio
      })) || [];

      setTeamMembers(transformedMembers);
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
    return member?.name || 'Unassigned';
  };

  const getTeamMemberById = (id: string): TeamMember | undefined => {
    return teamMembers.find(m => m.id === id);
  };

  const getTeamMembersByDepartment = (department: string): TeamMember[] => {
    return teamMembers.filter(m => m.department === department);
  };

  const getTeamMembersBySpecialization = (specialization: string): TeamMember[] => {
    return teamMembers.filter(m => 
      m.specializations.includes(specialization)
    );
  };

  return { 
    teamMembers, 
    loading, 
    getTeamMemberName, 
    getTeamMemberById,
    getTeamMembersByDepartment,
    getTeamMembersBySpecialization,
    fetchTeamMembers 
  };
};