import { Campaign } from "@/types/campaign";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useValidateCampaign } from "@/hooks/useValidateCampaign";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface CampaignQualityIndicatorProps {
  campaign: Campaign;
  autoValidate?: boolean;
  compact?: boolean;
}

export function CampaignQualityIndicator({ 
  campaign, 
  autoValidate = true,
  compact = false 
}: CampaignQualityIndicatorProps) {
  const { validate, isValidating, validationResult } = useValidateCampaign();
  const { t } = useTranslation();
  
  useEffect(() => {
    if (autoValidate && !validationResult) {
      validate(campaign);
    }
  }, [autoValidate, campaign, validate, validationResult]);
  
  // Get brand compliance status
  const brandScore = campaign.brand_compliance_score || 0;
  const originalScore = campaign.brand_compliance_original_score;
  const hasImprovement = originalScore && originalScore !== brandScore;
  
  // Get JSON validation status
  const jsonValid = validationResult?.valid;
  const jsonCorrected = validationResult?.corrected;
  
  // Overall quality status
  const getQualityStatus = () => {
    if (isValidating) return 'validating';
    
    // Se não há resultado de validação ainda (autoValidate=false), usar apenas brand score
    if (!validationResult) {
      if (brandScore >= 80) return 'excellent';
      if (brandScore >= 60) return 'good';
      if (brandScore >= 50) return 'needsReview';
      return 'attention';
    }
    
    // Se há resultado de validação, considerar ambos JSON + brand
    if (!jsonValid) return 'invalid';
    if (jsonValid && !jsonCorrected && brandScore >= 80) return 'excellent';
    if (jsonValid && brandScore >= 60) return 'good';
    if (jsonValid && brandScore >= 50) return 'needsReview';
    return 'attention';
  };
  const status = getQualityStatus();
  
  const statusConfig = {
    validating: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: t('quality.status.validating'),
      color: 'bg-muted text-muted-foreground',
      variant: 'outline' as const,
    },
    excellent: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: t('quality.status.approved'),
      color: '',
      variant: 'approved' as const,
    },
    good: {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: jsonCorrected ? t('quality.status.corrected') : t('quality.status.adequate'),
      color: '',
      variant: 'adequate' as const,
    },
    needsReview: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: t('quality.status.needsReview'),
      color: '',
      variant: 'quality' as const,
    },
    invalid: {
      icon: <XCircle className="h-3 w-3" />,
      label: t('quality.status.invalid'),
      color: '',
      variant: 'attention' as const,
    },
    attention: {
      icon: <XCircle className="h-3 w-3" />,
      label: t('quality.status.requiresAttention'),
      color: '',
      variant: 'attention' as const,
    },
  } as const;
  const config = statusConfig[status];
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={config.variant} className={`gap-1 ${config.color} whitespace-nowrap`}>
              {config.icon}
              <span className="text-xs font-medium">{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-semibold">{t('quality.title')}</p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {jsonValid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>
                    {t('quality.jsonSchema')}: {validationResult ? (jsonValid ? t('quality.validated') : t('quality.invalid')) : t('quality.notValidated')}
                    {jsonCorrected && validationResult && ` ${t('quality.correctedSuffix', { count: validationResult.validationLog.correctedFields.length })}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  {brandScore >= 80 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : brandScore >= 60 ? (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                  )}
                  <span>
                    {t('quality.brandCompliance')}: 
                    {hasImprovement ? (
                      <span className="ml-1">
                        <span className="opacity-70">Original: {originalScore}%</span>
                        <span className="mx-1">→</span>
                        <span>Atual: {brandScore}%</span>
                      </span>
                    ) : (
                      <span className="ml-1">{brandScore}%</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="space-y-3 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{t('quality.title')}</h4>
        <Badge variant={config.variant} className={config.color}>
          {config.icon}
          {config.label}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
          {jsonValid ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">{t('quality.jsonSchema')}</p>
            <p className="text-xs text-muted-foreground">
              {jsonValid ? t('quality.validated') : t('quality.invalid')}
              {jsonCorrected && ` - ${t('quality.correctedSuffix', { count: validationResult?.validationLog.correctedFields.length })}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
          {brandScore >= 80 ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
          ) : brandScore >= 60 ? (
            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">{t('quality.brandCompliance')}</p>
            <p className="text-xs text-muted-foreground">
              {t('quality.score')}: 
              {hasImprovement ? (
                <span>
                  <span className="opacity-70">Original: {originalScore}%</span>
                  <span className="mx-1">→</span>
                  <span>Atual: {brandScore}%</span>
                </span>
              ) : (
                <span>{brandScore}%</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
