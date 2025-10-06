import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const useRevalidateCampaign = () => {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const revalidate = async (campaignId: string) => {
    setIsRevalidating(true);

    try {
      const { data, error } = await supabase.functions.invoke('revalidate-campaign', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      if (data.requiresConfiguration) {
        toast({
          title: t('brandCompliance.configurationRequired'),
          description: t('brandCompliance.configurationRequiredDesc'),
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        throw new Error(data.error || 'Revalidation failed');
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      toast({
        title: t('brandCompliance.revalidated'),
        description: `${t('brandCompliance.newScore')}: ${data.validation.score}%`,
      });

      return data.validation;
    } catch (error) {
      console.error('Revalidation error:', error);
      toast({
        title: t('brandCompliance.revalidationError'),
        description: error.message || t('brandCompliance.revalidationErrorDesc'),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRevalidating(false);
    }
  };

  return { revalidate, isRevalidating };
};
