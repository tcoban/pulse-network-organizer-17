import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGhostMode } from '@/hooks/useGhostMode';

export interface DecayingContact {
  contactId: string;
  contactName: string;
  lastInteractionDate: string | null;
  daysSinceLastInteraction: number;
  decayRate: number;
  currentStrength: number;
  originalStrength: number;
  decayLevel: 'critical' | 'warning' | 'normal';
  estimatedDaysToZero: number;
}

const DECAY_THRESHOLDS = {
  CRITICAL: 90, // 3 months
  WARNING: 60,  // 2 months
  NORMAL: 30,   // 1 month
};

const DECAY_RATES = {
  CRITICAL: 2.0, // Lose 2 points per day
  WARNING: 1.0,  // Lose 1 point per day
  NORMAL: 0.5,   // Lose 0.5 points per day
};

export const useRelationshipDecay = () => {
  const { getActiveUserId } = useGhostMode();
  const [decayingContacts, setDecayingContacts] = useState<DecayingContact[]>([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecayingContacts();
  }, [getActiveUserId()]);

  const calculateDecay = (
    daysSinceInteraction: number,
    originalStrength: number
  ): { decayRate: number; currentStrength: number; decayLevel: 'critical' | 'warning' | 'normal' } => {
    let decayRate = 0;
    let decayLevel: 'critical' | 'warning' | 'normal' = 'normal';

    if (daysSinceInteraction >= DECAY_THRESHOLDS.CRITICAL) {
      decayRate = DECAY_RATES.CRITICAL;
      decayLevel = 'critical';
    } else if (daysSinceInteraction >= DECAY_THRESHOLDS.WARNING) {
      decayRate = DECAY_RATES.WARNING;
      decayLevel = 'warning';
    } else if (daysSinceInteraction >= DECAY_THRESHOLDS.NORMAL) {
      decayRate = DECAY_RATES.NORMAL;
      decayLevel = 'normal';
    }

    const totalDecay = decayRate * (daysSinceInteraction - (decayLevel === 'critical' ? DECAY_THRESHOLDS.CRITICAL : decayLevel === 'warning' ? DECAY_THRESHOLDS.WARNING : DECAY_THRESHOLDS.NORMAL));
    const currentStrength = Math.max(0, originalStrength - totalDecay);

    return { decayRate, currentStrength, decayLevel };
  };

  const loadDecayingContacts = async () => {
    setLoading(true);
    const userId = getActiveUserId();
    if (!userId) return;

    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('created_by', userId);

      if (!contacts) return;

      const decayData: DecayingContact[] = [];

      for (const contact of contacts) {
        const { data: lastInteraction } = await supabase
          .from('interactions')
          .select('date')
          .eq('contact_id', contact.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: networkValue } = await supabase
          .from('contact_network_value')
          .select('relationship_strength, last_interaction_date')
          .eq('contact_id', contact.id)
          .maybeSingle();

        const lastDate = lastInteraction?.date || networkValue?.last_interaction_date;
        const daysSince = lastDate
          ? Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        if (daysSince >= DECAY_THRESHOLDS.NORMAL) {
          const originalStrength = networkValue?.relationship_strength || 50;
          const { decayRate, currentStrength, decayLevel } = calculateDecay(daysSince, originalStrength);
          const estimatedDaysToZero = currentStrength > 0 ? Math.ceil(currentStrength / decayRate) : 0;

          decayData.push({
            contactId: contact.id,
            contactName: contact.name,
            lastInteractionDate: lastDate,
            daysSinceLastInteraction: daysSince,
            decayRate,
            currentStrength,
            originalStrength,
            decayLevel,
            estimatedDaysToZero,
          });
        }
      }

      const sorted = decayData.sort((a, b) => {
        const levelPriority = { critical: 3, warning: 2, normal: 1 };
        if (levelPriority[a.decayLevel] !== levelPriority[b.decayLevel]) {
          return levelPriority[b.decayLevel] - levelPriority[a.decayLevel];
        }
        return b.daysSinceLastInteraction - a.daysSinceLastInteraction;
      });

      setDecayingContacts(sorted);
      setCriticalCount(sorted.filter(c => c.decayLevel === 'critical').length);
      setWarningCount(sorted.filter(c => c.decayLevel === 'warning').length);
    } catch (error) {
      console.error('Error loading decaying contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    decayingContacts,
    criticalCount,
    warningCount,
    loading,
    refresh: loadDecayingContacts,
  };
};
