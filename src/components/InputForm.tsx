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
import { LogoPositionSelector, LogoPosition } from "./LogoPositionSelector";
import { useBrandSettings } from "@/hooks/useBrandSettings";

// Import product repository images - Dresses
import redBohoDress from "@/assets/repository/products/dresses/red-boho-dress.jpg";
import blackCocktailDress from "@/assets/repository/products/dresses/black-cocktail-dress.jpg";
import navySummerDress from "@/assets/repository/products/dresses/navy-summer-dress.jpg";
import floralMidiDress from "@/assets/repository/products/dresses/floral-midi-dress.jpg";
import whiteLinenDress from "@/assets/repository/products/dresses/white-linen-dress.jpg";
import emeraldEveningGown from "@/assets/repository/products/dresses/emerald-evening-gown.jpg";

// Import product repository images - Accessories
import goldNecklace from "@/assets/repository/products/accessories/gold-necklace.jpg";
import blackHandbag from "@/assets/repository/products/accessories/black-handbag.jpg";
import whiteSneakers from "@/assets/repository/products/accessories/white-sneakers.jpg";
import sunglasses from "@/assets/repository/products/accessories/sunglasses.jpg";
import silverWatch from "@/assets/repository/products/accessories/silver-watch.jpg";
import beigeBelt from "@/assets/repository/products/accessories/beige-belt.jpg";

// Import model repository images
import model1 from "@/assets/repository/models/model-1.jpg";
import model2 from "@/assets/repository/models/model-2.jpg";
import model3 from "@/assets/repository/models/model-3.jpg";
import model4 from "@/assets/repository/models/model-4.jpg";

const PRODUCT_CATEGORIES = {
  dresses: [
    { src: redBohoDress, name: "Red Boho Maxi Dress", alt: "Elegant red boho maxi dress on white background", category: "dresses" },
    { src: blackCocktailDress, name: "Black Cocktail Dress", alt: "Elegant black cocktail dress on white background", category: "dresses" },
    { src: navySummerDress, name: "Navy Summer Dress", alt: "Navy blue summer dress on white background", category: "dresses" },
    { src: floralMidiDress, name: "Floral Midi Dress", alt: "Floral print midi dress on white background", category: "dresses" },
    { src: whiteLinenDress, name: "White Linen Dress", alt: "White linen dress on white background", category: "dresses" },
    { src: emeraldEveningGown, name: "Emerald Evening Gown", alt: "Emerald green evening gown on white background", category: "dresses" },
  ],
  accessories: [
    { src: goldNecklace, name: "Gold Statement Necklace", alt: "Gold statement necklace on white background", category: "accessories" },
    { src: blackHandbag, name: "Black Leather Handbag", alt: "Black leather handbag on white background", category: "accessories" },
    { src: whiteSneakers, name: "White Sneakers", alt: "White sneakers on white background", category: "accessories" },
    { src: sunglasses, name: "Oversized Sunglasses", alt: "Oversized sunglasses on white background", category: "accessories" },
    { src: silverWatch, name: "Silver Watch", alt: "Silver wrist watch on white background", category: "accessories" },
    { src: beigeBelt, name: "Beige Leather Belt", alt: "Beige leather belt on white background", category: "accessories" },
  ]
};

const MODEL_REPOSITORY = [
  { src: model1, name: "Model Sarah", alt: "Professional fashion model portrait" },
  { src: model2, name: "Model Emma", alt: "Elegant fashion model portrait" },
  { src: model3, name: "Model Olivia", alt: "Contemporary fashion model portrait" },
  { src: model4, name: "Model Sophia", alt: "Sophisticated fashion model portrait" },
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

      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: {
          prompt: composedPrompt,
          centerpiece: centerpieceBase64,
          accessories: accessoriesBase64,
          modelImage: modelImageBase64,
          logoConfig,
        }
      });

      if (error) throw error;

      onGenerate(data);
      
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
    <Card className="p-6 space-y-6 h-fit sticky top-24 bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]">
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
            <CameraAngleSelector
              onSelectAngle={setSelectedAngle}
              selectedAngle={selectedAngle}
            />
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
