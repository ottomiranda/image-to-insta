import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, productImage, modelImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!productImage) {
      throw new Error('Product image is required');
    }

    console.log('Starting campaign generation...');
    console.log('Images received - Product:', !!productImage, 'Model:', !!modelImage);

    // Step 1: Generate look visual using Gemini 2.5 Flash Image Preview with image composition
    console.log('Generating look visual with image composition...');
    
    const imagePrompt = modelImage
      ? `Compose a professional fashion look photograph by digitally dressing the model in the provided model image with the product from the product image. Context: ${prompt}. The result should be high-quality, fashion-forward, and suitable for e-commerce with professional lighting.`
      : `Create a complete professional fashion look incorporating the provided product image as the central piece. Add complementary fashion items to create a cohesive outfit. Context: ${prompt}. Style: high-quality, fashion-forward, suitable for e-commerce with professional lighting.`;

    // Build multimodal content array
    const contentArray: any[] = [
      { type: 'text', text: imagePrompt },
      { type: 'image_url', image_url: { url: productImage } }
    ];

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
    const textPrompt = `You are a fashion marketing and SEO expert. Based on this description: "${prompt}"

Generate the following content in English:

1. SHORT product description (max 200 characters) - SEO optimized, focused on key features
2. LONG product description (100-150 words) - detailing material, fit, occasion, and style, SEO optimized
3. Complete Instagram post including:
   - Engaging caption (start with emoji or engaging question)
   - 5-7 relevant fashion niche hashtags
   - Clear and persuasive call-to-action
   - Descriptive alt text for accessibility
   - Best posting time (format: "HHam/pm")

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
