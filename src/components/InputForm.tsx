import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedContent } from "@/pages/Index";

interface InputFormProps {
  onGenerate: (content: GeneratedContent) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const InputForm = ({ onGenerate, isGenerating, setIsGenerating }: InputFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const handleModelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelImage(e.target.files[0]);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!prompt || !productImage) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o prompt e faça upload da imagem do produto.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const productImageBase64 = await convertToBase64(productImage);
      const modelImageBase64 = modelImage ? await convertToBase64(modelImage) : null;

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
        title: "Campanha gerada!",
        description: "Sua campanha de moda foi criada com sucesso.",
      });
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast({
        title: "Erro ao gerar campanha",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 h-fit sticky top-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Criar Campanha</h2>
        <p className="text-muted-foreground">
          Descreva seu look e faça upload das imagens para gerar uma campanha completa
        </p>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Descrição do Look *</Label>
          <Textarea
            id="prompt"
            placeholder="Ex: Criar look de verão casual usando nosso vestido vermelho boho como peça central para um brunch ao ar livre"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Product Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="product-image">Imagem do Produto *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleProductImageChange}
              className="hidden"
            />
            <label htmlFor="product-image" className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {productImage ? productImage.name : "Clique para fazer upload"}
              </span>
            </label>
          </div>
        </div>

        {/* Model Image Upload (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="model-image">Imagem da Modelo (Opcional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <input
              id="model-image"
              type="file"
              accept="image/*"
              onChange={handleModelImageChange}
              className="hidden"
            />
            <label htmlFor="model-image" className="flex flex-col items-center gap-2 cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {modelImage ? modelImage.name : "Clique para fazer upload"}
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Wand2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando campanha...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Gerar Campanha
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default InputForm;
