import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Database, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { validateAndNormalizeCampaign } from '@/lib/validateCampaign';
import { Campaign } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';

interface MigrationStats {
  total: number;
  processed: number;
  corrected: number;
  errors: number;
  skipped: number;
}

interface MigrationLog {
  campaignId: string;
  campaignTitle: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  correctedFields?: string[];
}

export function MigrationPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    processed: 0,
    corrected: 0,
    errors: 0,
    skipped: 0
  });
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addLog = (log: MigrationLog) => {
    setLogs(prev => [...prev, log]);
  };

  const updateStats = (update: Partial<MigrationStats>) => {
    setStats(prev => ({ ...prev, ...update }));
  };

  const runMigration = async () => {
    setIsRunning(true);
    setProgress(0);
    setLogs([]);
    setIsComplete(false);
    setStats({
      total: 0,
      processed: 0,
      corrected: 0,
      errors: 0,
      skipped: 0
    });

    try {
      // 1. Buscar todas as campanhas
      addLog({
        campaignId: 'system',
        campaignTitle: t('migration.logs.system'),
        status: 'success',
        message: t('migration.logs.searchingCampaigns')
      });

      const { data: campaigns, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error(`Erro ao buscar campanhas: ${fetchError.message}`);
      }

      if (!campaigns || campaigns.length === 0) {
        addLog({
          campaignId: 'system',
          campaignTitle: t('migration.logs.system'),
          status: 'skipped',
          message: t('migration.logs.noCampaignsFound')
        });
        setIsComplete(true);
        return;
      }

      updateStats({ total: campaigns.length });
      addLog({
        campaignId: 'system',
        campaignTitle: t('migration.logs.system'),
        status: 'success',
        message: t('migration.logs.foundCampaigns', { count: campaigns.length })
      });

      // 2. Processar cada campanha
      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i] as unknown as Campaign;
        const progressPercent = Math.round(((i + 1) / campaigns.length) * 100);
        setProgress(progressPercent);

        try {
          // Executar validação e normalização
          const result = await validateAndNormalizeCampaign(campaign);
          
          if (result.corrected && result.correctedData) {
            // Salvar correções no banco
            const updateData: any = {
              look_items: result.correctedData.look?.items || [],
              palette_hex: result.correctedData.look?.palette_hex || [],
              seo_keywords: result.correctedData.descriptions?.seo_keywords || [],
              brand_tone: result.correctedData.descriptions?.brand_tone || null,
              governance: result.correctedData.governance || {},
              telemetry: result.correctedData.telemetry || {},
              updated_at: new Date().toISOString()
            };

            const { error: updateError } = await supabase
              .from('campaigns')
              .update(updateData)
              .eq('id', campaign.id);

            if (updateError) {
              throw new Error(`Erro ao salvar correções: ${updateError.message}`);
            }

            addLog({
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              status: 'success',
              message: t('migration.logs.successfullyCorrected'),
              correctedFields: result.validationLog.correctedFields
            });

            setStats(prev => ({ 
              ...prev, 
              processed: prev.processed + 1,
              corrected: prev.corrected + 1 
            }));

          } else {
            addLog({
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              status: 'skipped',
              message: result.valid ? t('migration.logs.alreadyValid') : t('migration.logs.invalidNoCorrection')
            });

            setStats(prev => ({ 
              ...prev, 
              processed: prev.processed + 1,
              skipped: prev.skipped + 1 
            }));
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          
          addLog({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            status: 'error',
            message: errorMessage
          });

          setStats(prev => ({ 
            ...prev, 
            processed: prev.processed + 1,
            errors: prev.errors + 1 
          }));
        }
      }

      setIsComplete(true);
      toast({
        title: t('migration.toast.completed'),
        description: t('migration.toast.completedDesc', { processed: stats.processed, corrected: stats.corrected }),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      addLog({
        campaignId: 'system',
        campaignTitle: t('migration.logs.system'),
        status: 'error',
        message: t('migration.logs.fatalError', { message: errorMessage })
      });

      toast({
        title: t('migration.toast.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: MigrationLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: MigrationLog['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('migration.status.success')}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t('migration.status.error')}</Badge>;
      case 'skipped':
        return <Badge variant="secondary">{t('migration.status.skipped')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('migration.title')}
          </CardTitle>
          <CardDescription>
            {t('migration.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRunning && !isComplete && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('migration.warning')}</strong> {t('migration.warningMessage')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <Button 
              onClick={runMigration} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('migration.runningMigration')}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t('migration.startMigration')}
                </>
              )}
            </Button>

            {isRunning && (
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span>{t('migration.progress')}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          {(stats.total > 0 || isComplete) && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t('migration.stats.total')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.corrected}</div>
                <div className="text-sm text-muted-foreground">{t('migration.stats.corrected')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
                <div className="text-sm text-muted-foreground">{t('migration.stats.skipped')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">{t('migration.stats.errors')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.processed}</div>
                <div className="text-sm text-muted-foreground">{t('migration.stats.processed')}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('migration.executionLog')}</CardTitle>
            <CardDescription>
              {t('migration.executionLogDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{log.campaignTitle}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    {log.correctedFields && log.correctedFields.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">{t('migration.logs.correctedFields')}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.correctedFields.map((field, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}