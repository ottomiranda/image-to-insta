import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wand2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedContent } from "@/pages/Create";
import ImageSelector from "./ImageSelector";
import { useTranslation } from "react-i18next";
import { CameraAngleSelector } from "./CameraAngleSelector";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { LogoPositionSelector, LogoPosition } from "./LogoPositionSelector";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { uploadImageToStorage } from "@/lib/imageUpload";

// Import product repository images - Dresses
import blackCocktailDress from "@/assets/repository/products/dresses/black-cocktail-dress.jpg";
import navySummerDress from "@/assets/repository/products/dresses/navy-summer-dress.jpg";
import floralMidiDress from "@/assets/repository/products/dresses/floral-midi-dress.jpg";
import whiteLinenDress from "@/assets/repository/products/dresses/white-linen-dress.jpg";
import emeraldEveningGown from "@/assets/repository/products/dresses/emerald-evening-gown.jpg";
import burgundySlipDress from "@/assets/repository/products/dresses/burgundy-slip-dress.jpg";
import champagneSequinDress from "@/assets/repository/products/dresses/champagne-sequin-dress.jpg";
import lavenderChiffonDress from "@/assets/repository/products/dresses/lavender-chiffon-dress.jpg";
import mustardShirtDress from "@/assets/repository/products/dresses/mustard-shirt-dress.jpg";
import royalBlueVelvetDress from "@/assets/repository/products/dresses/royal-blue-velvet-dress.jpg";
import creamLaceDress from "@/assets/repository/products/dresses/cream-lace-dress.jpg";
import tealSatinDress from "@/assets/repository/products/dresses/teal-satin-dress.jpg";
import bluePorcelainDress from "@/assets/repository/products/dresses/blue-porcelain-dress.png";
import orangeOmbreGown from "@/assets/repository/products/dresses/orange-ombre-gown.png";
import yellowBowDress from "@/assets/repository/products/dresses/yellow-bow-dress.png";

// Import product repository images - Accessories
import goldNecklace from "@/assets/repository/products/accessories/gold-necklace.jpg";
import blackHandbag from "@/assets/repository/products/accessories/black-handbag.jpg";
import whiteSneakers from "@/assets/repository/products/accessories/white-sneakers.jpg";
import sunglasses from "@/assets/repository/products/accessories/sunglasses.jpg";
import silverWatch from "@/assets/repository/products/accessories/silver-watch.jpg";
import beigeBelt from "@/assets/repository/products/accessories/beige-belt.jpg";
import brownCrossbodyBag from "@/assets/repository/products/accessories/brown-crossbody-bag.jpg";
import pearlEarrings from "@/assets/repository/products/accessories/pearl-earrings.jpg";
import redSilkScarf from "@/assets/repository/products/accessories/red-silk-scarf.jpg";
import blackAnkleBoots from "@/assets/repository/products/accessories/black-ankle-boots.jpg";
import tortoiseHairClip from "@/assets/repository/products/accessories/tortoise-hair-clip.jpg";
import roseGoldBracelet from "@/assets/repository/products/accessories/rose-gold-bracelet.jpg";
import pinkCap from "@/assets/repository/products/accessories/pink-cap.png";
import redSunglasses from "@/assets/repository/products/accessories/red-sunglasses.png";
import blackChainBag from "@/assets/repository/products/accessories/black-chain-bag.png";

// Import model repository images
import model1 from "@/assets/repository/models/model-1.jpg";
import model2 from "@/assets/repository/models/model-2.jpg";
import model3 from "@/assets/repository/models/model-3.jpg";
import model4 from "@/assets/repository/models/model-4.jpg";
import model5 from "@/assets/repository/models/model-5.png";
import model6 from "@/assets/repository/models/model-6.png";
import model7 from "@/assets/repository/models/model-7.png";
import model8 from "@/assets/repository/models/model-8.png";

