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

    const { opportunityId, contactId } = await req.json();
    console.log('Syncing opportunity to calendar:', { opportunityId, contactId });

    // Fetch the opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (oppError || !opportunity) {
      throw new Error('Opportunity not found');
    }

    // Fetch the contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('email, name')
      .eq('id', contactId || opportunity.contact_id)
      .single();

    if (contactError) {
      console.error('Error fetching contact:', contactError);
    }

    // Calculate end time (1 hour after start)
    const startDate = new Date(opportunity.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    // Create calendar event (mock for now)
    const { data: calendarEvent, error: calError } = await supabase
      .from('calendar_events')
      .insert({
        event_title: opportunity.title,
        event_start: opportunity.date,
        event_end: endDate.toISOString(),
        location: opportunity.location,
        outlook_event_id: `mock_${opportunityId}_${Date.now()}`,
        contact_ids: [opportunity.contact_id],
        opportunity_type: opportunity.type,
        source: 'manual_sync',
        meeting_prep_sent: false,
        outcome_captured: false
      })
      .select()
      .single();

    if (calError) {
      console.error('Error creating calendar event:', calError);
      throw calError;
    }

    // Update opportunity with calendar link
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        calendar_event_id: calendarEvent.id,
        synced_to_calendar: true
      })
      .eq('id', opportunityId);

    if (updateError) {
      console.error('Error updating opportunity:', updateError);
      throw updateError;
    }

    console.log('Successfully synced opportunity to calendar');

    return new Response(
      JSON.stringify({
        success: true,
        calendarEventId: calendarEvent.id,
        outlookEventId: calendarEvent.outlook_event_id,
        syncedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-opportunity-to-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
