import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Settings, ArrowLeft, Save } from "lucide-react";
import InputForm from "@/components/InputForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import BrandSettingsDialog from "@/components/BrandSettingsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface GeneratedContent {
  lookVisual: string;
  imageAnalysis?: {
    mainPiece: string;
    colors: string;
    styleAesthetic: string;
    accessories: string;
  };
  shortDescription: string;
  longDescription: string;
  instagram: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    altText: string;
    suggestedTime: string;
  };
}

const Create = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { saveCampaign, updateCampaign } = useCampaigns();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [productSelection, setProductSelection] = useState<any>(null);
  const [modelImage, setModelImage] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isEditMode = searchParams.get("mode") === "edit";

  // Load campaign data if editing or duplicating
  useEffect(() => {
    if (campaignId) {
      const loadCampaign = async () => {
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .single();

        if (error) {
          toast({
            title: "Error loading campaign",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Set title based on mode
          setTitle(isEditMode ? data.title : `${data.title} (Copy)`);
          setPrompt(data.prompt);
          
          // Reconstruct product selection
          setProductSelection({
            centerpiece: data.centerpiece_image,
            accessories: data.accessories_images || []
          });
          
          // Set model image if exists
          if (data.model_image) {
            setModelImage(data.model_image);
          }
          
          // Restore generated content only in edit mode
          if (isEditMode) {
            setGeneratedContent({
              lookVisual: data.look_visual,
              imageAnalysis: data.image_analysis as any,
              shortDescription: data.short_description,
              longDescription: data.long_description,
              instagram: data.instagram as any,
            });
          }
        }
      };
      loadCampaign();
    }
  }, [campaignId, isEditMode, toast]);

  const handleSaveCampaign = async () => {
    if (!title) {
      toast({
        title: "Missing information",
        description: "Please add a title.",
        variant: "destructive",
      });
      return;
    }

    // In edit mode, allow saving without re-generating
    // In duplicate/create mode, require generated content
    if (!isEditMode && !generatedContent) {
      toast({
        title: "Missing information",
        description: "Please generate content first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const campaignData = {
        title,
        prompt,
        status: "draft" as const,
        centerpiece_image: productSelection?.centerpiece || "",
        accessories_images: productSelection?.accessories || [],
        model_image: modelImage,
        look_visual: generatedContent?.lookVisual || "",
        image_analysis: generatedContent?.imageAnalysis,
        short_description: generatedContent?.shortDescription || "",
        long_description: generatedContent?.longDescription || "",
        instagram: generatedContent?.instagram || { caption: "", hashtags: [], callToAction: "", altText: "", suggestedTime: "" },
      };

      if (isEditMode && campaignId) {
        await updateCampaign({ id: campaignId, data: campaignData });
        toast({
          title: "Campaign updated",
          description: "Your campaign has been updated successfully.",
        });
      } else {
        await saveCampaign(campaignData);
        toast({
          title: "Campaign saved",
          description: "Your campaign has been saved successfully.",
        });
      }
      navigate("/campaigns");
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/campaigns")}
                className="hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                  {isEditMode ? "Edit Campaign" : campaignId ? "Duplicate Campaign" : "Create Campaign"}
                </h1>
                <p className="text-xs text-gray-400">AI-powered fashion marketing pipeline</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="hover:bg-white/10"
              >
                <Settings className="h-5 w-5" />
              </Button>
              {(generatedContent || isEditMode) && (
                <Button
                  onClick={handleSaveCampaign}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Campaign" : "Save Campaign"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <BrandSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Label htmlFor="campaign-title">Campaign Title *</Label>
          <Input
            id="campaign-title"
            placeholder="Enter campaign title (e.g., Summer Collection 2024)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <InputForm 
            onGenerate={(content) => {
              setGeneratedContent(content);
            }}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            initialPrompt={prompt}
            initialProductSelection={productSelection}
            initialModelImage={modelImage}
          />
          {generatedContent && (
            <ResultsDisplay content={generatedContent} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Create;