const PRODUCT_CATEGORIES = {
  dresses: [
    { src: blackCocktailDress, name: "Black Cocktail Dress", alt: "Elegant black cocktail dress on white background", category: "dresses" },
    { src: navySummerDress, name: "Navy Summer Dress", alt: "Navy blue summer dress on white background", category: "dresses" },
    { src: floralMidiDress, name: "Floral Midi Dress", alt: "Floral print midi dress on white background", category: "dresses" },
    { src: whiteLinenDress, name: "White Linen Dress", alt: "White linen dress on white background", category: "dresses" },
    { src: emeraldEveningGown, name: "Emerald Evening Gown", alt: "Emerald green evening gown on white background", category: "dresses" },
    { src: burgundySlipDress, name: "Burgundy Slip Dress", alt: "Burgundy satin slip dress on white background", category: "dresses" },
    { src: champagneSequinDress, name: "Champagne Sequin Dress", alt: "Champagne gold sequin cocktail dress on white background", category: "dresses" },
    { src: lavenderChiffonDress, name: "Lavender Chiffon Dress", alt: "Lavender chiffon A-line dress on white background", category: "dresses" },
    { src: mustardShirtDress, name: "Mustard Shirt Dress", alt: "Mustard yellow shirt dress on white background", category: "dresses" },
    { src: royalBlueVelvetDress, name: "Royal Blue Velvet Dress", alt: "Royal blue velvet midi dress on white background", category: "dresses" },
    { src: creamLaceDress, name: "Cream Lace Dress", alt: "Cream beige lace maxi dress on white background", category: "dresses" },
    { src: tealSatinDress, name: "Teal Satin Dress", alt: "Teal satin midi dress on white background", category: "dresses" },
    { src: bluePorcelainDress, name: "Blue Porcelain Dress", alt: "Blue and white porcelain print dress on white background", category: "dresses" },
    { src: orangeOmbreGown, name: "Orange Ombre Gown", alt: "Orange and black ombre evening gown on white background", category: "dresses" },
    { src: yellowBowDress, name: "Yellow Bow Dress", alt: "Yellow dress with bow detail on white background", category: "dresses" },
  ],
  accessories: [
    { src: goldNecklace, name: "Gold Statement Necklace", alt: "Gold statement necklace on white background", category: "accessories" },
    { src: blackHandbag, name: "Black Leather Handbag", alt: "Black leather handbag on white background", category: "accessories" },
    { src: whiteSneakers, name: "White Sneakers", alt: "White sneakers on white background", category: "accessories" },
    { src: sunglasses, name: "Oversized Sunglasses", alt: "Oversized sunglasses on white background", category: "accessories" },
    { src: silverWatch, name: "Silver Watch", alt: "Silver wrist watch on white background", category: "accessories" },
    { src: beigeBelt, name: "Beige Leather Belt", alt: "Beige leather belt on white background", category: "accessories" },
    { src: brownCrossbodyBag, name: "Brown Crossbody Bag", alt: "Brown leather crossbody bag on white background", category: "accessories" },
    { src: pearlEarrings, name: "Pearl Earrings", alt: "Pearl drop earrings on white background", category: "accessories" },
    { src: redSilkScarf, name: "Red Silk Scarf", alt: "Red silk scarf on white background", category: "accessories" },
    { src: blackAnkleBoots, name: "Black Ankle Boots", alt: "Black ankle boots with heel on white background", category: "accessories" },
    { src: tortoiseHairClip, name: "Tortoise Hair Clip", alt: "Tortoise shell hair clip on white background", category: "accessories" },
    { src: roseGoldBracelet, name: "Rose Gold Bracelet", alt: "Rose gold bracelet on white background", category: "accessories" },
    { src: pinkCap, name: "Pink Cap", alt: "Pink baseball cap on white background", category: "accessories" },
    { src: redSunglasses, name: "Red Sunglasses", alt: "Red framed sunglasses on white background", category: "accessories" },
    { src: blackChainBag, name: "Black Chain Bag", alt: "Black leather bag with gold chain on white background", category: "accessories" },
  ]
};

const MODEL_REPOSITORY = [
  { src: model1, name: "Model Sarah", alt: "Professional fashion model portrait" },
  { src: model2, name: "Model Emma", alt: "Elegant fashion model portrait" },
  { src: model3, name: "Model Olivia", alt: "Contemporary fashion model portrait" },
  { src: model4, name: "Model Sophia", alt: "Sophisticated fashion model portrait" },
  { src: model5, name: "Model Isabella", alt: "Classic fashion model portrait" },
  { src: model6, name: "Model Nia", alt: "Natural beauty fashion model portrait" },
  { src: model7, name: "Model Aria", alt: "Elegant fashion model portrait" },
  { src: model8, name: "Model Luna", alt: "Fresh fashion model portrait" },
];

interface InputFormProps {
  onGenerate: (content: GeneratedContent) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  initialPrompt?: string;
  initialProductSelection?: { centerpiece: string | null; accessories: string[] };
  initialModelImage?: string | null;
}

