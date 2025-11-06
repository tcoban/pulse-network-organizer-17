import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  owner_id: string | null;
  target_value: number | null;
  current_value: number | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  assignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  team_member_id: string;
  role: string;
  assigned_at: string;
  team_member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          assignments:project_assignments(
            id,
            team_member_id,
            role,
            assigned_at,
            team_member:team_members!project_assignments_team_member_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData as any])
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created successfully');
      await fetchProjects();
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Project updated');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      // Check if this is the "Connect People" project
      const project = projects.find(p => p.id === id);
      if (project && project.type === 'networking' && project.title === 'Connect People') {
        toast.error('The "Connect People" project cannot be deleted as it\'s essential for BNI referral tracking');
        return false;
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Project deleted');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  const assignTeamMember = async (
    projectId: string, 
    teamMemberId: string, 
    role: string = 'contributor'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_assignments')
        .insert({
          project_id: projectId,
          team_member_id: teamMemberId,
          role
        });

      if (error) throw error;

      toast.success('Team member assigned');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error assigning team member:', error);
      toast.error('Failed to assign team member');
      return false;
    }
  };

  const removeTeamMember = async (assignmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Team member removed');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    assignTeamMember,
    removeTeamMember
  };
};