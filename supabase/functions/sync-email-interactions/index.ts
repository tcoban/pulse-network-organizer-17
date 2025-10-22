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

    console.log('[MOCK MODE] Simulating email interactions sync for user:', user.id);

    // Get some contacts to create email interactions for
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('assigned_to', user.id)
      .limit(5);

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, mock: true, synced: 0, message: 'No contacts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const mockEmailInteractions = [];

    // Create 2-3 mock email interactions per contact
    for (const contact of contacts) {
      const emailCount = Math.floor(Math.random() * 2) + 2; // 2-3 emails
      for (let i = 0; i < emailCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
        const sentAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        mockEmailInteractions.push({
          contact_id: contact.id,
          outlook_message_id: `mock-email-${contact.id}-${i}`,
          sent_at: sentAt.toISOString(),
          subject: [
            'RE: Partnership Opportunity',
            'FW: Research Collaboration',
            'Meeting Follow-up',
            'Q1 Budget Discussion',
            'Introduction Request',
          ][i % 5],
          sentiment_score: Math.floor(Math.random() * 11) - 5, // -5 to +5
          response_received: Math.random() > 0.3, // 70% response rate
        });
      }
    }

    // Insert email interactions (upsert to avoid duplicates)
    const { error: insertError } = await supabase
      .from('email_interactions')
      .upsert(mockEmailInteractions, { onConflict: 'outlook_message_id' });

    if (insertError) {
      console.error('Error inserting email interactions:', insertError);
    }

    // Update sync status
    await supabase
      .from('m365_sync_status')
      .upsert({
        user_id: user.id,
        resource_type: 'email',
        last_sync_at: new Date().toISOString(),
        is_mock: true,
      }, { onConflict: 'user_id,resource_type' });

    console.log('[MOCK MODE] Email interactions sync completed:', mockEmailInteractions.length);

    return new Response(
      JSON.stringify({
        success: true,
        mock: true,
        synced: mockEmailInteractions.length,
        contacts_processed: contacts.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing email interactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
