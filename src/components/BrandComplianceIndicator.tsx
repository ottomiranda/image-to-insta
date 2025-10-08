import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, XCircle, Award } from "lucide-react";
import { RevalidateButton } from "@/components/RevalidateButton";

type AdjustmentItem = string | {
  rawText: string;
  translationKey: string;
  category: string;
};

interface BrandComplianceIndicatorProps {
  score: number;
  originalScore?: number;
  adjustments?: AdjustmentItem[];
  compact?: boolean;
  showDetails?: boolean;
  campaignId?: string;
}

export function BrandComplianceIndicator({ 
  score, 
  originalScore,
  adjustments = [], 
  compact = false,
  showDetails = true,
  campaignId
}: BrandComplianceIndicatorProps) {
  const hasImprovement = originalScore !== null && originalScore !== undefined;
  const isPending = score === 50 && (!adjustments || adjustments.length === 0);

  // Helper function to get display text from adjustment
  const getAdjustmentText = (adj: AdjustmentItem): string => {
    if (typeof adj === 'string') {
      return adj; // Old format: direct string
    }
    return adj.rawText; // New format: use rawText for full context
  };

  // Helper function to check if adjustment contains warning
  const hasWarning = (adj: AdjustmentItem): boolean => {
    const text = getAdjustmentText(adj);
    return text.includes('⚠️');
  };
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 60) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getScoreIcon = () => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getScoreLabel = () => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 70) return "Bom";
    if (score >= 60) return "Adequado";
    if (score === 50) return "Validação Pendente";
    return "Precisa Melhorias";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${getScoreColor()}`}>
                {getScoreIcon()}
                <span className="text-xs font-medium">{score}%</span>
              </div>
              {isPending && campaignId && (
                <RevalidateButton campaignId={campaignId} variant="ghost" size="icon" showLabel={false} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-semibold">Brand Book Compliance: {getScoreLabel()}</p>
              {hasImprovement && (
                <div className="text-xs text-muted-foreground">
                  <span>Score Original: <strong>{originalScore}%</strong></span>
                  <span className="mx-1">→</span>
                  <span>Score Atual: <strong>{score}%</strong></span>
                </div>
              )}
              {isPending && (
                <p className="text-xs text-yellow-600">
                  ⚠️ Validação pendente. Clique no botão para validar agora.
                </p>
              )}
              {score === 50 && adjustments.some(hasWarning) && (
                <p className="text-xs text-warning">
                  ⚠️ Este score é provisório. A validação pode ter encontrado problemas.
                </p>
              )}
              {adjustments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {adjustments.some(hasWarning) ? 'Status:' : 'Ajustes realizados:'}
                  </p>
                  <ul className="text-xs space-y-1">
                    {adjustments.slice(0, 3).map((adj, i) => (
                      <li key={i} className={hasWarning(adj) ? 'text-warning' : ''}>
                        • {getAdjustmentText(adj)}
                      </li>
                    ))}
                    {adjustments.length > 3 && (
                      <li className="text-muted-foreground">+{adjustments.length - 3} mais...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Brand Book Compliance</h4>
        </div>
        <Badge variant="outline" className={getScoreColor()}>
          {hasImprovement ? (
            <span className="flex items-center gap-1">
              <span className="text-xs opacity-70">Original: {originalScore}%</span>
              <span className="text-xs">→</span>
              <span>Atual: {score}% - {getScoreLabel()}</span>
            </span>
          ) : (
            <span>{score}% - {getScoreLabel()}</span>
          )}
        </Badge>
      </div>

      {showDetails && (
        <>
          {isPending && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>Validação pendente. Esta campanha ainda não foi validada contra o Brand Book.</p>
                {campaignId && (
                  <div className="mt-2">
                    <RevalidateButton campaignId={campaignId} size="sm" />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {score === 50 && adjustments.some(hasWarning) && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Score provisório. A validação pode ter encontrado problemas técnicos.</p>
            </div>
          )}
          
          {adjustments.length > 0 && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground font-medium">
                {adjustments.some(hasWarning) ? 'Status da validação:' : 'Ajustes aplicados:'}
              </p>
              <ul className="space-y-1.5 text-muted-foreground">
                {adjustments.map((adjustment, index) => {
                  const text = getAdjustmentText(adjustment);
                  const isWarning = hasWarning(adjustment);
                  return (
                    <li key={index} className="flex items-start gap-2">
                      {isWarning ? (
                        <AlertCircle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                      )}
                      <span className={isWarning ? 'text-warning' : ''}>
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
