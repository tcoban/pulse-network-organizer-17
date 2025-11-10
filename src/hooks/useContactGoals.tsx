import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContactGoal {
  id: string;
  contact_id: string;
  goal_id: string;
  relevance_note?: string;
  linked_by?: string;
  linked_at: string;
  goal?: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
}

export const useContactGoals = (contactId?: string) => {
  const [contactGoals, setContactGoals] = useState<ContactGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContactGoals = async () => {
    if (!contactId) {
      setContactGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_goals')
        .select(`
          *,
          goal:goals(id, title, category, status)
        `)
        .eq('contact_id', contactId);

      if (error) throw error;
      setContactGoals(data || []);
    } catch (error) {
      console.error('Error fetching contact goals:', error);
      toast.error('Failed to load contact goals');
    } finally {
      setLoading(false);
    }
  };

  const linkGoal = async (goalId: string, relevanceNote?: string) => {
    if (!contactId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('contact_goals')
        .insert({
          contact_id: contactId,
          goal_id: goalId,
          relevance_note: relevanceNote,
          linked_by: user?.id
        });

      if (error) throw error;
      
      toast.success('Contact linked to goal successfully');
      await fetchContactGoals();
      return true;
    } catch (error: any) {
      console.error('Error linking goal:', error);
      if (error.code === '23505') {
        toast.error('This contact is already linked to this goal');
      } else {
        toast.error('Failed to link goal');
      }
      return false;
    }
  };

  const unlinkGoal = async (contactGoalId: string) => {
    try {
      const { error } = await supabase
        .from('contact_goals')
        .delete()
        .eq('id', contactGoalId);

      if (error) throw error;
      
      toast.success('Goal unlinked successfully');
      await fetchContactGoals();
      return true;
    } catch (error) {
      console.error('Error unlinking goal:', error);
      toast.error('Failed to unlink goal');
      return false;
    }
  };

  const updateRelevanceNote = async (contactGoalId: string, relevanceNote: string) => {
    try {
      const { error } = await supabase
        .from('contact_goals')
        .update({ relevance_note: relevanceNote })
        .eq('id', contactGoalId);

      if (error) throw error;
      
      toast.success('Relevance note updated');
      await fetchContactGoals();
      return true;
    } catch (error) {
      console.error('Error updating relevance note:', error);
      toast.error('Failed to update note');
      return false;
    }
  };

  useEffect(() => {
    fetchContactGoals();
  }, [contactId]);

  return {
    contactGoals,
    loading,
    linkGoal,
    unlinkGoal,
    updateRelevanceNote,
    fetchContactGoals
  };
};
