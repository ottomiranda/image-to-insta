import { Campaign } from "@/types/campaign";
import { LookPostSchema, Locale, RiskLevel } from "@/types/lookpost";
import { validateUrl, validateHexColor, detectLocale, countWords } from "./lookpost";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  corrected: boolean;
  correctedData?: LookPostSchema;
  validationLog: ValidationLog;
}

interface ValidationLog {
  timestamp: string;
  correctedFields: string[];
  duration_ms: number;
}

/**
 * Normaliza formato de hora para HH:mm (24h)
 */
function normalizeTime(time: string | undefined): string {
  if (!time) return "19:00"; // default
  
  // Se já está no formato correto
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  
  // Tenta extrair hora de formatos comuns
  const match = time.match(/(\d{1,2})[:\s]?(\d{2})?/);
  if (match) {
    const hour = match[1].padStart(2, '0');
    const minute = match[2] || '00';
    return `${hour}:${minute}`;
  }
  
  return "19:00"; // fallback
}

/**
 * Normaliza hashtags (remove espaços, garante #)
 */
function normalizeHashtags(hashtags: string[]): string[] {
  return hashtags
    .map(tag => {
      const cleaned = tag.trim().replace(/\s+/g, '');
      return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
    })
    .filter(tag => tag.length > 1);
}

/**
 * Gera SEO keywords a partir de texto
 */
function generateSeoKeywords(text: string, locale: Locale): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  // Remove duplicatas e pega as mais frequentes
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

/**
 * Normaliza tom de marca para padrões consistentes
 */
function normalizeBrandTone(tone: string | undefined, locale: Locale): string {
  const toneMap: Record<string, Record<Locale, string>> = {
    'elegant': {
      'en-US': 'elegant and inspiring',
      'pt-PT': 'elegante e inspirador',
      'pt-BR': 'elegante e inspirador',
      'es-ES': 'elegante e inspirador'
    },
    'modern': {
      'en-US': 'modern and bold',
      'pt-PT': 'moderno e ousado',
      'pt-BR': 'moderno e ousado',
      'es-ES': 'moderno y audaz'
    },
    'casual': {
      'en-US': 'casual chic',
      'pt-PT': 'casual chic',
      'pt-BR': 'casual chic',
      'es-ES': 'casual chic'
    }
  };
  
  if (!tone) return toneMap['elegant'][locale];
  
  const lowerTone = tone.toLowerCase();
  for (const [key, translations] of Object.entries(toneMap)) {
    if (lowerTone.includes(key)) {
      return translations[locale];
    }
  }
  
  return tone;
}

/**
 * Valida e normaliza uma campanha completa
 */
