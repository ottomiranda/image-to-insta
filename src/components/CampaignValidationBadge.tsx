import { Campaign } from "@/types/campaign";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { useValidateCampaign } from "@/hooks/useValidateCampaign";
import { useEffect } from "react";

interface CampaignValidationBadgeProps {
  campaign: Campaign;
  autoValidate?: boolean;
}

export function CampaignValidationBadge({ 
  campaign, 
  autoValidate = true 
}: CampaignValidationBadgeProps) {
  const { validate, isValidating, validationResult } = useValidateCampaign();
  
  useEffect(() => {
    if (autoValidate && !validationResult) {
      validate(campaign);
    }
  }, [autoValidate, campaign, validate, validationResult]);
  
  if (isValidating) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Validando...
      </Badge>
    );
  }
  
  if (!validationResult) {
    return null;
  }
  
  if (validationResult.valid && !validationResult.corrected) {
    return (
      <Badge variant="default" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Validado
      </Badge>
    );
  }
  
  if (validationResult.valid && validationResult.corrected) {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
        <AlertTriangle className="h-3 w-3" />
        Corrigido automaticamente
      </Badge>
    );
  }
  
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      JSON inválido
    </Badge>
  );
}
