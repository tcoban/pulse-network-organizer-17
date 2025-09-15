import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactPair {
  contact1: any;
  contact2: any;
}

interface AnalysisRequest {
  contacts: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contacts }: AnalysisRequest = await req.json()

    // Create introduction pairs for analysis
    const pairs: ContactPair[] = []
    
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i]
        const contact2 = contacts[j]
        
        if (contact1.lookingFor || contact1.offering || contact2.lookingFor || contact2.offering) {
          pairs.push({ contact1, contact2 })
        }
      }
    }

    // Analyze each pair with LLM
    const analyzedPairs = []
    
    for (const pair of pairs.slice(0, 10)) { // Limit to prevent too many API calls
      const analysis = await analyzeContactPair(pair)
      if (analysis.isMatch) {
        analyzedPairs.push({
          ...pair,
          matchReason: analysis.reason,
          matchScore: analysis.confidence,
          matchType: analysis.matchType
        })
      }
    }

    // Sort by confidence score
    analyzedPairs.sort((a, b) => b.matchScore - a.matchScore)

    return new Response(
      JSON.stringify({ pairs: analyzedPairs }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in analyze-introduction-matches:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function analyzeContactPair(pair: ContactPair) {
  const { contact1, contact2 } = pair
  
  const prompt = `
You are an expert networking facilitator. Analyze these two professional contacts to determine if they would benefit from an introduction.

Contact 1:
- Name: ${contact1.name}
- Position: ${contact1.position || 'Not specified'}
- Company: ${contact1.company || 'Not specified'}
- What they're offering: ${contact1.offering || 'Not specified'}
- What they're looking for: ${contact1.lookingFor || 'Not specified'}
- Current projects: ${contact1.currentProjects || 'Not specified'}
- Affiliation: ${contact1.affiliation || 'Not specified'}

Contact 2:
- Name: ${contact2.name}
- Position: ${contact2.position || 'Not specified'}
- Company: ${contact2.company || 'Not specified'}
- What they're offering: ${contact2.offering || 'Not specified'}
- What they're looking for: ${contact2.lookingFor || 'Not specified'}
- Current projects: ${contact2.currentProjects || 'Not specified'}
- Affiliation: ${contact2.affiliation || 'Not specified'}

Analyze if these contacts would benefit from an introduction based on:
1. Complementary needs and offerings
2. Potential business synergies
3. Professional alignment
4. Shared interests or projects
5. Network value

Respond in JSON format:
{
  "isMatch": boolean,
  "confidence": number (0-100),
  "reason": "Detailed explanation of why they should be introduced",
  "matchType": "need-offering" | "business-synergy" | "professional-alignment" | "project-collaboration" | "network-expansion"
}

Only return matches with confidence > 60.
`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert networking facilitator with deep understanding of business relationships and professional synergies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const analysis = JSON.parse(content)
      return analysis
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content)
      return { isMatch: false, confidence: 0, reason: 'Analysis failed', matchType: 'none' }
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return { isMatch: false, confidence: 0, reason: 'Analysis failed', matchType: 'none' }
  }
}