import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { downloadCampaignJson } from "@/lib/lookpost";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
      // Simular delay mínimo para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      downloadCampaignJson(campaign);
      
      toast({
        title: t('lookpost.success'),
        description: t('lookpost.successDesc'),
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
