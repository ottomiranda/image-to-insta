import { Campaign } from "@/types/campaign";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useValidateCampaign } from "@/hooks/useValidateCampaign";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    if (!jsonValid && validationResult) return 'invalid';
    if (jsonValid && !jsonCorrected && brandScore >= 80) return 'excellent';
    if (jsonValid && brandScore >= 60) return 'good';
    if (jsonValid && brandScore >= 50) return 'needsReview';
    return 'attention';
  };
  
  const status = getQualityStatus();
  
  const statusConfig = {
    validating: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: 'Validando...',
      color: 'bg-muted text-muted-foreground',
    },
    excellent: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Validado e Aprovado',
      color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    },
    good: {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: jsonCorrected ? 'Validado com Correções' : 'Adequado',
      color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    },
    needsReview: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'Precisa Revisão',
      color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    },
    invalid: {
      icon: <XCircle className="h-3 w-3" />,
      label: 'Requer Atenção',
      color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    },
    attention: {
      icon: <XCircle className="h-3 w-3" />,
      label: 'Requer Atenção',
      color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    },
  };
  
  const config = statusConfig[status];
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`gap-1 ${config.color}`}>
              {config.icon}
              <span className="text-xs">{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-semibold">Qualidade da Campanha</p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {jsonValid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>
                    JSON Schema: {jsonValid ? '✓ Validado' : '✗ Inválido'}
                    {jsonCorrected && ` (${validationResult?.validationLog.correctedFields.length} campos corrigidos)`}
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
                    Brand Compliance: {brandScore}%
                    {hasImprovement && ` (melhorado de ${originalScore}%)`}
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
        <h4 className="font-semibold">Qualidade da Campanha</h4>
        <Badge variant="outline" className={config.color}>
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
            <p className="font-medium">JSON Schema</p>
            <p className="text-xs text-muted-foreground">
              {jsonValid ? '✓ Validado' : '✗ Inválido'}
              {jsonCorrected && ` - ${validationResult?.validationLog.correctedFields.length} campos corrigidos automaticamente`}
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
            <p className="font-medium">Brand Book Compliance</p>
            <p className="text-xs text-muted-foreground">
              Score: {brandScore}%
              {hasImprovement && ` (melhorado de ${originalScore}%)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
