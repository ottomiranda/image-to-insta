import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sistema de mapeamento para converter textos de ajustes da IA em chaves de tradução
interface AdjustmentMapping {
  patterns: RegExp[];
  translationKey: string;
  category: 'vocabulary' | 'tone' | 'style' | 'structure' | 'emoji' | 'length' | 'content' | 'general';
}

const adjustmentMappings: AdjustmentMapping[] = [
  // Vocabulary replacements
  {
    patterns: [
      /replaced?\s+['"]([^'"]+)['"]?\s+with\s+['"]([^'"]+)['"]?/i,
      /substituíd[oa]?\s+['"]([^'"]+)['"]?\s+por\s+['"]([^'"]+)['"]?/i,
      /changed?\s+['"]([^'"]+)['"]?\s+to\s+['"]([^'"]+)['"]?/i,
      /alterou\s+['"]([^'"]+)['"]?\s+para\s+['"]([^'"]+)['"]?/i,
    ],
    translationKey: 'adjustments.vocabulary.wordReplacement',
    category: 'vocabulary'
  },
  {
    patterns: [
      /removed?\s+forbidden\s+word/i,
      /removeu\s+palavra\s+proibida/i,
      /eliminated?\s+forbidden\s+term/i,
      /eliminou\s+termo\s+proibido/i,
    ],
    translationKey: 'adjustments.vocabulary.forbiddenWordRemoved',
    category: 'vocabulary'
  },
  {
    patterns: [
      /used?\s+preferred\s+vocabulary/i,
      /usou\s+vocabulário\s+preferido/i,
      /applied?\s+brand\s+vocabulary/i,
      /aplicou\s+vocabulário\s+da\s+marca/i,
    ],
    translationKey: 'adjustments.vocabulary.preferredUsed',
    category: 'vocabulary'
  },
  // Tone adjustments
  {
    patterns: [
      /adjusted?\s+tone\s+to\s+be\s+more\s+(accessible|friendly)/i,
      /ajustou\s+tom\s+para\s+ser\s+mais\s+(acessível|amigável)/i,
      /made?\s+tone\s+more\s+(warm|welcoming)/i,
      /tornou\s+tom\s+mais\s+(caloroso|acolhedor)/i,
    ],
    translationKey: 'adjustments.tone.madeMoreAccessible',
    category: 'tone'
  },
  {
    patterns: [
      /adjusted?\s+tone\s+to\s+match\s+brand/i,
      /ajustou\s+tom\s+para\s+combinar\s+com\s+a\s+marca/i,
      /aligned?\s+tone\s+with\s+brand\s+voice/i,
      /alinhou\s+tom\s+com\s+a\s+voz\s+da\s+marca/i,
    ],
    translationKey: 'adjustments.tone.alignedWithBrand',
    category: 'tone'
  },
  {
    patterns: [
      /focused?\s+on\s+(comfort|versatility|practicality)/i,
      /focou\s+em\s+(conforto|versatilidade|praticidade)/i,
      /emphasized?\s+(comfort|versatility|practicality)/i,
      /enfatizou\s+(conforto|versatilidade|praticidade)/i,
    ],
    translationKey: 'adjustments.tone.focusedOnValues',
    category: 'tone'
  },
  // Style improvements
  {
    patterns: [
      /shortened?\s+sentences?\s+to\s+be\s+under\s+(\d+)\s+words?/i,
      /encurtou\s+frases?\s+para\s+ficar\s+abaixo\s+de\s+(\d+)\s+palavras?/i,
      /reduced?\s+sentence\s+length/i,
      /reduziu\s+o\s+tamanho\s+das\s+frases/i,
    ],
    translationKey: 'adjustments.style.shortenedSentences',
    category: 'length'
  },
  {
    patterns: [
      /improved?\s+readability/i,
      /melhorou\s+a\s+legibilidade/i,
      /enhanced?\s+clarity/i,
      /aprimorou\s+a\s+clareza/i,
    ],
    translationKey: 'adjustments.style.improvedReadability',
    category: 'style'
  },
  // Emoji adjustments
  {
    patterns: [
      /added?\s+emojis?\s+to\s+the?\s+(instagram\s+)?caption/i,
      /adicionou\s+emojis?\s+à\s+legenda\s+(do\s+instagram)?/i,
      /included?\s+emojis?\s+for\s+engagement/i,
      /incluiu\s+emojis?\s+para\s+engajamento/i,
    ],
    translationKey: 'adjustments.emoji.addedToCaption',
    category: 'emoji'
  },
  // Content structure
  {
    patterns: [
      /added?\s+a?\s+mention\s+of\s+sustainability/i,
      /adicionou\s+uma?\s+menção\s+à\s+sustentabilidade/i,
      /included?\s+sustainability\s+reference/i,
      /incluiu\s+referência\s+à\s+sustentabilidade/i,
    ],
    translationKey: 'adjustments.content.addedSustainability',
    category: 'content'
  },
  {
    patterns: [
      /improved?\s+call[- ]to[- ]action/i,
      /melhorou\s+a?\s+chamada\s+para\s+ação/i,
      /enhanced?\s+cta/i,
      /aprimorou\s+o?\s+cta/i,
    ],
    translationKey: 'adjustments.content.improvedCTA',
    category: 'content'
  },
  // General adjustments
  {
    patterns: [
      /improved?\s+overall\s+compliance/i,
      /melhorou\s+a?\s+conformidade\s+geral/i,
      /enhanced?\s+brand\s+alignment/i,
      /aprimorou\s+o?\s+alinhamento\s+com\s+a\s+marca/i,
    ],
    translationKey: 'adjustments.general.improvedCompliance',
    category: 'general'
  }
];

