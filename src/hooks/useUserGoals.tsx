import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  progress_percentage: number;
  status: string;
  linked_opportunity_id?: string;
  created_at: string;
  updated_at: string;
}

export const useUserGoals = () => {
  const [goals, setGoals] = useState<UserGoal[]>([]);
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

      const { data, error: fetchError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching user goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Partial<UserGoal>): Promise<UserGoal | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('user_goals')
        .insert([{
          user_id: user.id,
          title: goalData.title!,
          description: goalData.description,
          category: goalData.category!,
          target_date: goalData.target_date,
          status: goalData.status || 'active',
          progress_percentage: goalData.progress_percentage || 0
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

  const updateGoal = async (id: string, updates: Partial<UserGoal>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('user_goals')
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
        .from('user_goals')
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

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal
  };
};
