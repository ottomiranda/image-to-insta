import { useState, useCallback } from "react";
import { Campaign } from "@/types/campaign";
import { validateAndNormalizeCampaign, ValidationResult } from "@/lib/validateCampaign";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useValidateCampaign = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const validate = useCallback(async (campaign: Campaign) => {
    setIsValidating(true);
    
    try {
      const result = await validateAndNormalizeCampaign(campaign);
      setValidationResult(result);
      
      // Log corrected data (these fields will be used when downloading JSON)
      if (result.valid && result.corrected && result.correctedData) {
        console.log('✅ JSON corrected automatically:', {
          correctedFields: result.validationLog.correctedFields,
          hasLookItems: !!result.correctedData.look.items.length,
          hasSeoKeywords: !!result.correctedData.descriptions.seo_keywords.length,
          hasBrandTone: !!result.correctedData.descriptions.brand_tone,
        });
        
        // Invalidate queries to refresh with corrected data
        await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      }
      
      if (result.valid && !result.corrected) {
        toast({
          title: "✅ " + t('validation.success'),
          description: t('validation.successDesc'),
        });
      } else if (result.valid && result.corrected) {
        toast({
          title: "✅ " + t('validation.corrected'),
          description: t('validation.correctedDesc', { 
            count: result.validationLog.correctedFields.length 
          }),
        });
      } else {
        toast({
          title: "🔴 " + t('validation.invalid'),
          description: t('validation.invalidDesc', { 
            count: result.errors.length 
          }),
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: t('validation.error'),
        description: error instanceof Error ? error.message : t('validation.errorDesc'),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [toast, t, queryClient]);

  return { validate, isValidating, validationResult };
};
