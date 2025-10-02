import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { PublishCampaignDialog } from "@/components/PublishCampaignDialog";
import { BrandSettingsDialog } from "@/components/BrandSettingsDialog";
import { UserNav } from "@/components/UserNav";
import { Campaign } from "@/types/campaign";
import { useTranslation } from "react-i18next";

export default function Campaigns() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaigns, isLoading, deleteCampaign, updateCampaign } = useCampaigns();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredCampaigns = campaigns?.filter((c) => 
    statusFilter === "all" ? true : c.status === statusFilter
  );

  const handlePublish = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = async (publishType: "now" | "schedule", scheduledDate?: Date) => {
    if (!selectedCampaign) return;

    const updateData: Partial<Campaign> = {
      status: publishType === "now" ? "published" : "scheduled",
    };

    if (publishType === "now") {
      updateData.published_at = new Date().toISOString();
    } else if (scheduledDate) {
      updateData.scheduled_at = scheduledDate.toISOString();
    }

    await updateCampaign({ id: selectedCampaign.id, data: updateData });
    setSelectedCampaign(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('campaigns.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('campaigns.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              {t('campaigns.newCampaign')}
            </Button>
            <UserNav onSettingsClick={() => setSettingsOpen(true)} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{t('campaigns.all')}</TabsTrigger>
            <TabsTrigger value="draft">{t('campaigns.draft')}</TabsTrigger>
            <TabsTrigger value="published">{t('campaigns.published')}</TabsTrigger>
            <TabsTrigger value="scheduled">{t('campaigns.scheduled')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
        ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDelete={deleteCampaign}
                onPublish={handlePublish}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all"
                ? t('campaigns.noCampaignsDesc')
                : t('campaigns.noCampaigns')}
            </p>
            <Button onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              {t('campaigns.newCampaign')}
            </Button>
          </div>
        )}
      </main>

      <PublishCampaignDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onPublish={handlePublishConfirm}
      />

      <BrandSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
