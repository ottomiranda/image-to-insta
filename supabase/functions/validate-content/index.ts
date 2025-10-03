import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  score: number;
  adjustments: string[];
  correctedContent: any;
  violations: {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, brandSettings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Starting content validation:', { brandSettings });

    const brandBookRules = brandSettings.brand_book_rules || {
      vocabulary: { preferred: [], forbidden: [], alternatives: {} },
      writing_style: {},
      content_rules: {}
    };

    const strictnessLevel = brandSettings.validation_strictness || 'medium';
    
    // Build validation prompt
    const validationPrompt = `You are a brand compliance validator. Analyze the following content and validate it against the brand book rules.

BRAND BOOK RULES:
${JSON.stringify(brandBookRules, null, 2)}

STRICTNESS LEVEL: ${strictnessLevel}

CONTENT TO VALIDATE:
${JSON.stringify(content, null, 2)}

Your task:
1. Check for forbidden words and suggest alternatives from the brand book
2. Verify tone of voice matches brand guidelines
3. Check writing style compliance (sentence length, emojis, CTAs)
4. Identify any violations with severity (high/medium/low)
5. Generate corrected version of the content

Return a JSON object with this structure:
{
  "score": <number 0-100>,
  "violations": [
    {
      "type": "forbidden_word|tone|structure|content_rule",
      "severity": "high|medium|low",
      "message": "Description of the violation",
      "location": "where in the content"
    }
  ],
  "adjustments": ["List of specific changes made"],
  "correctedContent": {
    // corrected version with same structure as input
  }
}`;

    console.log('Calling AI for validation...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a brand compliance expert. Always return valid JSON responses."
          },
          {
            role: "user",
            content: validationPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI validation error:', response.status, errorText);
      throw new Error(`AI validation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const validationText = aiResponse.choices?.[0]?.message?.content || "{}";
    
    console.log('AI validation response:', validationText);

    // Parse AI response
    let validationResult: ValidationResult;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = validationText.match(/```json\n([\s\S]*?)\n```/) || 
                        validationText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : validationText;
      validationResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return original content with low score if parsing fails
      validationResult = {
        score: 50,
        adjustments: ['Unable to complete full validation'],
        correctedContent: content,
        violations: [{
          type: 'system',
          severity: 'low',
          message: 'Validation completed with limited analysis'
        }]
      };
    }

    // Apply strictness multiplier
    let finalScore = validationResult.score;
    if (strictnessLevel === 'high') {
      finalScore = Math.max(0, finalScore - 10);
    } else if (strictnessLevel === 'low') {
      finalScore = Math.min(100, finalScore + 10);
    }

    return new Response(
      JSON.stringify({
        success: true,
        validation: {
          ...validationResult,
          score: finalScore,
          strictnessLevel
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in validate-content function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validation: {
          score: 0,
          adjustments: [],
          correctedContent: null,
          violations: []
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
