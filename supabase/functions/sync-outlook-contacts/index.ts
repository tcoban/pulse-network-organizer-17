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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[MOCK MODE] Simulating Outlook contact sync for user:', user.id);

    // MOCK DATA: Simulate 3 Outlook contacts
    const mockOutlookContacts = [
      {
        id: 'mock-outlook-001',
        displayName: 'Christine Lagarde',
        emailAddresses: [{ address: 'christine.lagarde@ecb.europa.eu' }],
        jobTitle: 'President',
        companyName: 'European Central Bank',
        mobilePhone: '+49-69-1344-0',
      },
      {
        id: 'mock-outlook-002',
        displayName: 'Janet Yellen',
        emailAddresses: [{ address: 'janet.yellen@treasury.gov' }],
        jobTitle: 'Secretary of the Treasury',
        companyName: 'U.S. Department of the Treasury',
        mobilePhone: '+1-202-622-2000',
      },
      {
        id: 'mock-outlook-003',
        displayName: 'Thomas Jordan',
        emailAddresses: [{ address: 'thomas.jordan@snb.ch' }],
        jobTitle: 'Chairman',
        companyName: 'Swiss National Bank',
        mobilePhone: '+41-44-631-31-11',
      },
    ];

    // Sync mock contacts to database
    const syncResults = [];
    for (const outlookContact of mockOutlookContacts) {
      // Check if contact already exists
      const { data: existingMapping } = await supabase
        .from('outlook_contact_mappings')
        .select('contact_id')
        .eq('outlook_contact_id', outlookContact.id)
        .single();

      if (existingMapping) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            name: outlookContact.displayName,
            email: outlookContact.emailAddresses[0]?.address,
            position: outlookContact.jobTitle,
            company: outlookContact.companyName,
            phone: outlookContact.mobilePhone,
          })
          .eq('id', existingMapping.contact_id);

        if (!updateError) {
          syncResults.push({ action: 'updated', contact: outlookContact.displayName });
        }
      } else {
        // Create new contact
        const { data: newContact, error: insertError } = await supabase
          .from('contacts')
          .insert({
            name: outlookContact.displayName,
            email: outlookContact.emailAddresses[0]?.address,
            position: outlookContact.jobTitle,
            company: outlookContact.companyName,
            phone: outlookContact.mobilePhone,
            assigned_to: user.id,
            notes: '[Mock] Synced from Outlook',
          })
          .select()
          .single();

        if (newContact) {
          // Create mapping
          await supabase
            .from('outlook_contact_mappings')
            .insert({
              contact_id: newContact.id,
              outlook_contact_id: outlookContact.id,
              sync_direction: 'from_outlook',
            });

          syncResults.push({ action: 'created', contact: outlookContact.displayName });
        }
      }
    }

    // Update sync status
    await supabase
      .from('m365_sync_status')
      .upsert({
        user_id: user.id,
        resource_type: 'contacts',
        last_sync_at: new Date().toISOString(),
        is_mock: true,
      }, { onConflict: 'user_id,resource_type' });

    console.log('[MOCK MODE] Sync completed:', syncResults);

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
    console.error('Error syncing contacts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
