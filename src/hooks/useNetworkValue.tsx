import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContactNetworkValue {
  id: string;
  contactId: string;
  totalReferralsGiven: number;
  totalReferralsReceived: number;
  totalBusinessGenerated: number;
  totalBusinessReceived: number;
  reciprocityScore: number;
  relationshipStrength: number;
  lifetimeValue: number;
  lastInteractionDate?: Date;
  calculatedAt: Date;
}

export const useNetworkValue = (contactId?: string) => {
  const [networkValue, setNetworkValue] = useState<ContactNetworkValue | null>(null);
  const [allValues, setAllValues] = useState<ContactNetworkValue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNetworkValue = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_network_value')
        .select('*')
        .eq('contact_id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setNetworkValue({
          id: data.id,
          contactId: data.contact_id,
          totalReferralsGiven: data.total_referrals_given,
          totalReferralsReceived: data.total_referrals_received,
          totalBusinessGenerated: data.total_business_generated,
          totalBusinessReceived: data.total_business_received,
          reciprocityScore: data.reciprocity_score,
          relationshipStrength: data.relationship_strength,
          lifetimeValue: data.lifetime_value,
          lastInteractionDate: data.last_interaction_date ? new Date(data.last_interaction_date) : undefined,
          calculatedAt: new Date(data.calculated_at)
        });
      } else {
        // Create initial network value record
        await calculateNetworkValue(id);
      }
    } catch (error) {
      console.error('Error fetching network value:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch network value',
        variant: 'destructive'
      });
    }
  };

  const fetchAllNetworkValues = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_network_value')
        .select('*')
        .order('lifetime_value', { ascending: false });

      if (error) throw error;

      const transformed = data?.map(d => ({
        id: d.id,
        contactId: d.contact_id,
        totalReferralsGiven: d.total_referrals_given,
        totalReferralsReceived: d.total_referrals_received,
        totalBusinessGenerated: d.total_business_generated,
        totalBusinessReceived: d.total_business_received,
        reciprocityScore: d.reciprocity_score,
        relationshipStrength: d.relationship_strength,
        lifetimeValue: d.lifetime_value,
        lastInteractionDate: d.last_interaction_date ? new Date(d.last_interaction_date) : undefined,
        calculatedAt: new Date(d.calculated_at)
      })) || [];

      setAllValues(transformed);
    } catch (error) {
      console.error('Error fetching all network values:', error);
    }
  };

  const calculateNetworkValue = async (id: string): Promise<boolean> => {
    try {
      // Fetch referrals given to this contact
      const { data: refGiven } = await supabase
        .from('referrals_given')
        .select('closed_value, status')
        .eq('contact_id', id);

      // Fetch referrals received from this contact
      const { data: refReceived } = await supabase
        .from('referrals_received')
        .select('closed_value, status')
        .eq('from_contact_id', id);

      // Fetch interactions
      const { data: interactions } = await supabase
        .from('interactions')
        .select('date')
        .eq('contact_id', id)
        .order('date', { ascending: false })
        .limit(1);

      const totalBusinessGenerated = refGiven?.reduce((sum, r) => 
        r.status === 'completed' ? sum + Number(r.closed_value) : sum, 0) || 0;

      const totalBusinessReceived = refReceived?.reduce((sum, r) => 
        r.status === 'completed' ? sum + Number(r.closed_value) : sum, 0) || 0;

      const totalReferralsGiven = refGiven?.length || 0;
      const totalReferralsReceived = refReceived?.length || 0;

      // Calculate reciprocity score (0-100)
      let reciprocityScore = 50; // neutral
      if (totalReferralsReceived > 0) {
        reciprocityScore = Math.min(100, (totalReferralsGiven / totalReferralsReceived) * 50);
      }

      // Calculate relationship strength based on interactions and business
      const interactionRecency = interactions?.[0] ? 
        Math.max(0, 100 - Math.floor((Date.now() - new Date(interactions[0].date).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;
      
      const businessFactor = Math.min(50, (totalBusinessGenerated + totalBusinessReceived) / 1000);
      const relationshipStrength = Math.min(100, Math.round((interactionRecency * 0.5) + businessFactor));

      const lifetimeValue = totalBusinessGenerated + totalBusinessReceived;

      const { error } = await supabase
        .from('contact_network_value')
        .upsert({
          contact_id: id,
          total_referrals_given: totalReferralsGiven,
          total_referrals_received: totalReferralsReceived,
          total_business_generated: totalBusinessGenerated,
          total_business_received: totalBusinessReceived,
          reciprocity_score: reciprocityScore,
          relationship_strength: relationshipStrength,
          lifetime_value: lifetimeValue,
          last_interaction_date: interactions?.[0]?.date,
          calculated_at: new Date().toISOString()
        });

      if (error) throw error;

      if (contactId === id) {
        await fetchNetworkValue(id);
      }

      return true;
    } catch (error) {
      console.error('Error calculating network value:', error);
      return false;
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    if (contactId) {
      await fetchNetworkValue(contactId);
    }
    await fetchAllNetworkValues();
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [contactId]);

  return {
    networkValue,
    allValues,
    loading,
    calculateNetworkValue,
    fetchAll
  };
};