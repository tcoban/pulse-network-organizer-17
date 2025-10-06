import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log(`Analyzing ${contacts.length} contacts for matches`)

    // Create introduction pairs for analysis - optimized filtering
    const pairs: ContactPair[] = []
    const validContacts = contacts.filter(c => c.offering || c.lookingFor)
    
    for (let i = 0; i < validContacts.length; i++) {
      for (let j = i + 1; j < validContacts.length; j++) {
        pairs.push({ 
          contact1: validContacts[i], 
          contact2: validContacts[j] 
        })
      }
    }

    console.log(`Generated ${pairs.length} pairs, analyzing top 20`)

    // Batch analyze pairs with Lovable AI (faster and free)
    const analyzedPairs = []
    const pairsToAnalyze = pairs.slice(0, 20) // Analyze more pairs with faster model

    // Process in batches of 5 for better performance
    const batchSize = 5
    for (let i = 0; i < pairsToAnalyze.length; i += batchSize) {
      const batch = pairsToAnalyze.slice(i, i + batchSize)
      const batchPromises = batch.map(pair => analyzeContactPair(pair))
      const batchResults = await Promise.all(batchPromises)
      
      // Filter and add successful matches
      batchResults.forEach((analysis, idx) => {
        if (analysis.isMatch && analysis.confidence > 30) {
          analyzedPairs.push({
            ...batch[idx],
            matchReason: analysis.reason,
            matchScore: analysis.confidence,
            matchType: analysis.matchType,
            interpretation: analysis.interpretation
          })
        }
      })
    }

    // Sort by confidence score
    analyzedPairs.sort((a, b) => b.matchScore - a.matchScore)
    console.log(`Found ${analyzedPairs.length} matches`)

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
  
  const prompt = `Analyze if these professionals should be introduced:

Contact 1: ${contact1.name} - ${contact1.position || 'N/A'} at ${contact1.company || 'N/A'}
Offering: ${contact1.offering || 'N/A'}
Looking for: ${contact1.lookingFor || 'N/A'}

Contact 2: ${contact2.name} - ${contact2.position || 'N/A'} at ${contact2.company || 'N/A'}
Offering: ${contact2.offering || 'N/A'}
Looking for: ${contact2.lookingFor || 'N/A'}

Rate match confidence (0-100) and explain why. Focus on complementary needs/offerings.`

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Fast and free during promotion
        messages: [
          {
            role: 'system',
            content: 'You are a networking expert. Respond ONLY with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_match",
              description: "Analyze if two contacts should be introduced",
              parameters: {
                type: "object",
                properties: {
                  isMatch: { type: "boolean" },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                  reason: { type: "string" },
                  matchType: { 
                    type: "string", 
                    enum: ["need-offering", "business-synergy", "professional-alignment", "project-collaboration", "network-expansion"]
                  },
                  interpretation: { type: "string" }
                },
                required: ["isMatch", "confidence", "reason", "matchType", "interpretation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_match" } }
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limited by Lovable AI')
        return { isMatch: false, confidence: 0, reason: 'Rate limited', matchType: 'none', interpretation: 'Try again later' }
      }
      if (response.status === 402) {
        console.error('Payment required for Lovable AI')
        return { isMatch: false, confidence: 0, reason: 'No credits', matchType: 'none', interpretation: 'Add credits' }
      }
      throw new Error(`AI gateway error: ${response.status}`)
    }

    const data = await response.json()
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments)
      return analysis
    }

    return { isMatch: false, confidence: 0, reason: 'No analysis', matchType: 'none', interpretation: 'Error' }

  } catch (error) {
    console.error('Error analyzing pair:', error)
    return { isMatch: false, confidence: 0, reason: 'Analysis failed', matchType: 'none', interpretation: 'Technical error' }
  }
}
