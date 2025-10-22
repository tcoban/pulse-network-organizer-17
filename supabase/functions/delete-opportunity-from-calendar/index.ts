import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { opportunityId } = await req.json();
    console.log('Deleting opportunity from calendar:', opportunityId);

    // Fetch the opportunity to get calendar_event_id
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('calendar_event_id, synced_to_calendar')
      .eq('id', opportunityId)
      .single();

    if (oppError || !opportunity) {
      throw new Error('Opportunity not found');
    }

    // If synced to calendar, delete the calendar event
    if (opportunity.calendar_event_id && opportunity.synced_to_calendar) {
      const { error: deleteError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', opportunity.calendar_event_id);

      if (deleteError) {
        console.error('Error deleting calendar event:', deleteError);
        throw deleteError;
      }

      console.log('Successfully deleted calendar event');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Calendar event deleted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-opportunity-from-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
