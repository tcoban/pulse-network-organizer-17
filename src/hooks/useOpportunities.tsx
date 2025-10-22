import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Opportunity {
  id: string;
  contact_id: string;
  title: string;
  type: 'event' | 'meeting' | 'appointment' | 'conference' | 'other';
  date: string;
  location?: string;
  description?: string;
  registration_status?: 'considering' | 'registered' | 'confirmed';
  created_at: string;
  updated_at: string;
  created_by?: string;
  calendar_event_id?: string;
  synced_to_calendar: boolean;
  source: string;
  meeting_goals?: MeetingGoal[];
}

export interface MeetingGoal {
  id: string;
  opportunity_id: string;
  description: string;
  achieved: boolean;
  related_project?: string;
  created_at: string;
  updated_at: string;
}

export const useOpportunities = (contactId?: string) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('opportunities')
        .select(`
          *,
          meeting_goals (*)
        `)
        .order('date', { ascending: true });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setOpportunities(data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (
    opportunityData: Partial<Opportunity>,
    addToCalendar: boolean = false
  ): Promise<Opportunity | null> => {
    try {
      // Check for duplicates first
      if (opportunityData.title && opportunityData.date && opportunityData.contact_id) {
        const { data: duplicates } = await supabase.functions.invoke('detect-duplicate-opportunities', {
          body: {
            title: opportunityData.title,
            date: opportunityData.date,
            contactId: opportunityData.contact_id
          }
        });

        if (duplicates?.duplicates?.length > 0) {
          toast.warning('Potential duplicate detected', {
            description: `Similar opportunity exists: "${duplicates.duplicates[0].title}"`
          });
        }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data: newOpp, error: insertError } = await supabase
        .from('opportunities')
        .insert([{
          contact_id: opportunityData.contact_id,
          title: opportunityData.title!,
          type: opportunityData.type!,
          date: opportunityData.date!,
          location: opportunityData.location,
          description: opportunityData.description,
          registration_status: opportunityData.registration_status,
          created_by: user?.id,
          source: 'manual',
          synced_to_calendar: false
        }])
        .select(`
          *,
          meeting_goals (*)
        `)
        .single();

      if (insertError) throw insertError;

      // Sync to calendar if requested
      if (addToCalendar && newOpp) {
        try {
          await supabase.functions.invoke('sync-opportunity-to-calendar', {
            body: {
              opportunityId: newOpp.id,
              contactId: opportunityData.contact_id
            }
          });
          toast.success('Opportunity created and added to calendar');
        } catch (syncError) {
          console.error('Calendar sync failed:', syncError);
          toast.warning('Opportunity created but calendar sync failed');
        }
      } else {
        toast.success('Opportunity created successfully');
      }

      await fetchOpportunities();
      return newOpp;
    } catch (err) {
      console.error('Error creating opportunity:', err);
      toast.error('Failed to create opportunity');
      return null;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Opportunity updated');
      await fetchOpportunities();
      return true;
    } catch (err) {
      console.error('Error updating opportunity:', err);
      toast.error('Failed to update opportunity');
      return false;
    }
  };

  const deleteOpportunity = async (id: string, deleteFromCalendar: boolean = false): Promise<boolean> => {
    try {
      if (deleteFromCalendar) {
        await supabase.functions.invoke('delete-opportunity-from-calendar', {
          body: { opportunityId: id }
        });
      }

      const { error: deleteError } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Opportunity deleted');
      await fetchOpportunities();
      return true;
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      toast.error('Failed to delete opportunity');
      return false;
    }
  };

  const syncOpportunityToCalendar = async (opportunityId: string): Promise<boolean> => {
    try {
      const { error: syncError } = await supabase.functions.invoke('sync-opportunity-to-calendar', {
        body: { opportunityId }
      });

      if (syncError) throw syncError;

      toast.success('Synced to calendar');
      await fetchOpportunities();
      return true;
    } catch (err) {
      console.error('Error syncing to calendar:', err);
      toast.error('Failed to sync to calendar');
      return false;
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [contactId]);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    syncOpportunityToCalendar
  };
};
