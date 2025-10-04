import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from "lucide-react";
import { BRAND_BOOK_TEMPLATES, BrandBookTemplate } from "@/lib/brandBookTemplates";
import { BrandBookRules } from "@/hooks/useBrandSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BrandBookTemplateSelectorProps {
  onApplyTemplate: (rules: BrandBookRules, strictness: 'low' | 'medium' | 'high') => void;
  currentRules?: BrandBookRules;
}

export function BrandBookTemplateSelector({ onApplyTemplate, currentRules }: BrandBookTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BrandBookTemplate | null>(null);

  const handleApplyTemplate = (template: BrandBookTemplate) => {
    setSelectedTemplate(template.id);
    onApplyTemplate(template.rules, template.strictness);
  };

  const getCategoryColor = (category: BrandBookTemplate['category']) => {
    const colors = {
      luxury: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      sustainable: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      streetwear: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      casual: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      minimal: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[category];
  };

  const getStrictnessLabel = (strictness: 'low' | 'medium' | 'high') => {
    const labels = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto'
    };
    return labels[strictness];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Templates de Brand Book</h3>
          <p className="text-xs text-muted-foreground">
            Escolha um template pré-configurado ou personalize suas próprias regras
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-2">
        {BRAND_BOOK_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`relative cursor-pointer transition-all hover:border-primary/50 ${
              selectedTemplate === template.id ? 'border-primary' : ''
            }`}
          >
            <CardHeader className="pb-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{template.icon}</span>
                  <div className="min-w-0">
                    <CardTitle className="text-sm leading-tight">{template.name}</CardTitle>
                    <Badge variant="outline" className={`mt-1 text-[10px] h-4 ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </Badge>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-0.5 flex-shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <CardDescription className="text-xs line-clamp-2">
                {template.description}
              </CardDescription>
              
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground text-[10px]">
                  Rigor: <span className="font-medium text-foreground">{getStrictnessLabel(template.strictness)}</span>
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Info className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        {template.name}
                      </DialogTitle>
                      <DialogDescription>{template.description}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Palavras Preferidas</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.rules.vocabulary.preferred.map((word) => (
                              <Badge key={word} variant="secondary">{word}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Palavras Proibidas</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.rules.vocabulary.forbidden.map((word) => (
                              <Badge key={word} variant="destructive">{word}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Substituições Automáticas</h4>
                          <div className="space-y-1">
                            {Object.entries(template.rules.vocabulary.alternatives).map(([from, to]) => (
                              <div key={from} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{from}</Badge>
                                <span>→</span>
                                <Badge variant="outline">{to}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Regras de Escrita</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Comprimento máximo de frase: {template.rules.writing_style.max_sentence_length} palavras</li>
                            <li>• Emojis: {template.rules.writing_style.use_emojis ? 'Permitidos' : 'Não permitidos'} (máx: {template.rules.writing_style.max_emojis_per_post})</li>
                            <li>• Call-to-action: {template.rules.writing_style.call_to_action_required ? 'Obrigatório' : 'Opcional'}</li>
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                onClick={() => handleApplyTemplate(template)}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="w-full h-7 text-xs"
                size="sm"
              >
                {selectedTemplate === template.id ? 'Aplicado' : 'Aplicar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
