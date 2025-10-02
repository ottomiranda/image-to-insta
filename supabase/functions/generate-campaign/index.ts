import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, centerpiece, accessories = [], modelImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!centerpiece) {
      throw new Error('Centerpiece dress is required');
    }

    console.log('Starting campaign generation...');
    console.log('Images received - Centerpiece:', !!centerpiece, 'Accessories:', accessories.length, 'Model:', !!modelImage);

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
          console.log('Brand settings loaded:', !!brandSettings);
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

    // Step 1: Generate look visual using Gemini 2.5 Flash Image Preview with image composition
    console.log('Generating look visual with image composition...');
    
    const imagePrompt = modelImage
      ? `${brandContext}
Compose a professional fashion look photograph by digitally dressing the model with:
         1. CENTERPIECE: The dress from the first product image
         2. ACCESSORIES: ${accessories.length} complementary accessories from the following images
         Context: ${prompt}
         Create a cohesive, high-fashion editorial look with professional lighting and styling that aligns with the brand's aesthetic.`
      : `${brandContext}
Create a complete professional fashion look with:
         1. CENTERPIECE: The dress from the first product image
         2. ACCESSORIES: ${accessories.length} complementary items from the following images
         Context: ${prompt}
         Style: high-quality, fashion-forward, suitable for e-commerce with professional lighting that matches the brand's preferred style.`;

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

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: contentArray
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Error in image generation:', errorText);
      throw new Error(`Error generating image: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const lookVisual = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!lookVisual) {
      throw new Error('Failed to generate look image');
    }

    console.log('Look visual generated successfully');

    // Step 2: Generate text content using Gemini 2.5 Pro with structured output
    console.log('Generating text content...');
    const textPrompt = `You are a fashion marketing and SEO expert.${brandContext ? `\n\n${brandContext}` : ''} Based on this description: "${prompt}"

Generate the following content in English:

1. SHORT product description (max 200 characters) - SEO optimized, focused on key features
2. LONG product description (100-150 words) - detailing material, fit, occasion, and style, SEO optimized
3. Complete Instagram post including:
   - Engaging caption (start with emoji or engaging question)
   - 5-7 relevant fashion niche hashtags
   - Clear and persuasive call-to-action
   - Descriptive alt text for accessibility
   - Best posting time (format: "HHam/pm")

${brandSettings ? `IMPORTANT: Reflect the brand's ${brandSettings.tone_of_voice} tone of voice and ${brandSettings.preferred_style} style in all content.` : ''}
Respond in the JSON format specified by the tool.`;

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
            content: textPrompt
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
                required: ['shortDescription', 'longDescription', 'instagram']
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
      lookVisual,
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
