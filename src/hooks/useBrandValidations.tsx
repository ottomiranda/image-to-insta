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
  const { data: validations, isLoading } = useQuery({
    queryKey: ["brand-validations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_validations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrandValidation[];
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["brand-validations-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_validations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const validations = data as BrandValidation[];
      if (!validations || validations.length === 0) {
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

      // Calculate average score
      const scoresWithValue = validations.filter(v => v.validation_score !== null);
      const avgScore = scoresWithValue.length > 0
        ? scoresWithValue.reduce((acc, v) => acc + (v.validation_score || 0), 0) / scoresWithValue.length
        : 0;

      // Calculate compliance rate (>= 80%)
      const compliantCount = scoresWithValue.filter(v => (v.validation_score || 0) >= 80).length;
      const complianceRate = scoresWithValue.length > 0 
        ? (compliantCount / scoresWithValue.length) * 100
        : 0;

      // Calculate top adjustments
      const adjustmentCounts = new Map<string, number>();
      validations.forEach(v => {
        if (v.adjustments_made && Array.isArray(v.adjustments_made)) {
          v.adjustments_made.forEach((adj: string) => {
            adjustmentCounts.set(adj, (adjustmentCounts.get(adj) || 0) + 1);
          });
        }
      });
      const topAdjustments = Array.from(adjustmentCounts.entries())
        .map(([adjustment, count]) => ({ adjustment, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate score evolution (last 30 days)
      const scoresByDate = new Map<string, { total: number; count: number }>();
      validations.forEach(v => {
        if (v.validation_score !== null) {
          const date = new Date(v.created_at).toISOString().split('T')[0];
          const existing = scoresByDate.get(date) || { total: 0, count: 0 };
          scoresByDate.set(date, {
            total: existing.total + (v.validation_score || 0),
            count: existing.count + 1,
          });
        }
      });
      const scoreEvolution = Array.from(scoresByDate.entries())
        .map(([date, { total, count }]) => ({
          date,
          avgScore: Math.round(total / count),
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      // Calculate category breakdown (simulated based on adjustments)
      const categoryMap = new Map<string, number>();
      validations.forEach(v => {
        if (v.adjustments_made && Array.isArray(v.adjustments_made)) {
          v.adjustments_made.forEach((adj: string) => {
            const adjLower = adj.toLowerCase();
            if (adjLower.includes('vocabulário') || adjLower.includes('palavra') || adjLower.includes('substituíd')) {
              categoryMap.set('Vocabulário', (categoryMap.get('Vocabulário') || 0) + 1);
            } else if (adjLower.includes('tom') || adjLower.includes('estilo')) {
              categoryMap.set('Tom de Voz', (categoryMap.get('Tom de Voz') || 0) + 1);
            } else if (adjLower.includes('emoji') || adjLower.includes('frase') || adjLower.includes('cta')) {
              categoryMap.set('Estrutura', (categoryMap.get('Estrutura') || 0) + 1);
            } else {
              categoryMap.set('Conteúdo', (categoryMap.get('Conteúdo') || 0) + 1);
            }
          });
        }
      });
      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }));

      return {
        avgScore: Math.round(avgScore),
        totalValidations: validations.length,
        complianceRate: Math.round(complianceRate),
        topAdjustments,
        scoreEvolution,
        categoryBreakdown,
        recentValidations: validations.slice(0, 10),
      } as ValidationAnalytics;
    },
    enabled: !!validations,
  });

  return {
    validations,
    analytics,
    isLoading,
  };
}
