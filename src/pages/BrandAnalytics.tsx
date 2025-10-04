import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Award, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBrandValidations } from "@/hooks/useBrandValidations";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { UserNav } from "@/components/UserNav";
import { BrandSettingsDialog } from "@/components/BrandSettingsDialog";
import { useState } from "react";
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
  const { analytics, isLoading } = useBrandValidations();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Logo size="large" onClick={() => navigate('/campaigns')} />
            <UserNav onSettingsClick={() => setSettingsOpen(true)} />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-muted-foreground">Carregando analytics...</div>
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
            Voltar para Campanhas
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma validação encontrada. Crie sua primeira campanha para ver as métricas.
            </p>
            <Button onClick={() => navigate('/create')}>
              Criar Primeira Campanha
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

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 70) return "Bom";
    if (score >= 60) return "Adequado";
    return "Precisa Melhorias";
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
            Voltar para Campanhas
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics de Brand Compliance</h1>
          <p className="text-muted-foreground">
            Análise detalhada da conformidade do conteúdo com seu Brand Book
          </p>
        </div>

        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Score Médio</CardDescription>
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
              <CardDescription>Taxa de Compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" style={{ color: getScoreColor(analytics.complianceRate) }}>
                  {analytics.complianceRate}%
                </p>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Campanhas com score ≥ 80%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Validações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{analytics.totalValidations}</p>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Campanhas analisadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ajustes Aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">
                  {analytics.topAdjustments.reduce((acc, adj) => acc + adj.count, 0)}
                </p>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Correções automáticas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Score</CardTitle>
              <CardDescription>Score médio de compliance ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.scoreEvolution.length > 0 ? (
                <ChartContainer
                  config={{
                    avgScore: {
                      label: "Score Médio",
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
                  Dados insuficientes para gráfico
                </p>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Violações por Categoria</CardTitle>
              <CardDescription>Distribuição de ajustes por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <div className="flex items-center justify-between">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Violações",
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
                  Nenhuma categoria detectada
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Ajustes Mais Frequentes</CardTitle>
            <CardDescription>Correções mais aplicadas pela IA</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topAdjustments.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Frequência",
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
                Nenhum ajuste registrado ainda
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BrandSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
