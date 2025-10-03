import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, XCircle, Award } from "lucide-react";

interface BrandComplianceIndicatorProps {
  score: number;
  adjustments?: string[];
  compact?: boolean;
  showDetails?: boolean;
}

export function BrandComplianceIndicator({ 
  score, 
  adjustments = [], 
  compact = false,
  showDetails = true 
}: BrandComplianceIndicatorProps) {
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
    return "Precisa Melhorias";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${getScoreColor()}`}>
              {getScoreIcon()}
              <span className="text-xs font-medium">{score}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-semibold">Brand Book Compliance: {getScoreLabel()}</p>
              {adjustments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ajustes realizados:</p>
                  <ul className="text-xs space-y-1">
                    {adjustments.slice(0, 3).map((adj, i) => (
                      <li key={i}>• {adj}</li>
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
          {score}% - {getScoreLabel()}
        </Badge>
      </div>

      {showDetails && adjustments.length > 0 && (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground font-medium">Ajustes aplicados:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            {adjustments.map((adjustment, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <span>{adjustment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