/**
 * Mapeia um texto de ajuste da IA para uma chave de tradução padronizada
 */
function mapAdjustmentToTranslationKey(adjustmentText: string): string {
  const normalizedText = adjustmentText.trim();
  
  // Procura por padrões conhecidos
  for (const mapping of adjustmentMappings) {
    for (const pattern of mapping.patterns) {
      if (pattern.test(normalizedText)) {
        return mapping.translationKey;
      }
    }
  }
  
  // Se não encontrar um padrão específico, tenta categorizar por palavras-chave
  const lowerText = normalizedText.toLowerCase();
  
  if (lowerText.includes('replaced') || lowerText.includes('substituíd') || 
      lowerText.includes('changed') || lowerText.includes('alterou')) {
    return 'adjustments.vocabulary.wordReplacement';
  }
  
  if (lowerText.includes('tone') || lowerText.includes('tom')) {
    return 'adjustments.tone.general';
  }
  
  if (lowerText.includes('emoji')) {
    return 'adjustments.emoji.general';
  }
  
  if (lowerText.includes('sentence') || lowerText.includes('frase') ||
      lowerText.includes('shortened') || lowerText.includes('encurtou')) {
    return 'adjustments.style.shortenedSentences';
  }
  
  if (lowerText.includes('sustainability') || lowerText.includes('sustentabilidade')) {
    return 'adjustments.content.addedSustainability';
  }
  
  // Fallback para ajuste genérico
  return 'adjustments.general.generic';
}

/**
 * Processa uma lista de ajustes da IA e retorna chaves de tradução
 */
