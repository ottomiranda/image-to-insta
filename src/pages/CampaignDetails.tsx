import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Copy, Download, Edit, Share2, Trash2 } from "lucide-react";
import { DownloadJsonButton } from "@/components/DownloadJsonButton";
import { JsonViewerDialog } from "@/components/JsonViewerDialog";
import { RevalidateButton } from "@/components/RevalidateButton";
import { CampaignQualityIndicator } from "@/components/CampaignQualityIndicator";
import { toast } from "@/hooks/use-toast";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useState } from "react";
import { PublishCampaignDialog } from "@/components/PublishCampaignDialog";
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

export default function CampaignDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { deleteCampaign } = useCampaigns();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Campaign not found");

      return {
        ...data,
        accessories_images: data.accessories_images || [],
      } as unknown as Campaign;
    },
    enabled: !!campaignId,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!campaignId) return;
    await deleteCampaign(campaignId);
    navigate("/campaigns");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      published: "default",
      scheduled: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Campaign Not Found</CardTitle>
            <CardDescription>The campaign you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Button variant="ghost" onClick={() => navigate("/campaigns")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{campaign.title}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created {new Date(campaign.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <JsonViewerDialog campaign={campaign} variant="outline" />
            <DownloadJsonButton campaign={campaign} variant="outline" />
            {(campaign.brand_compliance_score === 50 && 
              (!campaign.brand_compliance_adjustments || campaign.brand_compliance_adjustments.length === 0)) && (
              <RevalidateButton campaignId={campaign.id} variant="outline" />
            )}
            <Button variant="outline" onClick={() => navigate(`/create/${campaignId}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {campaign.status === "draft" && (
              <Button onClick={() => setShowPublishDialog(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Campaign Quality Indicator */}
        <CampaignQualityIndicator 
          campaign={campaign}
          autoValidate={true}
          compact={false}
        />

        {/* Look Visual */}
        <Card>
          <CardHeader>
            <CardTitle>Look Visual</CardTitle>
            <CardDescription>Generated campaign visual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <img
                src={campaign.look_visual}
                alt="Look Visual"
                className="w-full rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => downloadImage(campaign.look_visual, `${campaign.title}-look.png`)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Centerpiece</h3>
              <img src={campaign.centerpiece_image} alt="Centerpiece" className="w-48 rounded-lg" />
            </div>
            {campaign.model_image && (
              <div>
                <h3 className="font-semibold mb-2">Model</h3>
                <img src={campaign.model_image} alt="Model" className="w-48 rounded-lg" />
              </div>
            )}
            {campaign.accessories_images && campaign.accessories_images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Accessories</h3>
                <div className="flex gap-4 flex-wrap">
                  {campaign.accessories_images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Accessory ${idx + 1}`} className="w-32 rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Descriptions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Short Description</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.short_description, "Short description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{campaign.short_description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Long Description</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.long_description, "Long description")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{campaign.long_description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Instagram Content */}
        <Card>
          <CardHeader>
            <CardTitle>Instagram Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Caption</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.instagram.caption, "Caption")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm">{campaign.instagram.caption}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Hashtags</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.instagram.hashtags.join(" "), "Hashtags")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.instagram.hashtags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Call to Action</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(campaign.instagram.callToAction, "CTA")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm">{campaign.instagram.callToAction}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Alt Text</h3>
              <p className="text-sm text-muted-foreground">{campaign.instagram.altText}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Suggested Time</h3>
              <p className="text-sm text-muted-foreground">{campaign.instagram.suggestedTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PublishCampaignDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onPublish={async (publishType, scheduledDate) => {
          const status = publishType === "now" ? "published" : "scheduled";
          const updateData: Partial<Campaign> = { status };
          if (publishType === "now") {
            updateData.published_at = new Date().toISOString();
          } else if (scheduledDate) {
            updateData.scheduled_at = scheduledDate.toISOString();
          }
          
          await supabase
            .from("campaigns")
            .update(updateData as any)
            .eq("id", campaign.id);
            
          toast({
            title: publishType === "now" ? "Published!" : "Scheduled!",
            description: publishType === "now" 
              ? "Your campaign is now live." 
              : `Campaign scheduled for ${scheduledDate?.toLocaleDateString()}`,
          });
          
          navigate("/campaigns");
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign "{campaign.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
