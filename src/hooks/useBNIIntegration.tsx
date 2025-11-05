import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

/**
 * BNI Integration Hook
 * 
 * Manages the integration between:
 * - BNI Referrals → Goals (under "Connect People" project)
 * - Contact Needs/Haves → Goal Suggestions
 * - Opportunities → Goals (meetings create goal opportunities)
 * - GAINS Framework → Contact data enrichment
 */
export const useBNIIntegration = () => {
  const { toast } = useToast();
  const { projects, createProject } = useProjects();
  const { createGoal } = useGoals();

  // Ensure "Connect People" default project exists
  useEffect(() => {
    ensureConnectPeopleProject();
  }, []);

  const ensureConnectPeopleProject = async () => {
    try {
      const { data: existingProject, error } = await supabase
        .from('projects')
        .select('*')
        .eq('type', 'networking')
        .eq('title', 'Connect People')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!existingProject) {
        // Create the default "Connect People" project
        await createProject({
          title: 'Connect People',
          description: 'BNI Givers Gain philosophy - connecting people and creating value through referrals and introductions',
          type: 'networking',
          status: 'active',
          priority: 'high'
        });

        console.log('Created default "Connect People" project');
      }
    } catch (error) {
      console.error('Error ensuring Connect People project:', error);
    }
  };

  /**
   * Create a goal when a referral is given
   * Links the referral to a goal under "Connect People" project
   */
  const createReferralGoal = async (referralData: {
    referredToName: string;
    contactName: string;
    serviceDescription: string;
    estimatedValue: number;
  }) => {
    try {
      // Get Connect People project
      const { data: connectProject } = await supabase
        .from('projects')
        .select('id')
        .eq('type', 'networking')
        .eq('title', 'Connect People')
        .single();

      if (!connectProject) {
        toast({
          title: 'Error',
          description: 'Connect People project not found',
          variant: 'destructive'
        });
        return null;
      }

      // Create a goal for this referral
      const goal = await createGoal({
        title: `Connect ${referralData.contactName} to ${referralData.referredToName}`,
        description: `Service: ${referralData.serviceDescription}\nEstimated Value: $${referralData.estimatedValue}`,
        category: 'referral',
        status: 'active',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress_percentage: 0
      });

      return goal;
    } catch (error) {
      console.error('Error creating referral goal:', error);
      return null;
    }
  };

  /**
   * Analyze contact's needs (looking_for) and haves (offering) to suggest goals
   */
  const suggestGoalsFromContact = async (contact: {
    id: string;
    name: string;
    lookingFor?: string;
    offering?: string;
  }) => {
    const suggestions: Array<{
      title: string;
      description: string;
      category: string;
    }> = [];

    if (contact.lookingFor) {
      suggestions.push({
        title: `Find ${contact.lookingFor} for ${contact.name}`,
        description: `${contact.name} is looking for: ${contact.lookingFor}. Identify potential matches in network.`,
        category: 'introduction'
      });
    }

    if (contact.offering) {
      suggestions.push({
        title: `Share ${contact.name}'s expertise`,
        description: `${contact.name} offers: ${contact.offering}. Find contacts who need this service.`,
        category: 'referral_opportunity'
      });
    }

    return suggestions;
  };

  /**
   * When a GAINS meeting is completed, create follow-up goals
   */
  const createGAINSFollowUpGoals = async (gainsData: {
    contactId: string;
    contactName: string;
    idealReferral?: string;
    howToHelp?: string;
  }) => {
    try {
      const goals: any[] = [];

      if (gainsData.idealReferral) {
        const goal = await createGoal({
          title: `Find ideal referral for ${gainsData.contactName}`,
          description: `Ideal referral: ${gainsData.idealReferral}`,
          category: 'referral',
          status: 'active',
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        if (goal) goals.push(goal);
      }

      if (gainsData.howToHelp) {
        const goal = await createGoal({
          title: `Help ${gainsData.contactName}`,
          description: gainsData.howToHelp,
          category: 'support',
          status: 'active',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        if (goal) goals.push(goal);
      }

      return goals;
    } catch (error) {
      console.error('Error creating GAINS follow-up goals:', error);
      return [];
    }
  };

  /**
   * Link an opportunity (meeting) to potential goals
   */
  const linkOpportunityToGoals = async (opportunityData: {
    id: string;
    contactId: string;
    type: string;
    title: string;
  }) => {
    try {
      // For 1-2-1 meetings, suggest creating connection goals
      if (opportunityData.type === 'one_to_one') {
        // This could trigger goal suggestions in the UI
        return {
          suggestGoalCreation: true,
          goalType: 'networking',
          message: 'Consider creating a goal to follow up on this 1-2-1 meeting'
        };
      }

      return null;
    } catch (error) {
      console.error('Error linking opportunity to goals:', error);
      return null;
    }
  };

  /**
   * Calculate "Connect People" project progress based on referrals
   */
  const updateConnectPeopleProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get Connect People project
      const { data: project } = await supabase
        .from('projects')
        .select('id, target_value')
        .eq('type', 'networking')
        .eq('title', 'Connect People')
        .single();

      if (!project) return;

      // Calculate total value from completed referrals
      const { data: referrals } = await supabase
        .from('referrals_given')
        .select('closed_value, status')
        .eq('given_by', user.id)
        .eq('status', 'completed');

      const totalValue = referrals?.reduce((sum, ref) => sum + (ref.closed_value || 0), 0) || 0;

      // Update project current value
      await supabase
        .from('projects')
        .update({ current_value: totalValue })
        .eq('id', project.id);

    } catch (error) {
      console.error('Error updating Connect People progress:', error);
    }
  };

  return {
    createReferralGoal,
    suggestGoalsFromContact,
    createGAINSFollowUpGoals,
    linkOpportunityToGoals,
    updateConnectPeopleProgress
  };
};
