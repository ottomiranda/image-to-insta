import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BrandValidation {
  id: string;
  user_id: string;
  campaign_id: string | null;
  original_content: any;
  corrected_content: any | null;
  validation_score: number | null;
  adjustments_made: string[] | null;
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

export function useBrandValidations() {
  // Fetch campaigns instead of brand_validations to get real compliance data
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns-for-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Convert campaigns to BrandValidation format for compatibility
  const validations = campaigns?.map(c => ({
    id: c.id,
    user_id: c.user_id,
    campaign_id: c.id,
    original_content: {},
    corrected_content: {},
    validation_score: c.brand_compliance_score,
    adjustments_made: c.brand_compliance_adjustments || [],
    user_approved: null,
    created_at: c.created_at,
  })) as BrandValidation[] | undefined;

  const { data: analytics } = useQuery({
    queryKey: ["brand-validations-analytics", campaigns?.length],
    queryFn: async () => {
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

      // Calculate top adjustments from brand_compliance_adjustments
      const adjustmentCounts = new Map<string, number>();
      campaignsWithScores.forEach(c => {
        const adjustments = c.brand_compliance_adjustments;
        if (adjustments && Array.isArray(adjustments)) {
          adjustments.forEach((adj: string) => {
            adjustmentCounts.set(adj, (adjustmentCounts.get(adj) || 0) + 1);
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
          adjustments.forEach((adj: string) => {
            const adjLower = adj.toLowerCase();
            if (adjLower.includes('vocabulário') || adjLower.includes('palavra') || adjLower.includes('substituíd')) {
              categoryMap.set('Vocabulário', (categoryMap.get('Vocabulário') || 0) + 1);
            } else if (adjLower.includes('tom') || adjLower.includes('voz') || adjLower.includes('alinhado')) {
              categoryMap.set('Tom de Voz', (categoryMap.get('Tom de Voz') || 0) + 1);
            } else if (adjLower.includes('emoji') || adjLower.includes('frase') || adjLower.includes('cta') || adjLower.includes('call-to-action')) {
              categoryMap.set('Estrutura', (categoryMap.get('Estrutura') || 0) + 1);
            } else {
              categoryMap.set('Conteúdo', (categoryMap.get('Conteúdo') || 0) + 1);
            }
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
    },
    enabled: !!campaigns,
  });

  return {
    validations,
    analytics,
    isLoading,
  };
}
