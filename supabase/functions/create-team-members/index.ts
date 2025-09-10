import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const swissTeamMembers = [
      { firstName: 'Matthias', lastName: 'Müller', email: 'matthias.mueller@kof.ethz.ch' },
      { firstName: 'Anna', lastName: 'Schmid', email: 'anna.schmid@kof.ethz.ch' },
      { firstName: 'Stefan', lastName: 'Meier', email: 'stefan.meier@kof.ethz.ch' },
      { firstName: 'Laura', lastName: 'Weber', email: 'laura.weber@kof.ethz.ch' },
      { firstName: 'David', lastName: 'Fischer', email: 'david.fischer@kof.ethz.ch' },
      { firstName: 'Nina', lastName: 'Keller', email: 'nina.keller@kof.ethz.ch' },
      { firstName: 'Marco', lastName: 'Baumann', email: 'marco.baumann@kof.ethz.ch' },
      { firstName: 'Sarah', lastName: 'Huber', email: 'sarah.huber@kof.ethz.ch' },
      { firstName: 'Thomas', lastName: 'Brunner', email: 'thomas.brunner@kof.ethz.ch' },
      { firstName: 'Lisa', lastName: 'Steiner', email: 'lisa.steiner@kof.ethz.ch' },
      { firstName: 'Patrick', lastName: 'Gut', email: 'patrick.gut@kof.ethz.ch' },
      { firstName: 'Claudia', lastName: 'Schneider', email: 'claudia.schneider@kof.ethz.ch' },
      { firstName: 'Michael', lastName: 'Zimmermann', email: 'michael.zimmermann@kof.ethz.ch' },
      { firstName: 'Sandra', lastName: 'Wyss', email: 'sandra.wyss@kof.ethz.ch' },
      { firstName: 'Daniel', lastName: 'Gerber', email: 'daniel.gerber@kof.ethz.ch' },
      { firstName: 'Petra', lastName: 'Lehmann', email: 'petra.lehmann@kof.ethz.ch' },
      { firstName: 'Roger', lastName: 'Hofer', email: 'roger.hofer@kof.ethz.ch' },
      { firstName: 'Eva', lastName: 'Bürki', email: 'eva.buerki@kof.ethz.ch' },
      { firstName: 'Christoph', lastName: 'Roth', email: 'christoph.roth@kof.ethz.ch' },
      { firstName: 'Manuela', lastName: 'Graf', email: 'manuela.graf@kof.ethz.ch' }
    ]

    const results = []
    
    for (const member of swissTeamMembers) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: member.email,
        password: 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: member.firstName,
          last_name: member.lastName
        }
      })

      if (error) {
        console.error(`Error creating user ${member.email}:`, error)
        results.push({ email: member.email, success: false, error: error.message })
      } else {
        console.log(`Created user: ${member.email}`)
        results.push({ email: member.email, success: true, userId: data.user.id })
      }
    }

    // Update existing contacts to be assigned to these new team members
    const { data: newUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name')
      .in('first_name', swissTeamMembers.map(m => m.firstName))

    if (newUsers && newUsers.length > 0) {
      // Get existing contacts that need assignment
      const { data: contacts } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .limit(20)

      if (contacts && contacts.length > 0) {
        // Randomly assign contacts to team members
        for (let i = 0; i < contacts.length; i++) {
          const randomTeamMember = newUsers[i % newUsers.length]
          await supabaseAdmin
            .from('contacts')
            .update({ assigned_to: randomTeamMember.id })
            .eq('id', contacts[i].id)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Team members created successfully',
        results,
        totalCreated: results.filter(r => r.success).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})