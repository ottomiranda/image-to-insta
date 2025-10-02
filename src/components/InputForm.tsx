import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedContent } from "@/pages/Index";
import ImageSelector from "./ImageSelector";

// Import product repository images
import redBohoDress from "@/assets/repository/products/red-boho-dress.jpg";
import goldNecklace from "@/assets/repository/products/gold-necklace.jpg";
import denimJacket from "@/assets/repository/products/denim-jacket.jpg";
import blackHandbag from "@/assets/repository/products/black-handbag.jpg";
import whiteSneakers from "@/assets/repository/products/white-sneakers.jpg";
import sunglasses from "@/assets/repository/products/sunglasses.jpg";

// Import model repository images
import model1 from "@/assets/repository/models/model-1.jpg";
import model2 from "@/assets/repository/models/model-2.jpg";
import model3 from "@/assets/repository/models/model-3.jpg";
import model4 from "@/assets/repository/models/model-4.jpg";

const PRODUCT_REPOSITORY = [
  { src: redBohoDress, name: "Red Boho Dress", alt: "Elegant red boho maxi dress" },
  { src: goldNecklace, name: "Gold Necklace", alt: "Luxurious gold statement necklace" },
  { src: denimJacket, name: "Denim Jacket", alt: "Classic denim jacket" },
  { src: blackHandbag, name: "Black Handbag", alt: "Elegant black leather handbag" },
  { src: whiteSneakers, name: "White Sneakers", alt: "White sneakers" },
  { src: sunglasses, name: "Sunglasses", alt: "Oversized sunglasses" },
];

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
}

const InputForm = ({ onGenerate, isGenerating, setIsGenerating }: InputFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | string | null>(null);
  const [modelImage, setModelImage] = useState<File | string | null>(null);
  const { toast } = useToast();

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
    if (!prompt || !productImage) {
      toast({
        title: "Required fields",
        description: "Please fill in the prompt and upload the product image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const productImageBase64 = await imageToBase64(productImage);
      const modelImageBase64 = modelImage ? await imageToBase64(modelImage) : null;

      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: {
          prompt,
          productImage: productImageBase64,
          modelImage: modelImageBase64,
        }
      });

      if (error) throw error;

      onGenerate(data);
      
      toast({
        title: "Campaign generated!",
        description: "Your fashion campaign was created successfully.",
      });
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast({
        title: "Error generating campaign",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 h-fit sticky top-24 bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
        <p className="text-gray-400">
          Describe your look and upload images to generate a complete campaign
        </p>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-gray-300">Look Description *</Label>
          <Textarea
            id="prompt"
            placeholder="E.g.: Create a casual summer look using our red boho dress as the centerpiece for an outdoor brunch"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Product Image Selector */}
        <ImageSelector
          label="Product Image"
          value={productImage}
          onChange={setProductImage}
          required
          repository={PRODUCT_REPOSITORY}
          repositoryTitle="Select Product from Campaign Repository"
        />

        {/* Model Image Selector */}
        <ImageSelector
          label="Model Image"
          value={modelImage}
          onChange={setModelImage}
          repository={MODEL_REPOSITORY}
          repositoryTitle="Select Model from Campaign Repository"
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
              Generating campaign...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Campaign
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default InputForm;
