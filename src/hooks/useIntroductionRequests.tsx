import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IntroductionRequest {
  contact_a_id: string;
  contact_b_id: string;
  introduced_by: string;
  introduction_reason: string;
  intermediary_ids?: string[];
}

export const useIntroductionRequests = () => {
  const queryClient = useQueryClient();

  const createIntroduction = useMutation({
    mutationFn: async (request: IntroductionRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('introduction_outcomes')
        .insert({
          contact_a_id: request.contact_a_id,
          contact_b_id: request.contact_b_id,
          introduced_by: user.id,
          introduction_reason: request.introduction_reason,
          outcome: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
      toast.success('Introduction request created successfully');
    },
    onError: (error) => {
      console.error('Error creating introduction:', error);
      toast.error('Failed to create introduction request');
    },
  });

  return {
    createIntroduction: createIntroduction.mutate,
    isCreating: createIntroduction.isPending,
  };
};
