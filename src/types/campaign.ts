import type { Locale, LookPostItem, RiskLevel } from "./lookpost";

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  status: 'draft' | 'published' | 'scheduled';
  centerpiece_image: string;
  accessories_images: string[];
  model_image?: string;
  look_visual: string;
  image_analysis?: {
    mainPiece: string;
    colors: string;
    styleAesthetic: string;
    accessories: string;
  };
  short_description: string;
  long_description: string;
  instagram: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    altText: string;
    suggestedTime: string;
  };
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  brand_compliance_score?: number;
  brand_compliance_original_score?: number;
  brand_compliance_adjustments?: string[];
  
  // Campos opcionais para schema Look&Post completo
  locale?: Locale;
  source_version?: string;
  
  input?: {
    brief: string;
    occasion?: string;
    vibe?: string;
    audience?: string;
    budget_hint?: string;
  };
  
  product?: {
    name: string;
    sku?: string;
    material?: string;
    fit?: string;
    style: string;
    colors: string[];
    size_notes?: string;
  };
  
  look_items?: LookPostItem[];
  palette_hex?: string[];
  seo_keywords?: string[];
  brand_tone?: string;
  
  governance?: {
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
  
  telemetry?: {
    gen_durations_ms: {
      look_image?: number;
      descriptions?: number;
      instagram?: number;
    };
    output_lengths: {
      desc_short_chars: number;
      desc_long_words: number;
      caption_chars: number;
    };
    time_saved_minutes?: number;
  };
}
