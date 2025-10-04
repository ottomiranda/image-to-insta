import { BrandBookRules } from "@/hooks/useBrandSettings";

export interface BrandBookTemplate {
  id: string;
  name: string;
  description: string;
  category: 'luxury' | 'casual' | 'sustainable' | 'streetwear' | 'minimal';
  icon: string;
  rules: BrandBookRules;
  strictness: 'low' | 'medium' | 'high';
}

export const BRAND_BOOK_TEMPLATES: BrandBookTemplate[] = [
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    description: 'Para marcas de alto padrão com foco em exclusividade e sofisticação',
    category: 'luxury',
    icon: '👑',
    strictness: 'high',
    rules: {
      vocabulary: {
        preferred: ['exclusivo', 'sofisticado', 'premium', 'elegante', 'atemporal', 'artesanal', 'luxuoso', 'refinado'],
        forbidden: ['barato', 'desconto', 'promoção', 'comum', 'popular', 'básico', 'simples'],
        alternatives: {
          'barato': 'acessível',
          'desconto': 'oferta especial',
          'comum': 'clássico',
          'simples': 'minimalista'
        }
      },
      writing_style: {
        max_sentence_length: 18,
        use_emojis: false,
        max_emojis_per_post: 1,
        call_to_action_required: false
      },
      content_rules: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      identity: {
        tone_of_voice: 'Sofisticado e exclusivo',
        target_market: 'Público de alto poder aquisitivo',
        preferred_style: 'Luxury Premium',
        brand_values: 'Exclusividade, qualidade superior, artesanato'
      }
    }
  },
  {
    id: 'sustainable-conscious',
    name: 'Sustainable & Conscious',
    description: 'Para marcas eco-friendly com compromisso ambiental e social',
    category: 'sustainable',
    icon: '🌿',
    strictness: 'medium',
    rules: {
      vocabulary: {
        preferred: ['sustentável', 'eco-friendly', 'orgânico', 'consciente', 'natural', 'reciclado', 'ético', 'transparente', 'responsável'],
        forbidden: ['descartável', 'fast fashion', 'sintético', 'poluente'],
        alternatives: {
          'novo': 'renovado',
          'fabricado': 'criado conscientemente',
          'material': 'tecido sustentável'
        }
      },
      writing_style: {
        max_sentence_length: 22,
        use_emojis: true,
        max_emojis_per_post: 3,
        call_to_action_required: true
      },
      content_rules: {
        always_mention_sustainability: true,
        include_brand_hashtag: true,
        avoid_superlatives: true
      },
      identity: {
        tone_of_voice: 'Consciente e transparente',
        target_market: 'Consumidores eco-conscientes',
        preferred_style: 'Sustainable & Conscious',
        brand_values: 'Sustentabilidade, ética, transparência'
      }
    }
  },
  {
    id: 'streetwear-urban',
    name: 'Streetwear Urban',
    description: 'Para marcas jovens, urbanas e com atitude descolada',
    category: 'streetwear',
    icon: '🔥',
    strictness: 'low',
    rules: {
      vocabulary: {
        preferred: ['autêntico', 'único', 'urbano', 'streetwear', 'vibe', 'attitude', 'fresh', 'drip', 'fire'],
        forbidden: ['formal', 'conservador', 'tradicional', 'clássico'],
        alternatives: {
          'elegante': 'estiloso',
          'bonito': 'maneiro',
          'moderno': 'contemporâneo'
        }
      },
      writing_style: {
        max_sentence_length: 25,
        use_emojis: true,
        max_emojis_per_post: 5,
        call_to_action_required: true
      },
      content_rules: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      identity: {
        tone_of_voice: 'Descolado e autêntico',
        target_market: 'Jovens urbanos 18-30 anos',
        preferred_style: 'Streetwear Urban',
        brand_values: 'Autenticidade, cultura urbana, atitude'
      }
    }
  },
  {
    id: 'casual-everyday',
    name: 'Casual Everyday',
    description: 'Para marcas do dia a dia, confortáveis e acessíveis',
    category: 'casual',
    icon: '✨',
    strictness: 'low',
    rules: {
      vocabulary: {
        preferred: ['confortável', 'versátil', 'prático', 'casual', 'estilo', 'tendência', 'look', 'outfit'],
        forbidden: ['luxo', 'premium', 'exclusivo'],
        alternatives: {
          'caro': 'investimento',
          'barato': 'acessível',
          'simples': 'clean'
        }
      },
      writing_style: {
        max_sentence_length: 20,
        use_emojis: true,
        max_emojis_per_post: 4,
        call_to_action_required: true
      },
      content_rules: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      identity: {
        tone_of_voice: 'Acessível e amigável',
        target_market: 'Público geral, todas as idades',
        preferred_style: 'Casual Everyday',
        brand_values: 'Conforto, versatilidade, praticidade'
      }
    }
  },
  {
    id: 'minimal-contemporary',
    name: 'Minimal Contemporary',
    description: 'Para marcas minimalistas com design clean e contemporâneo',
    category: 'minimal',
    icon: '⚪',
    strictness: 'medium',
    rules: {
      vocabulary: {
        preferred: ['minimalista', 'clean', 'essencial', 'atemporal', 'design', 'funcional', 'contemporâneo', 'simplicidade'],
        forbidden: ['exagerado', 'chamativo', 'extravagante', 'ousado'],
        alternatives: {
          'bonito': 'bem desenhado',
          'moderno': 'contemporâneo',
          'simples': 'essencial'
        }
      },
      writing_style: {
        max_sentence_length: 15,
        use_emojis: false,
        max_emojis_per_post: 2,
        call_to_action_required: false
      },
      content_rules: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: true
      },
      identity: {
        tone_of_voice: 'Minimalista e direto',
        target_market: 'Apreciadores de design clean',
        preferred_style: 'Minimal Contemporary',
        brand_values: 'Simplicidade, funcionalidade, design'
      }
    }
  }
];

export const getBrandBookTemplate = (id: string): BrandBookTemplate | undefined => {
  return BRAND_BOOK_TEMPLATES.find(template => template.id === id);
};

export const getBrandBookTemplatesByCategory = (category: BrandBookTemplate['category']): BrandBookTemplate[] => {
  return BRAND_BOOK_TEMPLATES.filter(template => template.category === category);
};