const InputForm = ({ onGenerate, isGenerating, setIsGenerating, initialPrompt, initialProductSelection, initialModelImage }: InputFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [productSelection, setProductSelection] = useState<{ centerpiece: string | null; accessories: string[] }>({
    centerpiece: null,
    accessories: []
  });
  const [modelImage, setModelImage] = useState<File | string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string | null>("1:1");
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("bottom-right");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { settings } = useBrandSettings();

  // Update state when initial props change
  useEffect(() => {
    if (initialPrompt !== undefined) setPrompt(initialPrompt);
    if (initialProductSelection !== undefined) setProductSelection(initialProductSelection);
    if (initialModelImage !== undefined) setModelImage(initialModelImage);
  }, [initialPrompt, initialProductSelection, initialModelImage]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const imageToBase64 = async (image: File | string): Promise<string> => {
    if (typeof image === "string") {
      // If it's a repository image (imported path), fetch and convert
      const response = await fetch(image);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }
    // If it's a File object
    return convertToBase64(image);
  };

  const handleGenerate = async () => {
    if (!prompt || !productSelection.centerpiece) {
      toast({
        title: t('create.requiredFields'),
        description: t('create.requiredFieldsDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Handle model image upload if it's a File object
      let modelImagePath = modelImage;
      if (modelImage instanceof File) {
        try {
          const uploadedUrl = await uploadImageToStorage(modelImage);
          modelImagePath = uploadedUrl;
        } catch (uploadError) {
          console.error('Error uploading model image:', uploadError);
          toast({
            title: t('create.errorGenerating'),
            description: 'Failed to upload model image',
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
      }

      const centerpieceBase64 = await imageToBase64(productSelection.centerpiece);
      const accessoriesBase64 = await Promise.all(
        productSelection.accessories.map(acc => imageToBase64(acc))
      );
      const modelImageBase64 = modelImage ? await imageToBase64(modelImage) : null;

      // Compose prompt with camera angle if selected
      const composedPrompt = selectedAngle ? `${selectedAngle}: ${prompt}` : prompt;

      // Prepare logo config if logo is included and available
      const logoConfig = includeLogo && settings?.logo_url ? {
        logoUrl: settings.logo_url,
        position: logoPosition,
      } : undefined;

      // Fetch brand settings
      const { data: brandSettings } = await supabase
        .from('brand_settings')
        .select('*')
        .single();

      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: {
          prompt: composedPrompt,
          centerpiece: centerpieceBase64,
          accessories: accessoriesBase64,
          modelImage: modelImageBase64,
          logoConfig,
          aspectRatio: selectedAspectRatio,
          brandSettings,
          centerpieceImagePath: productSelection.centerpiece,
          accessoriesImagePaths: productSelection.accessories,
          modelImagePath: modelImagePath,
        }
      });

      if (error) throw error;

      // Transform snake_case to camelCase for frontend
      const transformedData = {
        ...data,
        brandComplianceScore: data.brand_compliance_score,
        brandComplianceAdjustments: data.brand_compliance_adjustments,
      };

      onGenerate(transformedData);
      
      toast({
        title: t('create.campaignGenerated'),
        description: t('create.campaignGeneratedDesc'),
      });
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast({
        title: t('create.errorGenerating'),
        description: t('create.errorGeneratingDesc'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 h-fit sticky top-24 bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]" data-onboarding="create-form">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">{t('create.title')}</h2>
        <p className="text-gray-400">
          {t('create.description')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-gray-300">{t('create.lookDescription')} *</Label>
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-2">
              <CameraAngleSelector
                onSelectAngle={setSelectedAngle}
                selectedAngle={selectedAngle}
              />
              <AspectRatioSelector
                onSelectRatio={setSelectedAspectRatio}
                selectedRatio={selectedAspectRatio}
              />
            </div>
            <div className="flex-1 relative">
              {selectedAngle && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-white">{selectedAngle}</span>
                  <button
                    onClick={() => setSelectedAngle(null)}
                    className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
                    aria-label="Remove angle"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <Textarea
                id="prompt"
                placeholder={t('create.lookDescriptionPlaceholder')}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`min-h-[120px] resize-none ${selectedAngle ? 'pt-10' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <ImageSelector
          label={t('create.productSelection')}
          value={productSelection}
          onChange={(value) => {
            if (value && typeof value === 'object' && 'centerpiece' in value) {
              setProductSelection(value as { centerpiece: string | null; accessories: string[] });
            }
          }}
          required
          productCategories={PRODUCT_CATEGORIES}
          repositoryTitle={t('create.selectProducts')}
          showCategories={true}
          multiSelect={true}
        />

        {/* Model Image Selector */}
        <ImageSelector
          label={t('create.modelImage')}
          value={modelImage}
          onChange={(value) => {
            if (value && typeof value === 'object' && 'centerpiece' in value) {
              // Ignore multi-select for model selector
              return;
            }
            setModelImage(value as File | string | null);
          }}
          modelRepository={MODEL_REPOSITORY}
          repositoryTitle={t('create.selectModel')}
          showCategories={false}
        />

        {/* Logo Position Selector */}
        <LogoPositionSelector
          includeLogo={includeLogo}
          onIncludeLogoChange={setIncludeLogo}
          logoPosition={logoPosition}
          onLogoPositionChange={setLogoPosition}
          hasLogo={!!settings?.logo_url}
        />

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all"
          size="lg"
          data-onboarding="generate-btn"
        >
          {isGenerating ? (
            <>
              <Wand2 className="mr-2 h-5 w-5 animate-spin" />
              {t('create.generatingCampaign')}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              {t('create.generateCampaign')}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default InputForm;
