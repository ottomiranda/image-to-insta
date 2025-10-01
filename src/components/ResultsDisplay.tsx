import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Image as ImageIcon, FileText, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@/pages/Index";

interface ResultsDisplayProps {
  content: GeneratedContent;
}

const ResultsDisplay = ({ content }: ResultsDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = content.lookVisual;
    link.download = 'look-gerado.png';
    link.click();
    toast({
      title: "Download iniciado",
      description: "A imagem está sendo baixada.",
    });
  };

  const exportJSON = () => {
    const jsonData = {
      look_visual: content.lookVisual,
      descricao_curta: content.shortDescription,
      descricao_longa: content.longDescription,
      instagram: {
        legenda: content.instagram.caption,
        hashtags: content.instagram.hashtags,
        call_to_action: content.instagram.callToAction,
        alt_text: content.instagram.altText,
        horario_sugerido: content.instagram.suggestedTime,
      }
    };
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campanha-completa.json';
    link.click();
    
    toast({
      title: "JSON exportado",
      description: "Os dados foram exportados com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resultados</h2>
        <Button onClick={exportJSON} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar JSON
        </Button>
      </div>

      {/* Look Visual */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Look Visual</h3>
          </div>
          <Button onClick={downloadImage} variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <img 
            src={content.lookVisual} 
            alt="Look gerado"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </Card>

      {/* Product Descriptions */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Descrições do Produto</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">Curta</Badge>
              <Button
                onClick={() => copyToClipboard(content.shortDescription, "Descrição curta")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md">{content.shortDescription}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">Longa</Badge>
              <Button
                onClick={() => copyToClipboard(content.longDescription, "Descrição longa")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md">{content.longDescription}</p>
          </div>
        </div>
      </Card>

      {/* Instagram Post */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Post para Instagram</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Legenda</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.caption, "Legenda")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
              {content.instagram.caption}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Hashtags</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.hashtags.join(' '), "Hashtags")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.instagram.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Call to Action</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.callToAction, "CTA")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md">{content.instagram.callToAction}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Alt Text</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.altText, "Alt text")}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md">{content.instagram.altText}</p>
          </div>

          <div>
            <span className="text-sm font-medium">Horário Sugerido</span>
            <p className="text-lg font-semibold text-primary mt-1">{content.instagram.suggestedTime}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