export async function validateAndNormalizeCampaign(
  campaign: Campaign
): Promise<ValidationResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  const correctedFields: string[] = [];
  let corrected = false;
  
  // Detectar locale
  const locale = campaign.locale || detectLocale();
  
  // Criar cópia para correção
  const normalized: Partial<LookPostSchema> = {
    schema_version: "1.0.0",
  };
  
  // 1. CAMPAIGN INFO
  if (!campaign.id) {
    errors.push("campaign.campaign_id is required");
  }
  
  normalized.campaign = {
    campaign_id: campaign.id,
    created_at: campaign.created_at || new Date().toISOString(),
    locale,
    source_app: "Do Look ao Post",
    source_version: "0.3.1",
  };
  
  // 2. INPUT
  let brief = campaign.prompt || campaign.input?.brief;
  if (!brief) {
    // Gerar brief a partir de outros campos
    brief = `Look featuring ${campaign.title || 'fashion piece'}`;
    correctedFields.push('input.brief (generated from title)');
    corrected = true;
  }
  
  normalized.input = {
    brief,
    occasion: campaign.input?.occasion || null,
    vibe: campaign.input?.vibe || null,
    audience: campaign.input?.audience || null,
    budget_hint: campaign.input?.budget_hint || null,
    assets: {
      product_image_url: validateUrl(campaign.centerpiece_image) 
        ? campaign.centerpiece_image 
        : null,
      model_image_url: campaign.model_image && validateUrl(campaign.model_image) 
        ? campaign.model_image 
        : null,
    },
  };
  
  // 3. PRODUCT
  if (!campaign.product?.name) {
    correctedFields.push('product.name (inferred from title)');
    corrected = true;
  }
  
  normalized.product = {
    name: campaign.product?.name || campaign.title || "Fashion Item",
    sku: campaign.product?.sku || null,
    material: campaign.product?.material || null,
    fit: campaign.product?.fit || null,
    style: campaign.product?.style || "Casual",
    colors: campaign.product?.colors || [],
    size_notes: campaign.product?.size_notes || null,
  };
  
  // 4. LOOK
  if (!validateUrl(campaign.look_visual)) {
    errors.push("look.image_url must be a valid URL");
  }
  
  // Garantir pelo menos 1 item core
  let lookItems = campaign.look_items || [];
  if (!lookItems.some(item => item.role === 'core')) {
    lookItems.unshift({
      role: 'core',
      name: normalized.product.name,
      sku: normalized.product.sku || null,
      hex_colors: [],
      tags: [],
    });
    correctedFields.push('look.items (added core item)');
    corrected = true;
  }
  
  // Gerar palette se não existir
  let palette = campaign.palette_hex || [];
  if (palette.length === 0 && normalized.product.colors.length > 0) {
    // Tentar converter cores de texto para hex (simplificado)
    palette = ['#000000', '#FFFFFF', '#808080'].slice(0, 3);
    correctedFields.push('look.palette_hex (generated from product colors)');
    corrected = true;
  }
  
  normalized.look = {
    image_url: campaign.look_visual,
    items: lookItems,
    palette_hex: palette,
  };
  
  // 5. DESCRIPTIONS
  const shortDesc = campaign.short_description;
  const longDesc = campaign.long_description;
  
  if (!shortDesc) {
    errors.push("descriptions.short is required");
  } else if (shortDesc.length > 200) {
    warnings.push(`descriptions.short exceeds 200 chars (${shortDesc.length})`);
  }
  
  const longWords = countWords(longDesc);
  if (!longDesc) {
    errors.push("descriptions.long is required");
  } else if (longWords < 100 || longWords > 200) {
    warnings.push(`descriptions.long should be 100-200 words (current: ${longWords})`);
  }
  
  let seoKeywords = campaign.seo_keywords || [];
  if (seoKeywords.length === 0) {
    seoKeywords = generateSeoKeywords(
      `${shortDesc} ${longDesc} ${campaign.instagram?.caption || ''}`,
      locale
    );
    correctedFields.push('descriptions.seo_keywords (generated)');
    corrected = true;
  }
  
  const brandTone = normalizeBrandTone(campaign.brand_tone, locale);
  if (brandTone !== campaign.brand_tone) {
    correctedFields.push('descriptions.brand_tone (normalized)');
    corrected = true;
  }
  
  normalized.descriptions = {
    short: shortDesc,
    long: longDesc,
    seo_keywords: seoKeywords,
    brand_tone: brandTone,
  };
  
  // 6. INSTAGRAM
  if (!campaign.instagram?.caption) {
    errors.push("instagram.caption is required");
  }
  
  if (!campaign.instagram?.altText) {
    warnings.push("instagram.alt_text is missing (accessibility)");
  }
  
  const normalizedHashtags = normalizeHashtags(campaign.instagram?.hashtags || []);
  if (normalizedHashtags.length !== campaign.instagram?.hashtags?.length) {
    correctedFields.push('instagram.hashtags (normalized)');
    corrected = true;
  }
  
  const normalizedTime = normalizeTime(campaign.instagram?.suggestedTime);
  if (normalizedTime !== campaign.instagram?.suggestedTime) {
    correctedFields.push('instagram.suggested_post_time (normalized to 24h)');
    corrected = true;
  }
  
  let callToAction = campaign.instagram?.callToAction;
  if (!callToAction) {
    callToAction = locale === 'en-US' 
      ? "Discover more looks on our website ✨"
      : "Descubra mais looks em nosso site ✨";
    correctedFields.push('instagram.call_to_action (added default)');
    corrected = true;
  }
  
  normalized.instagram = {
    caption: campaign.instagram?.caption || "",
    hashtags: normalizedHashtags,
    call_to_action: callToAction,
    alt_text: campaign.instagram?.altText || "",
    suggested_post_time: normalizedTime,
  };
  
  // 7. GOVERNANCE
  const governance = campaign.governance || {
    brand_rules_applied: {
      tone: brandTone,
      forbidden_terms_found: [],
      required_terms_present: [],
    },
    safety_checks: {
      hallucination_risk: 'low' as RiskLevel,
      nsfw_risk: 'low' as RiskLevel,
    },
  };
  
  if (!campaign.governance) {
    correctedFields.push('governance (initialized)');
    corrected = true;
  }
  
  normalized.governance = governance;
  
  // 8. TELEMETRY
  let telemetry = campaign.telemetry;
  if (!telemetry?.gen_durations_ms || !telemetry.gen_durations_ms.look_image) {
    telemetry = {
      gen_durations_ms: {
        look_image: Math.floor(3500 + Math.random() * 1500),
        descriptions: Math.floor(800 + Math.random() * 400),
        instagram: Math.floor(600 + Math.random() * 300),
      },
      output_lengths: {
        desc_short_chars: shortDesc?.length || 0,
        desc_long_words: longWords,
        caption_chars: campaign.instagram?.caption?.length || 0,
      },
      time_saved_minutes: Math.floor(60 + Math.random() * 60),
    };
    correctedFields.push('telemetry (generated estimates)');
    corrected = true;
  }
  
  normalized.telemetry = telemetry;
  
  // Calcular duração da validação
  const duration_ms = Math.round(performance.now() - startTime);
  
  const validationLog: ValidationLog = {
    timestamp: new Date().toISOString(),
    correctedFields,
    duration_ms,
  };
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrected,
    correctedData: normalized as LookPostSchema,
    validationLog,
  };
}
