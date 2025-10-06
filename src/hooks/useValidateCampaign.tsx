import { useState, useCallback } from "react";
import { Campaign } from "@/types/campaign";
import { validateAndNormalizeCampaign, ValidationResult } from "@/lib/validateCampaign";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useValidateCampaign = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const validate = useCallback(async (campaign: Campaign) => {
    setIsValidating(true);
    
    try {
      const result = await validateAndNormalizeCampaign(campaign);
      setValidationResult(result);
      
      if (result.valid && !result.corrected) {
        toast({
          title: "✅ " + t('validation.success'),
          description: t('validation.successDesc'),
        });
      } else if (result.valid && result.corrected) {
        toast({
          title: "⚠️ " + t('validation.corrected'),
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
  }, [toast, t]);

  return { validate, isValidating, validationResult };
};
