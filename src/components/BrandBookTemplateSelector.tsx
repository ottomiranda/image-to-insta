import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandBookTemplate, BRAND_BOOK_TEMPLATES } from "@/lib/brandBookTemplates";
import { BrandBookRules } from "@/hooks/useBrandSettings";
import { Crown, Leaf, Zap, ShoppingBag, Sparkles, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const getTemplateIcon = (category: string) => {
  const icons = {
    luxury: Crown,
    sustainable: Leaf,
    streetwear: Zap,
    casual: ShoppingBag,
    minimal: Sparkles,
  };
  return icons[category as keyof typeof icons] || Sparkles;
};

interface BrandBookTemplateSelectorProps {
  onApplyTemplate: (rules: BrandBookRules, strictness: 'low' | 'medium' | 'high') => void;
  currentRules?: BrandBookRules;
}

export function BrandBookTemplateSelector({ onApplyTemplate, currentRules }: BrandBookTemplateSelectorProps) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BrandBookTemplate | null>(null);

  const handleApplyTemplate = (template: BrandBookTemplate) => {
    onApplyTemplate(template.rules, template.strictness);
    setSelectedTemplate(template.name);
  };

  const isTemplateApplied = (template: BrandBookTemplate) => {
    if (!currentRules) return false;
    return JSON.stringify(template.rules) === JSON.stringify(currentRules);
  };

  const getStrictnessLabel = (level: 'low' | 'medium' | 'high') => {
    return t(`brandBook.templates.strictness.${level}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">{t('brandBook.templates.title')}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t('brandBook.templates.description')}
        </p>
      </div>

      <ScrollArea className="h-[340px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
        {BRAND_BOOK_TEMPLATES.map((template) => {
          const Icon = getTemplateIcon(template.category);
          const isApplied = isTemplateApplied(template);

          return (
            <Card key={template.id} className={`hover:border-primary/50 transition-colors ${isApplied ? 'border-primary' : ''}`}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{t(`templates.${template.category}.name`)}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-1">
                      {template.category}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {t(`templates.${template.category}.description`)}
                </p>
                
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span className="font-medium">{t('brandBook.templates.rigor')}:</span>
                    <Badge variant="outline" className="h-5 text-xs px-1.5">
                      {getStrictnessLabel(template.strictness)}
                    </Badge>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        {t('brandBook.templates.preview')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          {previewTemplate?.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        {previewTemplate?.rules.vocabulary.preferred && previewTemplate.rules.vocabulary.preferred.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.preferredWords')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {previewTemplate.rules.vocabulary.preferred.map((word, idx) => (
                                <Badge key={idx} variant="secondary">{word}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {previewTemplate?.rules.vocabulary.forbidden && previewTemplate.rules.vocabulary.forbidden.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.forbiddenWords')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {previewTemplate.rules.vocabulary.forbidden.map((word, idx) => (
                                <Badge key={idx} variant="destructive">{word}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {previewTemplate?.rules.vocabulary.alternatives && Object.keys(previewTemplate.rules.vocabulary.alternatives).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.alternatives')}</h4>
                            <div className="space-y-1">
                              {Object.entries(previewTemplate.rules.vocabulary.alternatives).map(([from, to], idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="line-through text-muted-foreground">{from}</span>
                                  {" → "}
                                  <span className="font-medium">{to}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {previewTemplate && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.writingRules')}</h4>
                            <div className="space-y-1 text-sm">
                              <div>{t('brandBook.preview.maxSentence')}: {previewTemplate.rules.writing_style.max_sentence_length} {t('brandBook.preview.words')}</div>
                              <div>{t('brandBook.preview.emojis')}: {previewTemplate.rules.writing_style.use_emojis ? `${t('brandBook.preview.allowed')} (${t('brandBook.preview.max')} ${previewTemplate.rules.writing_style.max_emojis_per_post})` : t('brandBook.preview.notAllowed')}</div>
                              <div>{t('brandBook.preview.cta')}: {previewTemplate.rules.writing_style.call_to_action_required ? t('brandBook.preview.required') : t('brandBook.preview.optional')}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  size="sm"
                  variant={isApplied ? "outline" : "default"}
                  className="w-full h-7 text-xs"
                  onClick={() => handleApplyTemplate(template)}
                  disabled={isApplied}
                >
                  {isApplied ? t('brandBook.templates.applied') : t('brandBook.templates.apply')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </ScrollArea>
    </div>
  );
}
