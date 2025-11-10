import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Target {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  target_date: string | null;
  status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  assignments?: TargetAssignment[];
}

export interface TargetAssignment {
  id: string;
  team_member_id: string;
  assigned_at: string;
  team_member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useTargets = (projectId?: string) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTargets(data || []);
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast.error('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const createTarget = async (targetData: Partial<Target>): Promise<Target | null> => {
    try {
      const { data, error } = await supabase
        .from('targets')
        .insert([targetData as any])
        .select()
        .single();

      if (error) throw error;

      toast.success('Target created successfully');
      await fetchTargets();
      return data;
    } catch (error) {
      console.error('Error creating target:', error);
      toast.error('Failed to create target');
      return null;
    }
  };

  const updateTarget = async (id: string, updates: Partial<Target>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('targets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Target updated');
      await fetchTargets();
      return true;
    } catch (error) {
      console.error('Error updating target:', error);
      toast.error('Failed to update target');
      return false;
    }
  };

  const deleteTarget = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('targets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Target deleted');
      await fetchTargets();
      return true;
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('Failed to delete target');
      return false;
    }
  };

  const assignTeamMember = async (
    targetId: string, 
    teamMemberId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('target_assignments')
        .insert({
          target_id: targetId,
          team_member_id: teamMemberId
        });

      if (error) throw error;

      toast.success('Team member assigned');
      await fetchTargets();
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
        .from('target_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Team member removed');
      await fetchTargets();
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
      return false;
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [projectId]);

  return {
    targets,
    loading,
    fetchTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    assignTeamMember,
    removeTeamMember
  };
};