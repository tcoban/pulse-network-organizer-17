import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DuplicateRequest {
  title: string;
  date: string;
  contactId: string;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function fuzzyTitleMatch(title1: string, title2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const t1 = normalize(title1);
  const t2 = normalize(title2);
  
  if (t1 === t2) return true;
  
  const longer = t1.length > t2.length ? t1 : t2;
  const shorter = t1.length > t2.length ? t2 : t1;
  if (longer.includes(shorter) && shorter.length / longer.length > 0.8) return true;
  
  return levenshteinDistance(t1, t2) < 3;
}

function calculateMatchScore(
  opp1: { title: string; date: string; contact_id?: string },
  opp2: { title: string; date: string; contact_id?: string }
): number {
  let score = 0;
  
  const titleSimilarity = fuzzyTitleMatch(opp1.title, opp2.title) ? 50 : 0;
  score += titleSimilarity;
  
  const date1 = new Date(opp1.date);
  const date2 = new Date(opp2.date);
  const hoursDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff < 2) score += 30;
  else if (hoursDiff < 6) score += 20;
  else if (hoursDiff < 24) score += 10;
  
  if (opp1.contact_id && opp2.contact_id && opp1.contact_id === opp2.contact_id) {
    score += 20;
  }
  
  return score / 100;
}

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

    const { title, date, contactId }: DuplicateRequest = await req.json();
    console.log('Checking for duplicates:', { title, date, contactId });

    // Get date range (±24 hours)
    const targetDate = new Date(date);
    const startDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
    const endDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    // Check opportunities table
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('contact_id', contactId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
      throw oppError;
    }

    // Check calendar_events table
    const { data: calendarEvents, error: calError } = await supabase
      .from('calendar_events')
      .select('*')
      .contains('contact_ids', [contactId])
      .gte('event_start', startDate.toISOString())
      .lte('event_start', endDate.toISOString());

    if (calError) {
      console.error('Error fetching calendar events:', calError);
    }

    const duplicates: any[] = [];
    const newOpp = { title, date, contact_id: contactId };

    // Check opportunities
    opportunities?.forEach(opp => {
      const matchScore = calculateMatchScore(newOpp, {
        title: opp.title,
        date: opp.date,
        contact_id: opp.contact_id
      });

      if (matchScore > 0.7) {
        duplicates.push({
          id: opp.id,
          title: opp.title,
          date: opp.date,
          source: opp.source || 'manual',
          matchScore,
          type: opp.type
        });
      }
    });

    // Check calendar events
    calendarEvents?.forEach(event => {
      const matchScore = calculateMatchScore(newOpp, {
        title: event.event_title,
        date: event.event_start,
        contact_id: contactId
      });

      if (matchScore > 0.7) {
        duplicates.push({
          id: event.id,
          title: event.event_title,
          date: event.event_start,
          source: event.source || 'm365_sync',
          matchScore,
          type: event.opportunity_type
        });
      }
    });

    console.log(`Found ${duplicates.length} potential duplicates`);

    return new Response(
      JSON.stringify({ duplicates: duplicates.sort((a, b) => b.matchScore - a.matchScore) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-duplicate-opportunities:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
