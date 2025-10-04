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

// Template data structure (language-agnostic)
export const getTemplateRulesData = (category: BrandBookTemplate['category']) => {
  const templates = {
    luxury: {
      icon: '👑',
      strictness: 'high' as const,
      rulesKey: 'luxury'
    },
    sustainable: {
      icon: '🌿',
      strictness: 'medium' as const,
      rulesKey: 'sustainable'
    },
    streetwear: {
      icon: '🔥',
      strictness: 'low' as const,
      rulesKey: 'streetwear'
    },
    casual: {
      icon: '✨',
      strictness: 'low' as const,
      rulesKey: 'casual'
    },
    minimal: {
      icon: '⚪',
      strictness: 'medium' as const,
      rulesKey: 'minimal'
    }
  };
  
  return templates[category];
};

export const TEMPLATE_CATEGORIES = ['luxury', 'sustainable', 'streetwear', 'casual', 'minimal'] as const;

