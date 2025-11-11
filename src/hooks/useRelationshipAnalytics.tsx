import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGhostMode } from '@/hooks/useGhostMode';

export interface RelationshipTrajectory {
  contactId: string;
  contactName: string;
  dataPoints: {
    date: string;
    strength: number;
    businessValue: number;
    interactions: number;
  }[];
  trend: 'improving' | 'declining' | 'stable';
  currentStrength: number;
}

export interface NetworkHealth {
  overallScore: number;
  engagementMomentum: number;
  reciprocityBalance: number;
  interactionQuality: number;
  activeContacts: number;
  atRiskContacts: number;
  growingRelationships: number;
}

export interface ReciprocityInsight {
  contactId: string;
  contactName: string;
  given: number;
  received: number;
  balance: 'giver' | 'taker' | 'balanced';
  ratio: number;
}

export interface PredictiveRecommendation {
  type: 'contact' | 'referral' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  contactId: string;
  contactName: string;
  reason: string;
  potentialValue: number;
  confidence: number;
}

export const useRelationshipAnalytics = () => {
  const { getActiveUserId } = useGhostMode();
  const [trajectories, setTrajectories] = useState<RelationshipTrajectory[]>([]);
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth | null>(null);
  const [reciprocityInsights, setReciprocityInsights] = useState<ReciprocityInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PredictiveRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [getActiveUserId()]);

  const loadAnalytics = async () => {
    setLoading(true);
    const userId = getActiveUserId();
    if (!userId) return;

    await Promise.all([
      loadTrajectories(userId),
      loadNetworkHealth(userId),
      loadReciprocityInsights(userId),
      loadRecommendations(userId),
    ]);

    setLoading(false);
  };

  const loadTrajectories = async (userId: string) => {
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('created_by', userId);

      if (!contacts) return;

      const trajectoryData: RelationshipTrajectory[] = [];

      for (const contact of contacts.slice(0, 20)) {
        const { data: interactions } = await supabase
          .from('interactions')
          .select('date, description')
          .eq('contact_id', contact.id)
          .order('date', { ascending: true });

        const { data: referrals } = await supabase
          .from('referrals_given')
          .select('created_at, closed_value, status')
          .eq('contact_id', contact.id);

        const { data: networkValue } = await supabase
          .from('contact_network_value')
          .select('*')
          .eq('contact_id', contact.id)
          .maybeSingle();

        const dataPoints = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = monthDate.toISOString();
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString();

          const monthInteractions = interactions?.filter(
            int => int.date >= monthStart && int.date <= monthEnd
          ).length || 0;

          const monthBusiness = referrals?.filter(
            ref => ref.created_at >= monthStart && ref.created_at <= monthEnd && ref.status === 'completed'
          ).reduce((sum, ref) => sum + Number(ref.closed_value || 0), 0) || 0;

          const strength = Math.min(100, (monthInteractions * 20) + Math.min(50, monthBusiness / 1000));

          dataPoints.push({
            date: monthDate.toISOString().slice(0, 7),
            strength,
            businessValue: monthBusiness,
            interactions: monthInteractions,
          });
        }

        const recentStrength = dataPoints.slice(-2).map(d => d.strength);
        const trend = recentStrength[1] > recentStrength[0] + 10 ? 'improving' :
                     recentStrength[1] < recentStrength[0] - 10 ? 'declining' : 'stable';

        trajectoryData.push({
          contactId: contact.id,
          contactName: contact.name,
          dataPoints,
          trend,
          currentStrength: networkValue?.relationship_strength || recentStrength[1] || 0,
        });
      }

      setTrajectories(trajectoryData.sort((a, b) => b.currentStrength - a.currentStrength));
    } catch (error) {
      console.error('Error loading trajectories:', error);
    }
  };

  const loadNetworkHealth = async (userId: string) => {
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('created_by', userId);

      const { data: recentInteractions } = await supabase
        .from('interactions')
        .select('contact_id, date')
        .in('contact_id', contacts?.map(c => c.id) || [])
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const { data: networkValues } = await supabase
        .from('contact_network_value')
        .select('*')
        .in('contact_id', contacts?.map(c => c.id) || []);

      const activeContacts = new Set(recentInteractions?.map(i => i.contact_id) || []).size;
      const atRiskContacts = (contacts?.length || 0) - activeContacts;

      const avgReciprocity = networkValues?.reduce((sum, nv) => sum + nv.reciprocity_score, 0) / 
                            (networkValues?.length || 1) || 50;

      const avgStrength = networkValues?.reduce((sum, nv) => sum + nv.relationship_strength, 0) / 
                         (networkValues?.length || 1) || 0;

      const growingRelationships = networkValues?.filter(nv => nv.relationship_strength > 70).length || 0;

      const engagementMomentum = Math.min(100, (recentInteractions?.length || 0) * 2);
      const reciprocityBalance = avgReciprocity;
      const interactionQuality = avgStrength;

      const overallScore = Math.round(
        (engagementMomentum * 0.3) + 
        (reciprocityBalance * 0.3) + 
        (interactionQuality * 0.4)
      );

      setNetworkHealth({
        overallScore,
        engagementMomentum,
        reciprocityBalance,
        interactionQuality,
        activeContacts,
        atRiskContacts,
        growingRelationships,
      });
    } catch (error) {
      console.error('Error loading network health:', error);
    }
  };

  const loadReciprocityInsights = async (userId: string) => {
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('created_by', userId);

      if (!contacts) return;

      const insights: ReciprocityInsight[] = [];

      for (const contact of contacts) {
        const { data: given } = await supabase
          .from('referrals_given')
          .select('id')
          .eq('contact_id', contact.id);

        const { data: received } = await supabase
          .from('referrals_received')
          .select('id')
          .eq('from_contact_id', contact.id);

        const givenCount = given?.length || 0;
        const receivedCount = received?.length || 0;
        const total = givenCount + receivedCount;

        if (total > 0) {
          const ratio = receivedCount > 0 ? givenCount / receivedCount : givenCount;
          const balance = ratio > 1.5 ? 'giver' : ratio < 0.67 ? 'taker' : 'balanced';

          insights.push({
            contactId: contact.id,
            contactName: contact.name,
            given: givenCount,
            received: receivedCount,
            balance,
            ratio,
          });
        }
      }

      setReciprocityInsights(insights.sort((a, b) => Math.abs(1 - b.ratio) - Math.abs(1 - a.ratio)));
    } catch (error) {
      console.error('Error loading reciprocity insights:', error);
    }
  };

  const loadRecommendations = async (userId: string) => {
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('created_by', userId);

      const { data: interactions } = await supabase
        .from('interactions')
        .select('contact_id, date')
        .in('contact_id', contacts?.map(c => c.id) || [])
        .order('date', { ascending: false });

      const { data: networkValues } = await supabase
        .from('contact_network_value')
        .select('*')
        .in('contact_id', contacts?.map(c => c.id) || []);

      const recs: PredictiveRecommendation[] = [];

      contacts?.forEach(contact => {
        const lastInteraction = interactions?.find(i => i.contact_id === contact.id);
        const daysSince = lastInteraction ? 
          Math.floor((Date.now() - new Date(lastInteraction.date).getTime()) / (1000 * 60 * 60 * 24)) : 999;

        const nv = networkValues?.find(v => v.contact_id === contact.id);
        const value = nv?.lifetime_value || 0;

        if (daysSince > 60 && value > 5000) {
          recs.push({
            type: 'contact',
            priority: 'high',
            contactId: contact.id,
            contactName: contact.name,
            reason: `High-value contact (${value.toLocaleString()} CHF) not contacted in ${daysSince} days`,
            potentialValue: value * 0.2,
            confidence: 0.85,
          });
        } else if (nv && nv.reciprocity_score < 40 && nv.total_referrals_received > 3) {
          recs.push({
            type: 'referral',
            priority: 'medium',
            contactId: contact.id,
            contactName: contact.name,
            reason: `Strong giver (${nv.total_referrals_received} referrals), consider reciprocating`,
            potentialValue: 0,
            confidence: 0.75,
          });
        }
      });

      setRecommendations(recs.sort((a, b) => {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      }).slice(0, 10));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  return {
    trajectories,
    networkHealth,
    reciprocityInsights,
    recommendations,
    loading,
    refresh: loadAnalytics,
  };
};
