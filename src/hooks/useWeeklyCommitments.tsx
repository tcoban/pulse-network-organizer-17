import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, format } from 'date-fns';

export interface WeeklyCommitment {
  id: string;
  userId: string;
  weekStartDate: Date;
  targetOneToOnes: number;
  completedOneToOnes: number;
  targetReferralsGiven: number;
  completedReferralsGiven: number;
  targetVisibilityDays: number;
  completedVisibilityDays: number;
  targetFollowUps: number;
  completedFollowUps: number;
  streakWeeks: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useWeeklyCommitments = () => {
  const [currentWeek, setCurrentWeek] = useState<WeeklyCommitment | null>(null);
  const [history, setHistory] = useState<WeeklyCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentWeek = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // First try to fetch existing record
      const { data: existing, error: fetchError } = await supabase
        .from('weekly_commitments')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        setCurrentWeek({
          id: existing.id,
          userId: existing.user_id,
          weekStartDate: new Date(existing.week_start_date),
          targetOneToOnes: existing.target_one_to_ones,
          completedOneToOnes: existing.completed_one_to_ones,
          targetReferralsGiven: existing.target_referrals_given,
          completedReferralsGiven: existing.completed_referrals_given,
          targetVisibilityDays: existing.target_visibility_days,
          completedVisibilityDays: existing.completed_visibility_days,
          targetFollowUps: existing.target_follow_ups,
          completedFollowUps: existing.completed_follow_ups,
          streakWeeks: existing.streak_weeks,
          notes: existing.notes,
          createdAt: new Date(existing.created_at),
          updatedAt: new Date(existing.updated_at)
        });
      } else {
        // Create new week commitment - use upsert to handle race conditions
        const { data: newData, error: insertError } = await supabase
          .from('weekly_commitments')
          .upsert({
            user_id: user.id,
            week_start_date: weekStart
          }, {
            onConflict: 'user_id,week_start_date',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (insertError) {
          // If still duplicate, fetch the existing one
          if (insertError.code === '23505') {
            const { data: duplicate } = await supabase
              .from('weekly_commitments')
              .select('*')
              .eq('user_id', user.id)
              .eq('week_start_date', weekStart)
              .single();
            
            if (duplicate) {
              setCurrentWeek({
                id: duplicate.id,
                userId: duplicate.user_id,
                weekStartDate: new Date(duplicate.week_start_date),
                targetOneToOnes: duplicate.target_one_to_ones,
                completedOneToOnes: duplicate.completed_one_to_ones,
                targetReferralsGiven: duplicate.target_referrals_given,
                completedReferralsGiven: duplicate.completed_referrals_given,
                targetVisibilityDays: duplicate.target_visibility_days,
                completedVisibilityDays: duplicate.completed_visibility_days,
                targetFollowUps: duplicate.target_follow_ups,
                completedFollowUps: duplicate.completed_follow_ups,
                streakWeeks: duplicate.streak_weeks,
                notes: duplicate.notes,
                createdAt: new Date(duplicate.created_at),
                updatedAt: new Date(duplicate.updated_at)
              });
            }
          } else {
            throw insertError;
          }
        } else if (newData) {
          setCurrentWeek({
            id: newData.id,
            userId: newData.user_id,
            weekStartDate: new Date(newData.week_start_date),
            targetOneToOnes: newData.target_one_to_ones,
            completedOneToOnes: newData.completed_one_to_ones,
            targetReferralsGiven: newData.target_referrals_given,
            completedReferralsGiven: newData.completed_referrals_given,
            targetVisibilityDays: newData.target_visibility_days,
            completedVisibilityDays: newData.completed_visibility_days,
            targetFollowUps: newData.target_follow_ups,
            completedFollowUps: newData.completed_follow_ups,
            streakWeeks: newData.streak_weeks,
            notes: newData.notes,
            createdAt: new Date(newData.created_at),
            updatedAt: new Date(newData.updated_at)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching current week commitment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load weekly commitment',
        variant: 'destructive'
      });
    }
  };

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_commitments')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false })
        .limit(12);

      if (error) throw error;

      const transformed = data?.map(d => ({
        id: d.id,
        userId: d.user_id,
        weekStartDate: new Date(d.week_start_date),
        targetOneToOnes: d.target_one_to_ones,
        completedOneToOnes: d.completed_one_to_ones,
        targetReferralsGiven: d.target_referrals_given,
        completedReferralsGiven: d.completed_referrals_given,
        targetVisibilityDays: d.target_visibility_days,
        completedVisibilityDays: d.completed_visibility_days,
        targetFollowUps: d.target_follow_ups,
        completedFollowUps: d.completed_follow_ups,
        streakWeeks: d.streak_weeks,
        notes: d.notes,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at)
      })) || [];

      setHistory(transformed);
    } catch (error) {
      console.error('Error fetching commitment history:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCurrentWeek(), fetchHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateProgress = async (field: string, value: number): Promise<boolean> => {
    if (!currentWeek) return false;

    try {
      const { error } = await supabase
        .from('weekly_commitments')
        .update({ [field]: value })
        .eq('id', currentWeek.id);

      if (error) throw error;

      await fetchCurrentWeek();
      return true;
    } catch (error) {
      console.error('Error updating commitment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update commitment',
        variant: 'destructive'
      });
      return false;
    }
  };

  const incrementProgress = async (type: 'oneToOnes' | 'referrals' | 'visibility' | 'followUps'): Promise<boolean> => {
    if (!currentWeek) return false;

    const fieldMap = {
      oneToOnes: 'completed_one_to_ones',
      referrals: 'completed_referrals_given',
      visibility: 'completed_visibility_days',
      followUps: 'completed_follow_ups'
    };

    const currentValueMap = {
      oneToOnes: currentWeek.completedOneToOnes,
      referrals: currentWeek.completedReferralsGiven,
      visibility: currentWeek.completedVisibilityDays,
      followUps: currentWeek.completedFollowUps
    };

    return updateProgress(fieldMap[type], currentValueMap[type] + 1);
  };

  const getCompletionPercentage = () => {
    if (!currentWeek) return 0;

    const totalTargets = 
      currentWeek.targetOneToOnes +
      currentWeek.targetReferralsGiven +
      currentWeek.targetVisibilityDays +
      currentWeek.targetFollowUps;

    const totalCompleted =
      currentWeek.completedOneToOnes +
      currentWeek.completedReferralsGiven +
      currentWeek.completedVisibilityDays +
      currentWeek.completedFollowUps;

    if (totalTargets === 0) return 0;
    return Math.round((totalCompleted / totalTargets) * 100);
  };

  return {
    currentWeek,
    history,
    loading,
    updateProgress,
    incrementProgress,
    getCompletionPercentage,
    fetchAll
  };
};