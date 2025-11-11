import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BNIContactMetrics {
  contactId: string;
  relationshipStrength: number; // 0-100
  giversGainScore: number; // ratio of given to received
  referralsGiven: number;
  referralsReceived: number;
  businessGenerated: number;
  businessReceived: number;
  lastOneToOneMeeting?: Date;
  daysSinceLastContact: number;
  totalMeetings: number;
  gainsCompleted: boolean;
  idealReferral?: string;
  howToHelp?: string;
  followUpActions: Array<{ action: string; priority: 'high' | 'medium' | 'low' }>;
}

export const useBNIContactMetrics = (contactId: string) => {
  const [metrics, setMetrics] = useState<BNIContactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) {
      setLoading(false);
      return;
    }

    fetchMetrics();
  }, [contactId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Get referrals given to this contact
      const { data: referralsGiven } = await supabase
        .from('referrals_given')
        .select('estimated_value, closed_value, status')
        .eq('referred_to_contact_id', contactId);

      // Get referrals received from this contact
      const { data: referralsReceived } = await supabase
        .from('referrals_received')
        .select('estimated_value, closed_value, status')
        .eq('from_contact_id', contactId);

      // Get opportunities (meetings) with this contact
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('type, date, created_at')
        .eq('contact_id', contactId)
        .order('date', { ascending: false });

      // Get GAINS meeting data
      const { data: gainsMeeting } = await supabase
        .from('gains_meetings')
        .select('*')
        .eq('contact_id', contactId)
        .eq('completed', true)
        .order('meeting_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get contact details for last interaction
      const { data: contact } = await supabase
        .from('contacts')
        .select('last_contact')
        .eq('id', contactId)
        .single();

      // Calculate metrics
      const refGivenCount = referralsGiven?.length || 0;
      const refReceivedCount = referralsReceived?.length || 0;
      
      const businessGenerated = referralsGiven?.reduce((sum, ref) => 
        sum + (ref.status === 'completed' ? (ref.closed_value || 0) : 0), 0) || 0;
      
      const businessReceived = referralsReceived?.reduce((sum, ref) => 
        sum + (ref.status === 'completed' ? (ref.closed_value || 0) : 0), 0) || 0;

      // Calculate Giver's Gain Score (give more than receive is good)
      const giversGainScore = refReceivedCount === 0 
        ? (refGivenCount > 0 ? 100 : 0)
        : Math.min(100, (refGivenCount / refReceivedCount) * 100);

      // Find last meeting (1-2-1 or regular meeting)
      const meetings = opportunities?.filter(o => o.type === 'meeting') || [];
      const lastOneToOneMeeting = meetings[0]?.date 
        ? new Date(meetings[0].date) 
        : undefined;

      // Days since last contact
      const lastContactDate = contact?.last_contact 
        ? new Date(contact.last_contact)
        : new Date(opportunities?.[0]?.created_at || Date.now());
      const daysSinceLastContact = Math.floor(
        (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate relationship strength (0-100)
      // Based on: meetings frequency, referrals exchanged, business value, recency
      let relationshipStrength = 0;
      relationshipStrength += Math.min(30, meetings.length * 5); // Up to 30 points for meetings
      relationshipStrength += Math.min(25, refGivenCount * 5); // Up to 25 points for referrals given
      relationshipStrength += Math.min(25, refReceivedCount * 5); // Up to 25 points for referrals received
      relationshipStrength += Math.min(10, businessGenerated / 1000); // Up to 10 points for business value
      relationshipStrength += Math.max(0, 10 - daysSinceLastContact / 3); // Up to 10 points for recency

      // Generate follow-up actions
      const followUpActions: Array<{ action: string; priority: 'high' | 'medium' | 'low' }> = [];
      
      if (daysSinceLastContact > 30) {
        followUpActions.push({ action: 'Schedule catch-up meeting', priority: 'high' });
      }
      
      if (!gainsMeeting) {
        followUpActions.push({ action: 'Conduct GAINS meeting', priority: 'high' });
      }
      
      if (meetings.length === 0) {
        followUpActions.push({ action: 'Schedule first meeting', priority: 'high' });
      } else if (lastOneToOneMeeting && daysSinceLastContact > 90) {
        followUpActions.push({ action: 'Schedule meeting (overdue)', priority: 'medium' });
      }
      
      if (gainsMeeting?.ideal_referral && refGivenCount === 0) {
        followUpActions.push({ action: 'Find referral opportunity', priority: 'medium' });
      }

      if (refReceivedCount > refGivenCount + 2) {
        followUpActions.push({ action: 'Give referral to balance relationship', priority: 'low' });
      }

      setMetrics({
        contactId,
        relationshipStrength: Math.round(relationshipStrength),
        giversGainScore: Math.round(giversGainScore),
        referralsGiven: refGivenCount,
        referralsReceived: refReceivedCount,
        businessGenerated,
        businessReceived,
        lastOneToOneMeeting,
        daysSinceLastContact,
        totalMeetings: opportunities?.length || 0,
        gainsCompleted: !!gainsMeeting,
        idealReferral: gainsMeeting?.ideal_referral,
        howToHelp: gainsMeeting?.how_to_help,
        followUpActions: followUpActions.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
      });
    } catch (error) {
      console.error('Error fetching BNI contact metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refresh: fetchMetrics };
};
