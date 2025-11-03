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

      const { data, error } = await supabase
        .from('weekly_commitments')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCurrentWeek({
          id: data.id,
          userId: data.user_id,
          weekStartDate: new Date(data.week_start_date),
          targetOneToOnes: data.target_one_to_ones,
          completedOneToOnes: data.completed_one_to_ones,
          targetReferralsGiven: data.target_referrals_given,
          completedReferralsGiven: data.completed_referrals_given,
          targetVisibilityDays: data.target_visibility_days,
          completedVisibilityDays: data.completed_visibility_days,
          targetFollowUps: data.target_follow_ups,
          completedFollowUps: data.completed_follow_ups,
          streakWeeks: data.streak_weeks,
          notes: data.notes,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        });
      } else {
        // Create new week commitment
        const { data: newData, error: insertError } = await supabase
          .from('weekly_commitments')
          .insert({
            user_id: user.id,
            week_start_date: weekStart
          })
          .select()
          .single();

        if (insertError) throw insertError;

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