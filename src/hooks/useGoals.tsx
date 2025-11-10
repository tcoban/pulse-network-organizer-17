import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  progress_percentage: number;
  status: string;
  linked_opportunity_id?: string;
  project_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  assignments?: GoalAssignment[];
  project?: {
    id: string;
    title: string;
  };
}

export interface GoalAssignment {
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

export const useGoals = (projectId?: string) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGoals([]);
        return;
      }

      // Fetch goals with assignments and projects
      let query = supabase
        .from('goals')
        .select(`
          *,
          assignments:goal_assignments(
            id,
            team_member_id,
            assigned_at,
            team_member:team_members!goal_assignments_team_member_id_fkey(
              id,
              first_name,
              last_name,
              email
            )
          ),
          project:projects(
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Partial<Goal>, teamMemberIds?: string[]): Promise<Goal | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to map current user to a team_member for RLS WITH CHECK
      let currentTeamMemberId: string | undefined;
      if (user.email) {
        const { data: tm } = await supabase
          .from('team_members')
          .select('id, email')
          .eq('email', user.email)
          .maybeSingle();
        currentTeamMemberId = tm?.id;
      }

      const payload = {
        title: goalData.title!,
        description: goalData.description,
        category: goalData.category!,
        target_date: goalData.target_date,
        status: goalData.status || 'active',
        progress_percentage: goalData.progress_percentage || 0,
        project_id: goalData.project_id,
        assigned_to: goalData.assigned_to || currentTeamMemberId,
        linked_opportunity_id: goalData.linked_opportunity_id
      };

      let { data, error: insertError } = await supabase
        .from('goals')
        .insert([payload])
        .select()
        .single();

      // If insert fails due to RLS and we have a project, try self-assigning to project first
      if (insertError && goalData.project_id && currentTeamMemberId) {
        // Try to self-assign to the project
        await supabase.from('project_assignments').insert({
          project_id: goalData.project_id,
          team_member_id: currentTeamMemberId,
          role: 'contributor'
        });

        // Retry the goal insert
        const retry = await supabase
          .from('goals')
          .insert([payload])
          .select()
          .single();
        
        data = retry.data;
        insertError = retry.error;
      }

      if (insertError) throw insertError;

      // Assign team members if provided
      if (data && teamMemberIds && teamMemberIds.length > 0) {
        const assignments = teamMemberIds.map(teamMemberId => ({
          goal_id: data.id,
          team_member_id: teamMemberId
        }));
        await supabase.from('goal_assignments').insert(assignments);
      }

      toast.success('Goal created successfully');
      await fetchGoals();
      return data;
    } catch (err: any) {
      console.error('Error creating goal:', err);
      const isRLSError = err?.code === '42501' ||
                         err?.message?.includes('row-level security') ||
                         err?.message?.includes('permission denied') ||
                         err?.message?.includes('policy');
      if (isRLSError) {
        toast.error('Permission Denied', {
          description: "You don't have permission to create this goal. Make sure you're assigned to the project or as a team member.",
        });
      } else {
        toast.error('Failed to create goal');
      }
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    try {
      // Ensure update passes RLS WITH CHECK by assigning to current user's team member when missing
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let finalUpdates = { ...updates } as Partial<Goal>;

      if (!finalUpdates.assigned_to) {
        // Check current goal assigned_to
        const { data: existing } = await supabase
          .from('goals')
          .select('assigned_to')
          .eq('id', id)
          .maybeSingle();

        if (!existing?.assigned_to && user.email) {
          const { data: tm } = await supabase
            .from('team_members')
            .select('id, email')
            .eq('email', user.email)
            .maybeSingle();
          if (tm?.id) {
            finalUpdates.assigned_to = tm.id;
          }
        }
      }

      const { error: updateError } = await supabase
        .from('goals')
        .update(finalUpdates)
        .eq('id', id);

      if (updateError) {
        // Propagate error for better handling upstream
        throw updateError;
      }

      toast.success('Goal updated');
      await fetchGoals();
      return true;
    } catch (err: any) {
      console.error('Error updating goal:', err);
      
      // Check for RLS/permission errors and provide specific guidance
      const isRLSError = err?.code === '42501' || 
                        err?.message?.includes('row-level security') ||
                        err?.message?.includes('permission denied') ||
                        err?.message?.includes('policy');
      
      if (isRLSError) {
        toast.error('Permission Denied', {
          description: 'You don\'t have permission to update this goal. Please ensure you\'re assigned to the goal or its project.',
          duration: 6000,
        });
      } else {
        toast.error('Failed to update goal', {
          description: err?.message || 'An unexpected error occurred.',
          duration: 5000,
        });
      }
      return false;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Goal deleted');
      await fetchGoals();
      return true;
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error('Failed to delete goal');
      return false;
    }
  };

  const assignTeamMember = async (
    goalId: string, 
    teamMemberId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goal_assignments')
        .insert({
          goal_id: goalId,
          team_member_id: teamMemberId
        });

      if (error) throw error;

      toast.success('Team member assigned');
      await fetchGoals();
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
        .from('goal_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Team member removed');
      await fetchGoals();
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [projectId]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    assignTeamMember,
    removeTeamMember
  };
};