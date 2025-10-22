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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[MOCK MODE] Simulating calendar sync for user:', user.id);

    // Get some contacts to attach to meetings
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('assigned_to', user.id)
      .limit(3);

    const now = new Date();
    const mockCalendarEvents = [
      {
        id: 'mock-event-001',
        subject: 'Q1 Economic Outlook Discussion',
        start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        end: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hour
        location: 'Microsoft Teams',
        attendees: contacts?.slice(0, 2) || [],
      },
      {
        id: 'mock-event-002',
        subject: 'Monetary Policy Review',
        start: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        end: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // +1.5 hours
        location: 'Zurich Office',
        attendees: contacts?.slice(1, 3) || [],
      },
      {
        id: 'mock-event-003',
        subject: 'Research Collaboration Meeting',
        start: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // +45 min
        location: 'ETH Zurich Main Building',
        attendees: contacts || [],
      },
    ];

    const syncResults = [];
    for (const event of mockCalendarEvents) {
      const contactIds = event.attendees.map(a => a.id);

      const { error: upsertError } = await supabase
        .from('calendar_events')
        .upsert({
          outlook_event_id: event.id,
          event_title: event.subject,
          event_start: event.start,
          event_end: event.end,
          location: event.location,
          contact_ids: contactIds,
        }, { onConflict: 'outlook_event_id' });

      if (!upsertError) {
        syncResults.push({ action: 'synced', event: event.subject });
      }
    }

    // Update sync status
    await supabase
      .from('m365_sync_status')
      .upsert({
        user_id: user.id,
        resource_type: 'calendar',
        last_sync_at: new Date().toISOString(),
        is_mock: true,
      }, { onConflict: 'user_id,resource_type' });

    console.log('[MOCK MODE] Calendar sync completed:', syncResults);

    return new Response(
      JSON.stringify({
        success: true,
        mock: true,
        synced: syncResults.length,
        details: syncResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
