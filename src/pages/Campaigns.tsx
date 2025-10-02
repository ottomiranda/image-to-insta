import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { PublishCampaignDialog } from "@/components/PublishCampaignDialog";
import BrandSettingsDialog from "@/components/BrandSettingsDialog";
import { Campaign } from "@/types/campaign";

export default function Campaigns() {
  const navigate = useNavigate();
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
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-sm text-muted-foreground">Manage your fashion marketing campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
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
                ? "No campaigns yet. Create your first campaign!"
                : `No ${statusFilter} campaigns found.`}
            </p>
            <Button onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
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
