export type Locale = 'pt-PT' | 'pt-BR' | 'en-US' | 'es-ES';

export type ItemRole = 'core' | 'accessory' | 'footwear' | 'bag' | 'jewelry' | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface LookPostItem {
  role: ItemRole;
  name: string;
  sku?: string | null;
  hex_colors: string[];
  tags: string[];
  price?: {
    value?: number | null;
    currency?: string | null;
  };
}

export interface LookPostSchema {
  schema_version: string;
  campaign: {
    campaign_id: string;
    created_at: string;
    locale: Locale;
    source_app: string;
    source_version: string;
  };
  input: {
    brief: string;
    occasion?: string | null;
    vibe?: string | null;
    audience?: string | null;
    budget_hint?: string | null;
    assets: {
      product_image_url?: string | null;
      model_image_url?: string | null;
    };
  };
  product: {
    name: string;
    sku?: string | null;
    material?: string | null;
    fit?: string | null;
    style: string;
    colors: string[];
    size_notes?: string | null;
  };
  look: {
    image_url: string;
    items: LookPostItem[];
    palette_hex: string[];
  };
  descriptions: {
    short: string;
    long: string;
    seo_keywords: string[];
    brand_tone: string;
  };
  instagram: {
    caption: string;
    hashtags: string[];
    call_to_action: string;
    alt_text: string;
    suggested_post_time: string;
  };
  governance: {
    brand_rules_applied: {
      tone: string;
      forbidden_terms_found: string[];
      required_terms_present: string[];
    };
    safety_checks: {
      hallucination_risk: RiskLevel;
      nsfw_risk: RiskLevel;
    };
  };
  telemetry: {
    gen_durations_ms: {
      look_image?: number | null;
      descriptions?: number | null;
      instagram?: number | null;
    };
    output_lengths: {
      desc_short_chars: number;
      desc_long_words: number;
      caption_chars: number;
    };
    time_saved_minutes?: number | null;
  };
}
