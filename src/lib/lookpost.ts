import { Campaign } from "@/types/campaign";
import { LookPostSchema, Locale, LookPostItem } from "@/types/lookpost";
import i18n from "@/i18n/config";

const APP_VERSION = "0.3.1";
const SCHEMA_VERSION = "1.0.0";

/**
 * Valida se uma string é uma cor hexadecimal válida
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Valida se uma string é uma URL válida com protocolo http/https
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detecta o locale baseado na configuração do i18n
 */
export function detectLocale(): Locale {
  const lang = i18n.language || 'pt';
  
  if (lang.startsWith('pt-BR')) return 'pt-BR';
  if (lang.startsWith('pt')) return 'pt-PT';
  if (lang.startsWith('en')) return 'en-US';
  if (lang.startsWith('es')) return 'es-ES';
  
  return 'pt-PT'; // default
}

/**
 * Extrai cores de uma imagem (placeholder - retorna cores padrão)
 * Em produção, isso poderia usar uma lib de análise de imagem
 */
function extractColorsFromImage(imageUrl: string): string[] {
  // Placeholder - retorna cores padrão
  // Em produção, isso usaria análise de imagem real
  return [];
}

/**
 * Infere dados do produto a partir dos campos disponíveis
 */
function inferProductData(campaign: Campaign): LookPostSchema['product'] {
  // Tenta extrair informações da análise da imagem ou do prompt
  const analysis = campaign.image_analysis;
  
  return {
    name: campaign.title || "Produto",
    sku: null,
    material: null,
    fit: null,
    style: analysis?.styleAesthetic || campaign.product?.style || "casual",
    colors: analysis?.colors?.split(',').map(c => c.trim()) || 
            campaign.product?.colors || 
            [],
    size_notes: null,
  };
}

/**
 * Infere itens do look a partir dos acessórios
 */
function inferLookItems(campaign: Campaign): LookPostItem[] {
  const items: LookPostItem[] = [];
  
  // Item principal (centerpiece)
  items.push({
    role: 'core',
    name: campaign.title || "Peça Principal",
    sku: null,
    hex_colors: [],
    tags: [],
    price: {
      value: null,
      currency: null,
    },
  });
  
  // Acessórios
  if (campaign.accessories_images && campaign.accessories_images.length > 0) {
    campaign.accessories_images.forEach((_, index) => {
      items.push({
        role: 'accessory',
        name: `Acessório ${index + 1}`,
        sku: null,
        hex_colors: [],
        tags: [],
      });
    });
  }
  
  return items;
}

/**
 * Calcula o número de palavras em um texto
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Formata timestamp para nome de arquivo (YYYYMMDD-HHMM)
 */
export function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Constrói um JSON estruturado Look&Post a partir de uma campanha
 */
export function buildLookPostJson(campaign: Campaign): LookPostSchema {
  // Usar locale da campanha ou detectar
  const locale = campaign.locale || detectLocale();
  
  // Construir schema completo
  const schema: LookPostSchema = {
    schema_version: SCHEMA_VERSION,
    
    campaign: {
      campaign_id: campaign.id,
      created_at: campaign.created_at,
      locale,
      source_app: "Do Look ao Post",
      source_version: campaign.source_version || APP_VERSION,
    },
    
    input: {
      brief: campaign.prompt,
      occasion: campaign.input?.occasion || null,
      vibe: campaign.input?.vibe || null,
      audience: campaign.input?.audience || null,
      budget_hint: campaign.input?.budget_hint || null,
      assets: {
        product_image_url: validateUrl(campaign.centerpiece_image) ? campaign.centerpiece_image : null,
        model_image_url: campaign.model_image && validateUrl(campaign.model_image) ? campaign.model_image : null,
      },
    },
    
    product: campaign.product || inferProductData(campaign),
    
    look: {
      image_url: campaign.look_visual,
      items: campaign.look_items || inferLookItems(campaign),
      palette_hex: campaign.palette_hex || extractColorsFromImage(campaign.look_visual),
    },
    
    descriptions: {
      short: campaign.short_description,
      long: campaign.long_description,
      seo_keywords: campaign.seo_keywords || [],
      brand_tone: campaign.brand_tone || "elegante e inspirador",
    },
    
    instagram: {
      caption: campaign.instagram.caption,
      hashtags: campaign.instagram.hashtags,
      call_to_action: campaign.instagram.callToAction,
      alt_text: campaign.instagram.altText,
      suggested_post_time: campaign.instagram.suggestedTime,
    },
    
    governance: campaign.governance || {
      brand_rules_applied: {
        tone: campaign.brand_tone || "padrão",
        forbidden_terms_found: [],
        required_terms_present: [],
      },
      safety_checks: {
        hallucination_risk: 'low',
        nsfw_risk: 'low',
      },
    },
    
    telemetry: campaign.telemetry || {
      gen_durations_ms: {
        look_image: null,
        descriptions: null,
        instagram: null,
      },
      output_lengths: {
        desc_short_chars: campaign.short_description.length,
        desc_long_words: countWords(campaign.long_description),
        caption_chars: campaign.instagram.caption.length,
      },
      time_saved_minutes: null,
    },
  };
  
  return schema;
}

/**
 * Gera e força download do JSON da campanha
 */
export function downloadCampaignJson(campaign: Campaign): void {
  try {
    // Construir JSON
    const jsonData = buildLookPostJson(campaign);
    
    // Serializar com indentação
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Criar blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Gerar nome do arquivo
    const timestamp = formatTimestamp(new Date());
    const filename = `campaign-${campaign.id}-${timestamp}.json`;
    
    // Forçar download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('aria-label', `Baixar JSON da campanha ${campaign.id}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar URL do blob
    URL.revokeObjectURL(url);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Falha ao gerar JSON: ${errorMessage}`);
  }
}
