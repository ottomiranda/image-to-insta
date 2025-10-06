import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useBrandValidations } from "@/hooks/useBrandValidations";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Campaign } from "@/types/campaign";
import { useTranslation } from "react-i18next";
import { getAdjustmentTranslationKey } from "@/lib/adjustmentTranslations";

interface BrandComplianceWidgetProps {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
}

export function BrandComplianceWidget({ campaigns, isLoading: campaignsLoading }: BrandComplianceWidgetProps) {
  const { analytics, isLoading } = useBrandValidations(campaigns, campaignsLoading);
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading || campaignsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('brandComplianceWidget.title')}</CardTitle>
          <CardDescription>{t('brandComplianceWidget.description')}</CardDescription>
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
          <CardTitle>{t('brandComplianceWidget.title')}</CardTitle>
          <CardDescription>{t('brandComplianceWidget.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('brandComplianceWidget.empty')}</p>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              💡 <strong>{t('brandComplianceWidget.tip').split(':')[0]}:</strong> {t('brandComplianceWidget.tip').split(':').slice(1).join(':').trim()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (analytics.scoreEvolution.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;

    const recent = analytics.scoreEvolution.slice(-2);
    if (recent[1].avgScore > recent[0].avgScore) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    }
    if (recent[1].avgScore < recent[0].avgScore) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const metrics = [
    {
      label: t('brandComplianceWidget.avgScore'),
      value: `${analytics.avgScore}%`,
      tone: getScoreColor(analytics.avgScore),
    },
    {
      label: t('brandComplianceWidget.complianceRate'),
      value: `${analytics.complianceRate}%`,
      tone: getScoreColor(analytics.complianceRate),
    },
    {
      label: t('brandComplianceWidget.totalValidations'),
      value: analytics.totalValidations.toString(),
      tone: 'text-foreground',
    },
  ];

  const hasAdjustments = analytics.topAdjustments.length > 0;

  return (
    <Card className="border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{t('brandComplianceWidget.title')}</span>
          <span className="text-muted-foreground">{getTrendIcon()}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t('brandComplianceWidget.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-md border border-muted/50 bg-muted/30 p-3"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </p>
              <p className={`text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {analytics.avgScore < 70 && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-xs sm:text-sm">{t('brandComplianceWidget.lowScoreWarning')}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('brandComplianceWidget.topAdjustments')}
          </p>
          {hasAdjustments ? (
            <ul className="space-y-1.5">
              {analytics.topAdjustments.slice(0, 3).map((adj, idx) => {
                const translationKey = getAdjustmentTranslationKey(adj.adjustment);
                const translatedText = translationKey.startsWith('adjustments.') 
                  ? t(translationKey) 
                  : adj.adjustment;
                
                return (
                  <li key={idx} className="text-sm">
                    <span className="text-foreground">
                      {translatedText} {adj.count}x
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">{t('brandComplianceWidget.noAdjustments')}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t('brandComplianceWidget.description')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="sm:w-auto"
            onClick={() => navigate('/brand-analytics')}
          >
            {t('brandComplianceWidget.viewFullAnalytics')}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
