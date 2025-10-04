import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useBrandValidations } from "@/hooks/useBrandValidations";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandComplianceWidget() {
  const { analytics, isLoading } = useBrandValidations();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brand Compliance</CardTitle>
          <CardDescription>Análise de conformidade com o Brand Book</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.totalValidations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brand Compliance</CardTitle>
          <CardDescription>Análise de conformidade com o Brand Book</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhuma campanha validada ainda. Crie sua primeira campanha para ver as métricas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (analytics.scoreEvolution.length < 2) return <Minus className="h-4 w-4" />;
    
    const recent = analytics.scoreEvolution.slice(-2);
    if (recent[1].avgScore > recent[0].avgScore) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (recent[1].avgScore < recent[0].avgScore) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Brand Compliance</span>
          {getTrendIcon()}
        </CardTitle>
        <CardDescription>Análise de conformidade com o Brand Book</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Score Médio</p>
            <p className={`text-3xl font-bold ${getScoreColor(analytics.avgScore)}`}>
              {analytics.avgScore}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taxa de Compliance</p>
            <p className={`text-3xl font-bold ${getScoreColor(analytics.complianceRate)}`}>
              {analytics.complianceRate}%
            </p>
          </div>
        </div>

        {analytics.avgScore < 70 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Score médio abaixo de 70%. Revise suas regras de Brand Book.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Top Ajustes Recentes</p>
          <div className="space-y-1">
            {analytics.topAdjustments.slice(0, 3).map((adj, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate flex-1 mr-2">
                  {adj.adjustment}
                </span>
                <span className="font-medium">{adj.count}x</span>
              </div>
            ))}
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/brand-analytics')}
        >
          Ver Analytics Completo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
