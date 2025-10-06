import { Campaign } from "@/types/campaign";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Copy, Trash2, Send, Pencil, Download } from "lucide-react";
import { DownloadJsonButton } from "./DownloadJsonButton";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { enUS, ptBR } from "date-fns/locale";
import { CampaignQualityIndicator } from "./CampaignQualityIndicator";

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onPublish: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onDelete, onPublish }: CampaignCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getStatusBadge = () => {
    switch (campaign.status) {
      case "published":
        return <Badge variant="default">{t('campaigns.published')}</Badge>;
      case "scheduled":
        return <Badge variant="scheduled">{t('campaigns.scheduled')}</Badge>;
      default:
        return <Badge variant="overlay">{t('campaigns.draft')}</Badge>;
    }
  };

  const getTimestamp = () => {
    const locale = i18n.language === 'pt' ? ptBR : enUS;
    
    if (campaign.published_at) {
      return t('campaigns.publishedAt', { 
        time: formatDistanceToNow(new Date(campaign.published_at), { addSuffix: true, locale })
      });
    }
    if (campaign.scheduled_at) {
      return t('campaigns.scheduledFor', { 
        date: new Date(campaign.scheduled_at).toLocaleDateString()
      });
    }
    return formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true, locale });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={campaign.look_visual}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {/* Badge de status posicionado no canto superior direito da foto */}
          <div className="absolute top-2 right-2 z-10">
            {getStatusBadge()}
          </div>
          {/* Badge de qualidade posicionado no canto inferior direito da foto */}
          <div className="absolute bottom-2 right-2 z-10">
            <CampaignQualityIndicator 
              campaign={campaign} 
              autoValidate={false}
              compact={true}
            />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
              <h3 className="font-semibold truncate hover:text-primary transition-colors mb-2">{campaign.title}</h3>
              {/* Timestamp */}
              <p className="text-sm text-muted-foreground">{getTimestamp()}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/create/${campaign.id}?mode=edit`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('campaigns.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/create/${campaign.id}`)}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('campaigns.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <DownloadJsonButton 
                      campaign={campaign} 
                      variant="ghost" 
                      size="sm"
                      showLabel={true}
                      className="w-full justify-start p-0 h-auto font-normal"
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPublish(campaign)}>
                  <Send className="mr-2 h-4 w-4" />
                  {t('campaigns.publish')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('campaigns.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('campaigns.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('campaigns.deleteConfirmDesc', { title: campaign.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('campaigns.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(campaign.id)}>
              {t('campaigns.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
