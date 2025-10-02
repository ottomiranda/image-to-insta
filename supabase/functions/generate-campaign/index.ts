import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language detection function
async function detectLanguage(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Detect the language of this text and return ONLY the ISO 639-1 code: "${text}"`
        }],
        tools: [{
          type: 'function',
          function: {
            name: 'detect_language',
            description: 'Detect the language of the text',
            parameters: {
              type: 'object',
              properties: {
                languageCode: { 
                  type: 'string', 
                  description: 'ISO 639-1 language code (e.g., en, pt, es, fr, it, de)'
                }
              },
              required: ['languageCode'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'detect_language' } }
      })
    });

    if (!response.ok) {
      console.error('Language detection failed, using English as fallback');
      return 'en';
    }

    const data = await response.json();
    const languageCode = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments).languageCode;
    console.log('🌍 Detected language:', languageCode);
    return languageCode || 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Fallback to English
  }
}

// Helper to get language name
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'pt': 'Portuguese (Português)',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'it': 'Italian (Italiano)',
    'de': 'German (Deutsch)'
  };
  return names[code] || 'English';
}

// Language-specific instructions
const languageInstructions: Record<string, any> = {
  'en': {
    generate: 'Generate the following in English',
    shortDesc: 'SHORT DESCRIPTION',
    longDesc: 'LONG DESCRIPTION',
    instagramPost: 'INSTAGRAM POST',
    caption: 'Caption',
    hashtags: 'Hashtags',
    cta: 'Call to Action',
    altText: 'Alt Text',
    suggestedTime: 'Suggested Posting Time'
  },
  'pt': {
    generate: 'Gere o seguinte em Português',
    shortDesc: 'DESCRIÇÃO CURTA',
    longDesc: 'DESCRIÇÃO LONGA',
    instagramPost: 'POST DO INSTAGRAM',
    caption: 'Legenda',
    hashtags: 'Hashtags',
    cta: 'Chamada para Ação',
    altText: 'Texto Alternativo',
    suggestedTime: 'Horário Sugerido para Publicação'
  },
  'es': {
    generate: 'Genera lo siguiente en Español',
    shortDesc: 'DESCRIPCIÓN CORTA',
    longDesc: 'DESCRIPCIÓN LARGA',
    instagramPost: 'PUBLICACIÓN DE INSTAGRAM',
    caption: 'Leyenda',
    hashtags: 'Hashtags',
    cta: 'Llamada a la Acción',
    altText: 'Texto Alternativo',
    suggestedTime: 'Hora Sugerida de Publicación'
  },
  'fr': {
    generate: 'Générez ce qui suit en Français',
    shortDesc: 'DESCRIPTION COURTE',
    longDesc: 'DESCRIPTION LONGUE',
    instagramPost: 'POST INSTAGRAM',
    caption: 'Légende',
    hashtags: 'Hashtags',
    cta: 'Appel à l\'Action',
    altText: 'Texte Alternatif',
    suggestedTime: 'Heure de Publication Suggérée'
  },
  'it': {
    generate: 'Genera quanto segue in Italiano',
    shortDesc: 'DESCRIZIONE BREVE',
    longDesc: 'DESCRIZIONE LUNGA',
    instagramPost: 'POST INSTAGRAM',
    caption: 'Didascalia',
    hashtags: 'Hashtag',
    cta: 'Invito all\'Azione',
    altText: 'Testo Alternativo',
    suggestedTime: 'Orario Consigliato per la Pubblicazione'
  },
  'de': {
    generate: 'Generieren Sie Folgendes auf Deutsch',
    shortDesc: 'KURZE BESCHREIBUNG',
    longDesc: 'LANGE BESCHREIBUNG',
    instagramPost: 'INSTAGRAM-BEITRAG',
    caption: 'Bildunterschrift',
    hashtags: 'Hashtags',
    cta: 'Handlungsaufforderung',
    altText: 'Alternativtext',
    suggestedTime: 'Vorgeschlagene Veröffentlichungszeit'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, centerpiece, accessories = [], modelImage, logoConfig, aspectRatio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!centerpiece) {
      throw new Error('Centerpiece dress is required');
    }

    console.log('Starting campaign generation...');
    console.log('Images received - Centerpiece:', !!centerpiece, 'Accessories:', accessories.length, 'Model:', !!modelImage);
    console.log('Aspect ratio requested:', aspectRatio || 'default (1:1)');
    
    // Step 0: Detect prompt language
    console.log('📝 Detecting language from prompt...');
    const detectedLanguage = await detectLanguage(prompt, LOVABLE_API_KEY);
    const langInstructions = languageInstructions[detectedLanguage] || languageInstructions['en'];
    console.log(`🌍 Using language: ${getLanguageName(detectedLanguage)}`);

    // Get user from authorization header and fetch brand settings
    const authHeader = req.headers.get('Authorization');
    let brandSettings = null;
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (!userError && user) {
          // Fetch brand settings for this user
          const { data: settings } = await supabaseClient
            .from('brand_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          brandSettings = settings;
          
          if (brandSettings) {
            console.log('✅ Brand settings applied:', {
              brand: brandSettings.brand_name,
              tone: brandSettings.tone_of_voice,
              style: brandSettings.preferred_style,
              keywords: brandSettings.preferred_keywords || 'none',
              avoid: brandSettings.words_to_avoid || 'none'
            });
          } else {
            console.log('⚠️ No brand settings found - using generic defaults');
          }
        }
      } catch (error) {
        console.log('Could not fetch brand settings:', error);
      }
    }

    // Build brand context if settings exist
    const brandContext = brandSettings ? `
BRAND IDENTITY:
- Brand Name: ${brandSettings.brand_name}
- Brand Values: ${brandSettings.brand_values}
- Tone of Voice: ${brandSettings.tone_of_voice}
- Target Market: ${brandSettings.target_market}
- Style: ${brandSettings.preferred_style}
${brandSettings.preferred_keywords ? `- Preferred Keywords: ${brandSettings.preferred_keywords}` : ''}
${brandSettings.words_to_avoid ? `- Avoid Words: ${brandSettings.words_to_avoid}` : ''}

Please ensure all generated content reflects this brand's identity, tone, and values.
` : '';

    // Calculate dimensions based on aspect ratio
    const calculateDimensions = (ratio: string): { width: number; height: number } => {
      const ratioMap: Record<string, { width: number; height: number }> = {
        "16:9": { width: 1920, height: 1080 },
        "9:16": { width: 1080, height: 1920 },
        "16:10": { width: 1920, height: 1200 },
        "10:16": { width: 1200, height: 1920 },
        "4:3": { width: 1600, height: 1200 },
        "3:4": { width: 1200, height: 1600 },
        "3:2": { width: 1620, height: 1080 },
        "2:3": { width: 1080, height: 1620 },
        "5:4": { width: 1280, height: 1024 },
        "4:5": { width: 1024, height: 1280 },
        "1:1": { width: 1024, height: 1024 },
      };
      return ratioMap[ratio] || { width: 1024, height: 1024 };
    };

    const dimensions = calculateDimensions(aspectRatio || "1:1");
    console.log(`Generating image with EXACT dimensions: ${dimensions.width}x${dimensions.height} (aspect ratio: ${aspectRatio || "1:1"})`);

    // Step 1: Generate look visual using Gemini 2.5 Flash Image Preview with image composition
    console.log('Generating look visual with image composition...');
    
    const imagePrompt = modelImage
      ? `CRITICAL: Generate image with EXACT dimensions ${dimensions.width}x${dimensions.height} pixels in ${aspectRatio || "1:1"} aspect ratio.

${brandContext}
Compose a professional fashion look photograph by digitally dressing the model with:
         1. CENTERPIECE: The dress from the first product image
         2. ACCESSORIES: ${accessories.length} complementary accessories from the following images
         Context: ${prompt}
         Create a cohesive, high-fashion editorial look with professional lighting and styling that aligns with the brand's aesthetic.

REMINDER: Output image MUST be exactly ${dimensions.width}x${dimensions.height} pixels (${aspectRatio || "1:1"} aspect ratio).`
      : `CRITICAL: Generate image with EXACT dimensions ${dimensions.width}x${dimensions.height} pixels in ${aspectRatio || "1:1"} aspect ratio.

${brandContext}
Create a complete professional fashion look with:
         1. CENTERPIECE: The dress from the first product image
         2. ACCESSORIES: ${accessories.length} complementary items from the following images
         Context: ${prompt}
         Style: high-quality, fashion-forward, suitable for e-commerce with professional lighting that matches the brand's preferred style.

REMINDER: Output image MUST be exactly ${dimensions.width}x${dimensions.height} pixels (${aspectRatio || "1:1"} aspect ratio).`;

    // Build multimodal content array
    const contentArray: any[] = [
      { type: 'text', text: imagePrompt },
      { type: 'image_url', image_url: { url: centerpiece } }
    ];

    // Add all accessories
    accessories.forEach((acc: string) => {
      contentArray.push({ type: 'image_url', image_url: { url: acc } });
    });

    // Add model image if provided
    if (modelImage) {
      contentArray.push({ type: 'image_url', image_url: { url: modelImage } });
    }

    // Test generationConfig with aspectRatio parameter
    const requestBody = {
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: contentArray
        }
      ],
      modalities: ['image', 'text'],
      generationConfig: {
        aspectRatio: aspectRatio || "1:1",
        numberOfImages: 1
      }
    };

    console.log('🧪 Testing generationConfig with aspectRatio:', aspectRatio || "1:1");
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('❌ Error in image generation:', errorText);
      console.error('❌ Response status:', imageResponse.status);
      throw new Error(`Error generating image: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    console.log('📊 Image API Response structure:', JSON.stringify({
      hasChoices: !!imageData.choices,
      choicesLength: imageData.choices?.length,
      hasMessage: !!imageData.choices?.[0]?.message,
      hasImages: !!imageData.choices?.[0]?.message?.images,
      imagesCount: imageData.choices?.[0]?.message?.images?.length,
      messageKeys: imageData.choices?.[0]?.message ? Object.keys(imageData.choices[0].message) : []
    }, null, 2));

    const lookVisual = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!lookVisual) {
      console.error('❌ Failed to extract image from response');
      throw new Error('Failed to generate look image');
    }

    console.log('✅ Look visual generated successfully');
    
    // Try to detect actual image dimensions if available in response
    if (imageData.choices?.[0]?.message?.images?.[0]?.metadata) {
      console.log('📐 Image metadata from API:', imageData.choices[0].message.images[0].metadata);
    }

    // Step 1.5: Apply logo overlay if requested
    let finalVisual = lookVisual;
    if (logoConfig && logoConfig.logoUrl) {
      console.log('Applying logo overlay...');
      try {
        // Download logo from URL
        const logoResponse = await fetch(logoConfig.logoUrl);
        if (!logoResponse.ok) {
          throw new Error('Failed to fetch logo');
        }
        const logoBlob = await logoResponse.blob();
        const logoBuffer = await logoBlob.arrayBuffer();
        const logoBase64 = `data:${logoBlob.type};base64,${btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))}`;

        // Build logo overlay prompt based on position
        const buildLogoPrompt = (position: string) => {
          const positionMap: Record<string, string> = {
            'top-left': 'in the top-left corner with 5% margin from edges',
            'top-center': 'centered at the top with 5% margin from top edge',
            'top-right': 'in the top-right corner with 5% margin from edges',
            'center-left': 'centered vertically on the left side with 5% margin from left edge',
            'center': 'centered in the middle of the image',
            'center-right': 'centered vertically on the right side with 5% margin from right edge',
            'bottom-left': 'in the bottom-left corner with 5% margin from edges',
            'bottom-center': 'centered at the bottom with 5% margin from bottom edge',
            'bottom-right': 'in the bottom-right corner with 5% margin from edges',
          };

          const positionDesc = positionMap[position] || positionMap['bottom-right'];
          
          return `Place this brand logo ${positionDesc} of the fashion image. 
The logo should be:
- Semi-transparent (80% opacity) to blend naturally
- Scaled to approximately 8-12% of the image width
- Maintain its original aspect ratio
- Have subtle drop shadow for visibility
- Look professional and tasteful, not obtrusive
- Preserve all details of the original fashion image

CRITICAL: Only overlay the logo - do not alter, regenerate, or modify any other aspect of the base image. The fashion look, model, colors, and composition must remain exactly as shown.`;
        };

        const logoPrompt = buildLogoPrompt(logoConfig.position);

        const logoOverlayResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: logoPrompt },
                  { type: 'image_url', image_url: { url: lookVisual } },
                  { type: 'image_url', image_url: { url: logoBase64 } }
                ]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!logoOverlayResponse.ok) {
          const errorText = await logoOverlayResponse.text();
          console.error('Error applying logo overlay:', errorText);
          // Continue without logo if overlay fails
        } else {
          const logoData = await logoOverlayResponse.json();
          const overlaidImage = logoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (overlaidImage) {
            finalVisual = overlaidImage;
            console.log('Logo overlay applied successfully');
          }
        }
      } catch (logoError) {
        console.error('Error in logo overlay process:', logoError);
        // Continue with original image if logo overlay fails
      }
    }

    // Step 2: Generate text content using Gemini 2.5 Pro with structured output
    console.log('Generating text content...');
    const textPrompt = `You are a professional fashion marketing expert creating content for ${brandSettings?.brand_name || 'a fashion brand'}.

========================================
📸 ANALYZE THE PROVIDED IMAGE
========================================
CRITICAL INSTRUCTION: Describe ONLY what you see in the provided fashion look photograph. Do not invent scenarios, settings, or details not visible in the image.

Identify:
- Exact clothing pieces shown (dress/top/skirt, etc.)
- Visible colors and patterns
- Style aesthetic (minimalist, boho, elegant, etc.)
- Accessories visible in the composition
- Overall mood and vibe of the photograph
- Lighting and presentation style

========================================
🎨 BRAND CONTEXT
========================================
${brandContext}

========================================
💡 CAMPAIGN CONTEXT
========================================
Original creative brief: "${prompt}"
Use this as thematic inspiration, but describe the ACTUAL image, not the brief.

========================================
🌍 LANGUAGE REQUIREMENT
========================================
CRITICAL: ALL generated content MUST be in ${getLanguageName(detectedLanguage)}.
This language was detected from the user's original prompt.

========================================
📝 CONTENT GENERATION REQUIREMENTS
========================================

${langInstructions.generate}:

1. **${langInstructions.shortDesc}** (max 200 characters in ${getLanguageName(detectedLanguage)})
   - SEO-optimized
   - Describe the actual look shown in the image
   - Focus on main piece + key styling elements
   ${brandSettings?.preferred_keywords ? `- Naturally incorporate: ${brandSettings.preferred_keywords}` : ''}

2. **${langInstructions.longDesc}** (100-150 words in ${getLanguageName(detectedLanguage)})
   - Describe the complete look as shown in the photograph
   - Mention visible colors, style, and pieces
   - Suggest occasions/styling based on what's shown
   - Use ${brandSettings?.tone_of_voice || 'professional'} tone
   - Reflect ${brandSettings?.preferred_style || 'elegant'} aesthetic
   ${brandSettings?.words_to_avoid ? `- NEVER use: ${brandSettings.words_to_avoid}` : ''}

3. **${langInstructions.instagramPost}** (all content in ${getLanguageName(detectedLanguage)})
   - ${langInstructions.caption}: Reference the actual look/aesthetic in the photo
   - 5-7 ${langInstructions.hashtags.toLowerCase()} relevant to the style shown
   - ${langInstructions.cta}: Aligned with ${brandSettings?.target_market || 'fashion enthusiasts'}
   - ${langInstructions.altText}: Accurate description of image contents
   - ${langInstructions.suggestedTime}: Best for ${brandSettings?.target_market || 'general audience'}

========================================
⚠️ CRITICAL RULES
========================================
✅ Describe what IS in the image
❌ Do NOT invent scenarios not shown
✅ Match brand tone: ${brandSettings?.tone_of_voice || 'professional'}
✅ Reflect brand style: ${brandSettings?.preferred_style || 'elegant'}
${brandSettings?.brand_values ? `✅ Align with brand values: ${brandSettings.brand_values}` : ''}

Respond using the JSON tool format.`;

    const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: textPrompt },
              { type: 'image_url', image_url: { url: finalVisual } }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_campaign_content',
              description: 'Generates complete fashion campaign content',
              parameters: {
                type: 'object',
                properties: {
                  imageAnalysis: {
                    type: 'object',
                    description: 'Analysis of the actual generated image',
                    properties: {
                      mainPiece: { type: 'string', description: 'Primary clothing item visible' },
                      colors: { type: 'string', description: 'Dominant colors in the image' },
                      styleAesthetic: { type: 'string', description: 'Overall style vibe' },
                      accessories: { type: 'string', description: 'Visible accessories' }
                    },
                    required: ['mainPiece', 'colors', 'styleAesthetic']
                  },
                  shortDescription: {
                    type: 'string',
                    description: 'Short product description (max 200 characters)'
                  },
                  longDescription: {
                    type: 'string',
                    description: 'Long product description (100-150 words)'
                  },
                  instagram: {
                    type: 'object',
                    properties: {
                      caption: {
                        type: 'string',
                        description: 'Complete Instagram caption'
                      },
                      hashtags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of 5-7 hashtags'
                      },
                      callToAction: {
                        type: 'string',
                        description: 'Final call-to-action'
                      },
                      altText: {
                        type: 'string',
                        description: 'Alt text for accessibility'
                      },
                      suggestedTime: {
                        type: 'string',
                        description: 'Suggested posting time (format HHam/pm)'
                      }
                    },
                    required: ['caption', 'hashtags', 'callToAction', 'altText', 'suggestedTime']
                  }
                },
                required: ['imageAnalysis', 'shortDescription', 'longDescription', 'instagram']
              }
            }
          }
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'generate_campaign_content' }
        }
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('Error in text generation:', errorText);
      throw new Error(`Error generating content: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const toolCall = textData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Failed to generate structured content');
    }

    const content = JSON.parse(toolCall.function.arguments);
    console.log('Text content generated successfully');

    // Return complete campaign
    const result = {
      lookVisual: finalVisual,
      imageAnalysis: content.imageAnalysis,
      shortDescription: content.shortDescription,
      longDescription: content.longDescription,
      instagram: content.instagram
    };

    console.log('Campaign generated successfully!');
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating campaign:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
