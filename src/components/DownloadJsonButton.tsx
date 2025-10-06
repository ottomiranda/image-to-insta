import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { downloadCampaignJson, buildLookPostJson } from "@/lib/lookpost";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { validateAndNormalizeCampaign } from "@/lib/validateCampaign";

interface DownloadJsonButtonProps {
  campaign: Campaign;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function DownloadJsonButton({ 
  campaign, 
  variant = "outline", 
  size = "sm",
  showLabel = true,
  className = "",
}: DownloadJsonButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      // Validar e normalizar antes de baixar
      const validationResult = await validateAndNormalizeCampaign(campaign);
      
      if (!validationResult.valid) {
        toast({
          title: t('validation.invalid'),
          description: t('validation.invalidDesc', { count: validationResult.errors.length }),
          variant: "destructive",
        });
        return;
      }
      
      // Usar JSON corrigido se disponível
      const jsonToDownload = validationResult.correctedData 
        ? validationResult.correctedData 
        : buildLookPostJson(campaign);
      
      // Serializar com indentação
      const jsonString = JSON.stringify(jsonToDownload, null, 2);
      
      // Criar blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Gerar nome do arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `campaign-${campaign.id}-${timestamp}.json`;
      
      // Forçar download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: validationResult.corrected ? t('validation.corrected') : t('lookpost.success'),
        description: validationResult.corrected 
          ? t('validation.correctedDesc', { count: validationResult.validationLog.correctedFields.length })
          : t('lookpost.successDesc'),
      });
    } catch (error) {
      console.error('Erro ao gerar JSON:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: t('lookpost.error'),
        description: errorMessage || t('lookpost.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      aria-label={`Baixar JSON da campanha ${campaign.id}`}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && <span className="ml-2">{t('lookpost.generating')}</span>}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {showLabel && <span className="ml-2">{t('lookpost.downloadJson')}</span>}
        </>
      )}
    </Button>
  );
}