function processAdjustments(adjustments: string[]): string[] {
  return adjustments.map(adjustment => mapAdjustmentToTranslationKey(adjustment));
}

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
    console.log('🔍 VALIDATE-CONTENT: Function invoked');
    const requestBody = await req.json();
    console.log('🔍 VALIDATE-CONTENT: Request body keys:', Object.keys(requestBody));
    
    const { content, brandSettings, campaign_id } = requestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error('❌ VALIDATE-CONTENT: LOVABLE_API_KEY is not configured');
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('🔍 VALIDATE-CONTENT: Starting validation with:', {
      hasContent: !!content,
      contentKeys: content ? Object.keys(content) : null,
      hasBrandSettings: !!brandSettings,
      brandSettingsKeys: brandSettings ? Object.keys(brandSettings) : null,
      campaign_id
    });

    const brandBookRules = brandSettings.brand_book_rules || {
      vocabulary: { preferred: [], forbidden: [], alternatives: {} },
      writing_style: {},
      content_rules: {},
      identity: { tone_of_voice: '', target_market: '', preferred_style: '', brand_values: '' }
    };

    const strictnessLevel = brandSettings.validation_strictness || 'medium';
    const brandName = brandSettings.brand_name || '';
    
    // Build validation prompt
    const validationPrompt = `You are a brand compliance validator. Analyze the following content and validate it against the brand book rules.

BRAND NAME: ${brandName}

BRAND IDENTITY:
- Tom de Voz: ${brandBookRules.identity?.tone_of_voice || 'Não definido'}
- Mercado-Alvo: ${brandBookRules.identity?.target_market || 'Não definido'}
- Estilo Preferido: ${brandBookRules.identity?.preferred_style || 'Não definido'}
- Valores da Marca: ${brandBookRules.identity?.brand_values || 'Não definido'}

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

    console.log('📤 VALIDATE-CONTENT: Calling AI for validation...');
    console.log('📤 VALIDATE-CONTENT: Prompt length:', validationPrompt.length);

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
      console.error('❌ VALIDATE-CONTENT: AI validation error:', response.status, errorText);
      throw new Error(`AI validation failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('📥 VALIDATE-CONTENT: AI response structure:', {
      hasChoices: !!aiResponse.choices,
      choicesLength: aiResponse.choices?.length,
      hasMessage: !!aiResponse.choices?.[0]?.message,
      hasContent: !!aiResponse.choices?.[0]?.message?.content
    });
    
    const validationText = aiResponse.choices?.[0]?.message?.content || "{}";
    
    console.log('📥 VALIDATE-CONTENT: AI validation response text (first 500 chars):', validationText.substring(0, 500));

    // Parse AI response
    let validationResult: ValidationResult;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = validationText.match(/```json\n([\s\S]*?)\n```/) || 
                        validationText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : validationText;
      console.log('🔍 VALIDATE-CONTENT: Attempting to parse JSON (first 300 chars):', jsonText.substring(0, 300));
      
      validationResult = JSON.parse(jsonText);
      console.log('✅ VALIDATE-CONTENT: Successfully parsed validation result:', {
        score: validationResult.score,
        adjustmentsCount: validationResult.adjustments?.length,
        violationsCount: validationResult.violations?.length,
        hasCorrectedContent: !!validationResult.correctedContent
      });
    } catch (parseError) {
      console.error('❌ VALIDATE-CONTENT: Failed to parse AI response:', parseError);
      console.error('❌ VALIDATE-CONTENT: Raw text that failed to parse:', validationText);
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
      console.log('⚠️ VALIDATE-CONTENT: Using fallback validation result');
    }

    // Apply strictness multiplier
    let finalScore = validationResult.score;
    if (strictnessLevel === 'high') {
      finalScore = Math.max(0, finalScore - 10);
    } else if (strictnessLevel === 'low') {
      finalScore = Math.min(100, finalScore + 10);
    }

    // Processar ajustes para chaves de tradução
    const processedAdjustments = processAdjustments(validationResult.adjustments || []);
    
    console.log('🔄 VALIDATE-CONTENT: Processing adjustments to translation keys:', {
      originalAdjustments: validationResult.adjustments,
      processedAdjustments,
      mappingCount: processedAdjustments.length
    });

    console.log('✅ VALIDATE-CONTENT: Returning final validation result:', {
      score: finalScore,
      originalScore: validationResult.score,
      strictnessLevel,
      adjustmentsCount: processedAdjustments.length,
      violationsCount: validationResult.violations?.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        validation: {
          ...validationResult,
          adjustments: processedAdjustments, // Usar ajustes processados com chaves de tradução
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
