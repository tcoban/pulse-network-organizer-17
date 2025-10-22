import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useM365Sync = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  const syncContacts = async () => {
    if (!user) {
      toast.error('You must be logged in to sync contacts');
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-outlook-contacts');

      if (error) throw error;

      if (data.mock) {
        toast.success(`[MOCK MODE] Synced ${data.synced} contacts from Outlook`, {
          description: 'This is test data. See PRODUCTION_CHECKLIST.md for real integration.',
        });
      } else {
        toast.success(`Synced ${data.synced} contacts from Outlook`);
      }

      return data;
    } catch (error: any) {
      console.error('Error syncing contacts:', error);
      toast.error('Failed to sync contacts', {
        description: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncCalendar = async () => {
    if (!user) {
      toast.error('You must be logged in to sync calendar');
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-calendar-events');

      if (error) throw error;

      if (data.mock) {
        toast.success(`[MOCK MODE] Synced ${data.synced} calendar events`, {
          description: 'This is test data. See PRODUCTION_CHECKLIST.md for real integration.',
        });
      } else {
        toast.success(`Synced ${data.synced} calendar events`);
      }

      return data;
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync calendar', {
        description: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const syncEmails = async () => {
    if (!user) {
      toast.error('You must be logged in to sync emails');
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-email-interactions');

      if (error) throw error;

      if (data.mock) {
        toast.success(`[MOCK MODE] Synced ${data.synced} email interactions`, {
          description: 'This is test data. See PRODUCTION_CHECKLIST.md for real integration.',
        });
      } else {
        toast.success(`Synced ${data.synced} email interactions`);
      }

      return data;
    } catch (error: any) {
      console.error('Error syncing emails:', error);
      toast.error('Failed to sync email interactions', {
        description: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    syncContacts,
    syncCalendar,
    syncEmails,
  };
};
