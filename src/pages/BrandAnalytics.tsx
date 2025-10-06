import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Award, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBrandValidations } from "@/hooks/useBrandValidations";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { UserNav } from "@/components/UserNav";
import { BrandSettingsDialog } from "@/components/BrandSettingsDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  excellent: "hsl(var(--success))",
  good: "hsl(var(--warning))",
  poor: "hsl(var(--destructive))",
  primary: "hsl(var(--primary))",
};

export default function BrandAnalytics() {
  const navigate = useNavigate();
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { analytics, isLoading } = useBrandValidations(campaigns, campaignsLoading);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useTranslation();

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t('brandAnalytics.scoreLabels.excellent');
    if (score >= 80) return t('brandAnalytics.scoreLabels.veryGood');
    if (score >= 70) return t('brandAnalytics.scoreLabels.good');
    if (score >= 60) return t('brandAnalytics.scoreLabels.adequate');
    if (score === 50) return t('brandAnalytics.scoreLabels.pending');
    return t('brandAnalytics.scoreLabels.needsImprovement');
  };

  if (isLoading || campaignsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Logo size="large" onClick={() => navigate('/campaigns')} />
            <UserNav onSettingsClick={() => setSettingsOpen(true)} />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-muted-foreground">{t('brandAnalytics.loading')}</div>
        </main>
      </div>
    );
  }

  if (!analytics || analytics.totalValidations === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Logo size="large" onClick={() => navigate('/campaigns')} />
            <UserNav onSettingsClick={() => setSettingsOpen(true)} />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('brandAnalytics.backToCampaigns')}
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {t('brandAnalytics.noValidations')}
            </p>
            <Button onClick={() => navigate('/create')}>
              {t('brandAnalytics.createFirstCampaign')}
            </Button>
          </div>
        </main>
        <BrandSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.excellent;
    if (score >= 70) return COLORS.good;
    return COLORS.poor;
  };

  // Prepare pie chart data for category breakdown
  const categoryChartData = analytics.categoryBreakdown.map(cat => ({
    name: cat.category,
    value: cat.count,
  }));

  const CATEGORY_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="large" onClick={() => navigate('/campaigns')} />
          <UserNav onSettingsClick={() => setSettingsOpen(true)} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('brandAnalytics.backToCampaigns')}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('brandAnalytics.title')}</h1>
          <p className="text-muted-foreground">
            {t('brandAnalytics.description')}
          </p>
        </div>

        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('brandAnalytics.kpis.avgScore')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" style={{ color: getScoreColor(analytics.avgScore) }}>
                  {analytics.avgScore}%
                </p>
                {analytics.avgScore >= 80 ? (
                  <CheckCircle2 className="h-8 w-8" style={{ color: COLORS.excellent }} />
                ) : (
                  <AlertCircle className="h-8 w-8" style={{ color: COLORS.poor }} />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {getScoreLabel(analytics.avgScore)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('brandAnalytics.kpis.complianceRate')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" style={{ color: getScoreColor(analytics.complianceRate) }}>
                  {analytics.complianceRate}%
                </p>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('brandAnalytics.kpis.campaignsWithHighScore')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('brandAnalytics.kpis.totalValidations')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{analytics.totalValidations}</p>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('brandAnalytics.kpis.campaignsAnalyzed')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('brandAnalytics.kpis.adjustmentsApplied')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">
                  {analytics.topAdjustments.reduce((acc, adj) => acc + adj.count, 0)}
                </p>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('brandAnalytics.kpis.automaticCorrections')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('brandAnalytics.charts.scoreEvolution')}</CardTitle>
              <CardDescription>{t('brandAnalytics.charts.scoreEvolutionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.scoreEvolution.length > 0 ? (
                <ChartContainer
                  config={{
                    avgScore: {
                      label: t('brandAnalytics.charts.avgScoreLabel'),
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.scoreEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: COLORS.primary, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t('brandAnalytics.charts.insufficientData')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t('brandAnalytics.charts.categoryBreakdown')}</CardTitle>
              <CardDescription>{t('brandAnalytics.charts.categoryBreakdownDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <div className="flex items-center justify-between">
                  <ChartContainer
                    config={{
                      value: {
                        label: t('brandAnalytics.charts.violationsLabel'),
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[300px] flex-1"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="ml-4 space-y-2">
                    {categoryChartData.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t('brandAnalytics.charts.noCategoryDetected')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>{t('brandAnalytics.charts.topAdjustments')}</CardTitle>
            <CardDescription>{t('brandAnalytics.charts.topAdjustmentsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topAdjustments.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: t('brandAnalytics.charts.frequencyLabel'),
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topAdjustments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="adjustment" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      width={200}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                {t('brandAnalytics.charts.noAdjustmentsYet')}
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BrandSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
