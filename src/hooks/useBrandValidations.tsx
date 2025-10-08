import { useMemo } from "react";
import { Campaign } from "@/types/campaign";

type AdjustmentItem = string | {
  rawText: string;
  translationKey: string;
  category: string;
};

export interface BrandValidation {
  id: string;
  user_id: string;
  campaign_id: string | null;
  original_content: any;
  corrected_content: any | null;
  validation_score: number | null;
  adjustments_made: AdjustmentItem[] | null;
  user_approved: boolean | null;
  created_at: string;
}

export interface ValidationAnalytics {
  avgScore: number;
  totalValidations: number;
  complianceRate: number;
  topAdjustments: { adjustment: string; count: number }[];
  scoreEvolution: { date: string; avgScore: number; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  recentValidations: BrandValidation[];
}

export function useBrandValidations(campaigns: Campaign[] | undefined, isLoading: boolean) {
  // Convert campaigns to BrandValidation format for compatibility
  const validations = useMemo(() => 
    campaigns?.map(c => ({
      id: c.id,
      user_id: c.user_id,
      campaign_id: c.id,
      original_content: {},
      corrected_content: {},
      validation_score: c.brand_compliance_score,
      adjustments_made: c.brand_compliance_adjustments || [],
      user_approved: null,
      created_at: c.created_at,
    })) as BrandValidation[] | undefined,
    [campaigns]
  );

  const analytics = useMemo((): ValidationAnalytics => {
    if (!campaigns || campaigns.length === 0) {
      return {
        avgScore: 0,
        totalValidations: 0,
        complianceRate: 0,
        topAdjustments: [],
        scoreEvolution: [],
        categoryBreakdown: [],
        recentValidations: [],
      };
    }

    // Filter campaigns with compliance scores
    const campaignsWithScores = campaigns.filter(c => c.brand_compliance_score !== null);
    
    if (campaignsWithScores.length === 0) {
      return {
        avgScore: 0,
        totalValidations: campaigns.length,
        complianceRate: 0,
        topAdjustments: [],
        scoreEvolution: [],
        categoryBreakdown: [],
        recentValidations: [],
      };
    }

    // Calculate average score
    const avgScore = campaignsWithScores.reduce((acc, c) => acc + (c.brand_compliance_score || 0), 0) / campaignsWithScores.length;

    // Calculate compliance rate (>= 80%)
    const compliantCount = campaignsWithScores.filter(c => (c.brand_compliance_score || 0) >= 80).length;
    const complianceRate = (compliantCount / campaignsWithScores.length) * 100;

    // Helper function to get text from adjustment (old format: string, new format: object)
    const getAdjustmentText = (adj: AdjustmentItem): string => {
      if (typeof adj === 'string') return adj;
      return adj.rawText;
    };

    // Calculate top adjustments from brand_compliance_adjustments
    const adjustmentCounts = new Map<string, number>();
    campaignsWithScores.forEach(c => {
      const adjustments = c.brand_compliance_adjustments;
      if (adjustments && Array.isArray(adjustments)) {
        adjustments.forEach((adj: AdjustmentItem) => {
          const text = getAdjustmentText(adj);
          adjustmentCounts.set(text, (adjustmentCounts.get(text) || 0) + 1);
        });
      }
    });
    const topAdjustments = Array.from(adjustmentCounts.entries())
      .map(([adjustment, count]) => ({ adjustment, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate score evolution by date
    const scoresByDate = new Map<string, { total: number; count: number }>();
    campaignsWithScores.forEach(c => {
      const date = new Date(c.created_at).toISOString().split('T')[0];
      const existing = scoresByDate.get(date) || { total: 0, count: 0 };
      scoresByDate.set(date, {
        total: existing.total + (c.brand_compliance_score || 0),
        count: existing.count + 1,
      });
    });
    const scoreEvolution = Array.from(scoresByDate.entries())
      .map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Calculate category breakdown based on adjustments
    const categoryMap = new Map<string, number>();
    campaignsWithScores.forEach(c => {
      const adjustments = c.brand_compliance_adjustments;
      if (adjustments && Array.isArray(adjustments)) {
        adjustments.forEach((adj: AdjustmentItem) => {
          // Handle both old (string) and new (object) formats
          let categoryKey = 'content';
          
          if (typeof adj === 'object' && 'category' in adj) {
            // New format: use the category directly
            categoryKey = adj.category === 'vocabulary' ? 'vocabulary' :
                         adj.category === 'tone' ? 'toneOfVoice' :
                         adj.category === 'emoji' || adj.category === 'structure' ? 'structure' :
                         'content';
          } else {
            // Old format: infer from text
            const adjLower = getAdjustmentText(adj).toLowerCase();
            if (adjLower.includes('vocabulário') || adjLower.includes('palavra') || adjLower.includes('substituíd') || adjLower.includes('replaced')) {
              categoryKey = 'vocabulary';
            } else if (adjLower.includes('tom') || adjLower.includes('voz') || adjLower.includes('alinhado') || adjLower.includes('tone')) {
              categoryKey = 'toneOfVoice';
            } else if (adjLower.includes('emoji') || adjLower.includes('frase') || adjLower.includes('cta') || adjLower.includes('call-to-action') || adjLower.includes('sentence')) {
              categoryKey = 'structure';
            }
          }
          
          categoryMap.set(categoryKey, (categoryMap.get(categoryKey) || 0) + 1);
        });
      }
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }));

    // Convert recent campaigns to validation format
    const recentValidations = campaignsWithScores.slice(0, 10).map(c => ({
      id: c.id,
      user_id: c.user_id,
      campaign_id: c.id,
      original_content: {},
      corrected_content: {},
      validation_score: c.brand_compliance_score,
      adjustments_made: c.brand_compliance_adjustments || [],
      user_approved: null,
      created_at: c.created_at,
    })) as BrandValidation[];

    return {
      avgScore: Math.round(avgScore),
      totalValidations: campaignsWithScores.length,
      complianceRate: Math.round(complianceRate),
      topAdjustments,
      scoreEvolution,
      categoryBreakdown,
      recentValidations,
    } as ValidationAnalytics;
  }, [campaigns]);

  return {
    validations,
    analytics,
    isLoading,
  };
}
