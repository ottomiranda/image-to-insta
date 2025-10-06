import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRevalidateCampaign } from "@/hooks/useRevalidateCampaign";
import { useTranslation } from "react-i18next";

interface RevalidateButtonProps {
  campaignId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function RevalidateButton({ 
  campaignId, 
  variant = "outline", 
  size = "sm",
  showLabel = true 
}: RevalidateButtonProps) {
  const { revalidate, isRevalidating } = useRevalidateCampaign();
  const { t } = useTranslation();

  const handleRevalidate = async () => {
    await revalidate(campaignId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRevalidate}
      disabled={isRevalidating}
      aria-label={`Revalidar campanha ${campaignId}`}
    >
      <RefreshCw className={`h-4 w-4 ${isRevalidating ? 'animate-spin' : ''}`} />
      {showLabel && <span className="ml-2">{t('brandCompliance.revalidate')}</span>}
    </Button>
  );
}
