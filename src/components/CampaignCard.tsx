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
import { MoreVertical, Copy, Trash2, Send, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { enUS, ptBR } from "date-fns/locale";
import { BrandComplianceIndicator } from "./BrandComplianceIndicator";

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
        return <Badge variant="secondary">{t('campaigns.scheduled')}</Badge>;
      default:
        return <Badge variant="outline">{t('campaigns.draft')}</Badge>;
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
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold truncate">{campaign.title}</h3>
              <p className="text-sm text-muted-foreground">{getTimestamp()}</p>
              {campaign.brand_compliance_score !== undefined && (
                <div className="mt-2">
                  <BrandComplianceIndicator
                    score={campaign.brand_compliance_score}
                    adjustments={campaign.brand_compliance_adjustments}
                    compact={true}
                  />
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
          {getStatusBadge()}
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
