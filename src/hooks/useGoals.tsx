import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  progress_percentage: number;
  status: string;
  linked_opportunity_id?: string;
  target_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  assignments?: GoalAssignment[];
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

export const useGoals = (targetId?: string) => {
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

      // Fetch goals with assignments
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
          )
        `)
        .order('created_at', { ascending: false });

      if (targetId) {
        query = query.eq('target_id', targetId);
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

  const createGoal = async (goalData: Partial<Goal>): Promise<Goal | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          title: goalData.title!,
          description: goalData.description,
          category: goalData.category!,
          target_date: goalData.target_date,
          status: goalData.status || 'active',
          progress_percentage: goalData.progress_percentage || 0,
          target_id: goalData.target_id,
          assigned_to: goalData.assigned_to
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Goal created successfully');
      await fetchGoals();
      return data;
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error('Failed to create goal');
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Goal updated');
      await fetchGoals();
      return true;
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.error('Failed to update goal');
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
  }, [targetId]);

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