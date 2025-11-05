import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReferralGiven {
  id: string;
  givenBy: string;
  contactId: string;
  referredToContactId?: string;
  referredToName?: string;
  referredToCompany?: string;
  serviceDescription: string;
  estimatedValue: number;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  outcomeNotes?: string;
  closedValue: number;
  closedAt?: Date;
  createdAt: Date;
  contact?: any;
}

export interface ReferralReceived {
  id: string;
  receivedBy: string;
  fromContactId: string;
  clientName: string;
  clientCompany?: string;
  serviceDescription: string;
  estimatedValue: number;
  status: 'pending' | 'in_progress' | 'completed' | 'lost';
  outcomeNotes?: string;
  closedValue: number;
  closedAt?: Date;
  createdAt: Date;
  fromContact?: any;
}

export const useReferrals = () => {
  const [referralsGiven, setReferralsGiven] = useState<ReferralGiven[]>([]);
  const [referralsReceived, setReferralsReceived] = useState<ReferralReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferralsGiven = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referrals_given')
        .select('*, contact:contacts(*)')
        .eq('given_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = data?.map(r => ({
        id: r.id,
        givenBy: r.given_by,
        contactId: r.contact_id,
        referredToContactId: r.referred_to_contact_id,
        referredToName: r.referred_to_name,
        referredToCompany: r.referred_to_company,
        serviceDescription: r.service_description,
        estimatedValue: r.estimated_value,
        status: r.status as 'pending' | 'accepted' | 'completed' | 'declined',
        outcomeNotes: r.outcome_notes,
        closedValue: r.closed_value,
        closedAt: r.closed_at ? new Date(r.closed_at) : undefined,
        createdAt: new Date(r.created_at),
        contact: r.contact
      })) || [];

      setReferralsGiven(transformed);
    } catch (error) {
      console.error('Error fetching referrals given:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch referrals given',
        variant: 'destructive'
      });
    }
  };

  const fetchReferralsReceived = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referrals_received')
        .select('*, fromContact:from_contact_id(*)') 
        .eq('received_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = data?.map(r => ({
        id: r.id,
        receivedBy: r.received_by,
        fromContactId: r.from_contact_id,
        clientName: r.client_name,
        clientCompany: r.client_company,
        serviceDescription: r.service_description,
        estimatedValue: r.estimated_value,
        status: r.status as 'pending' | 'in_progress' | 'completed' | 'lost',
        outcomeNotes: r.outcome_notes,
        closedValue: r.closed_value,
        closedAt: r.closed_at ? new Date(r.closed_at) : undefined,
        createdAt: new Date(r.created_at),
        fromContact: r.fromContact
      })) || [];

      setReferralsReceived(transformed);
    } catch (error) {
      console.error('Error fetching referrals received:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch referrals received',
        variant: 'destructive'
      });
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchReferralsGiven(), fetchReferralsReceived()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const giveReferral = async (data: Partial<ReferralGiven>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newReferral, error } = await supabase
        .from('referrals_given')
        .insert({
          given_by: user.id,
          contact_id: data.contactId,
          referred_to_contact_id: data.referredToContactId,
          referred_to_name: data.referredToName,
          referred_to_company: data.referredToCompany,
          service_description: data.serviceDescription,
          estimated_value: data.estimatedValue || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create a goal under "Connect People" project for this referral
      const { data: connectProject } = await supabase
        .from('projects')
        .select('id')
        .eq('type', 'networking')
        .eq('title', 'Connect People')
        .maybeSingle();

      if (connectProject && data.referredToName) {
        // Create goal linked to this referral
        await supabase.from('goals').insert({
          title: `Connect: ${data.referredToName}`,
          description: `Referral: ${data.serviceDescription}\nEstimated Value: $${data.estimatedValue || 0}`,
          category: 'referral',
          status: 'active',
          progress_percentage: 0,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      toast({
        title: 'Success',
        description: 'Referral given and goal created successfully'
      });

      await fetchReferralsGiven();
      return true;
    } catch (error) {
      console.error('Error giving referral:', error);
      toast({
        title: 'Error',
        description: 'Failed to give referral',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateReferralStatus = async (
    id: string,
    status: string,
    closedValue?: number,
    outcomeNotes?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = {
        status,
        outcome_notes: outcomeNotes
      };

      if (status === 'completed' && closedValue !== undefined) {
        updateData.closed_value = closedValue;
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('referrals_given')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Referral status updated'
      });

      await fetchReferralsGiven();
      return true;
    } catch (error) {
      console.error('Error updating referral:', error);
      toast({
        title: 'Error',
        description: 'Failed to update referral',
        variant: 'destructive'
      });
      return false;
    }
  };

  const calculateGiversGainRatio = () => {
    const given = referralsGiven.length;
    const received = referralsReceived.length;
    if (received === 0) return given > 0 ? Infinity : 0;
    return given / received;
  };

  const getTotalBusinessGenerated = () => {
    return referralsGiven
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.closedValue, 0);
  };

  const getTotalBusinessReceived = () => {
    return referralsReceived
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.closedValue, 0);
  };

  return {
    referralsGiven,
    referralsReceived,
    loading,
    giveReferral,
    updateReferralStatus,
    fetchAll,
    calculateGiversGainRatio,
    getTotalBusinessGenerated,
    getTotalBusinessReceived
  };
};