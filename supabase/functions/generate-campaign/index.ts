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
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    if (!productImage) {
      throw new Error('Imagem do produto é obrigatória');
    }

    console.log('Iniciando geração de campanha...');
    console.log('Imagens recebidas - Produto:', !!productImage, 'Modelo:', !!modelImage);

    // Step 1: Generate look visual using Gemini 2.5 Flash Image Preview with image composition
    console.log('Gerando look visual com composição de imagens...');
    
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
      console.error('Erro na geração de imagem:', errorText);
      throw new Error(`Erro ao gerar imagem: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const lookVisual = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!lookVisual) {
      throw new Error('Falha ao gerar imagem do look');
    }

    console.log('Look visual gerado com sucesso');

    // Step 2: Generate text content using Gemini 2.5 Pro with structured output
    console.log('Gerando conteúdo textual...');
    const textPrompt = `Você é um especialista em marketing de moda e SEO. Baseado nesta descrição: "${prompt}"

Gere o seguinte conteúdo em português brasileiro:

1. Descrição CURTA do produto (máximo 200 caracteres) - otimizada para SEO, focada em características principais
2. Descrição LONGA do produto (100-150 palavras) - detalhando material, caimento, ocasião e estilo, otimizada para SEO
3. Post completo para Instagram incluindo:
   - Legenda cativante (inicie com emoji ou pergunta envolvente)
   - 5-7 hashtags relevantes do nicho de moda
   - Call-to-action final claro e persuasivo
   - Alt text descritivo para acessibilidade
   - Melhor horário de postagem (formato: "HHh")

Responda no formato JSON especificado pela ferramenta.`;

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
              description: 'Gera conteúdo completo de campanha de moda',
              parameters: {
                type: 'object',
                properties: {
                  shortDescription: {
                    type: 'string',
                    description: 'Descrição curta do produto (máx 200 caracteres)'
                  },
                  longDescription: {
                    type: 'string',
                    description: 'Descrição longa do produto (100-150 palavras)'
                  },
                  instagram: {
                    type: 'object',
                    properties: {
                      caption: {
                        type: 'string',
                        description: 'Legenda completa para Instagram'
                      },
                      hashtags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de 5-7 hashtags'
                      },
                      callToAction: {
                        type: 'string',
                        description: 'Call-to-action final'
                      },
                      altText: {
                        type: 'string',
                        description: 'Texto alternativo para acessibilidade'
                      },
                      suggestedTime: {
                        type: 'string',
                        description: 'Horário sugerido de postagem (formato HHh)'
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
      console.error('Erro na geração de texto:', errorText);
      throw new Error(`Erro ao gerar conteúdo: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const toolCall = textData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Falha ao gerar conteúdo estruturado');
    }

    const content = JSON.parse(toolCall.function.arguments);
    console.log('Conteúdo textual gerado com sucesso');

    // Return complete campaign
    const result = {
      lookVisual,
      shortDescription: content.shortDescription,
      longDescription: content.longDescription,
      instagram: content.instagram
    };

    console.log('Campanha gerada com sucesso!');
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar campanha:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
