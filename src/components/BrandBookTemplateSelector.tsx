import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEMPLATE_CATEGORIES, getTemplateRulesData } from "@/lib/brandBookTemplates";
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
  const { t } = useTranslation(['translation', 'templates']);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewCategory, setPreviewCategory] = useState<string | null>(null);

  const getTemplateRules = (category: string): BrandBookRules => {
    const vocab = t(`templates.${category}.vocabulary`, { returnObjects: true, ns: 'templates' }) as any;
    const identity = t(`templates.${category}.identity`, { returnObjects: true, ns: 'templates' }) as any;
    
    // Writing style rules based on category
    const writingStyles: Record<string, any> = {
      luxury: {
        max_sentence_length: 18,
        use_emojis: false,
        max_emojis_per_post: 1,
        call_to_action_required: false
      },
      sustainable: {
        max_sentence_length: 22,
        use_emojis: true,
        max_emojis_per_post: 3,
        call_to_action_required: true
      },
      streetwear: {
        max_sentence_length: 25,
        use_emojis: true,
        max_emojis_per_post: 5,
        call_to_action_required: true
      },
      casual: {
        max_sentence_length: 20,
        use_emojis: true,
        max_emojis_per_post: 4,
        call_to_action_required: true
      },
      minimal: {
        max_sentence_length: 15,
        use_emojis: false,
        max_emojis_per_post: 2,
        call_to_action_required: false
      }
    };

    // Content rules based on category
    const contentRules: Record<string, any> = {
      luxury: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      sustainable: {
        always_mention_sustainability: true,
        include_brand_hashtag: true,
        avoid_superlatives: true
      },
      streetwear: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      casual: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: false
      },
      minimal: {
        always_mention_sustainability: false,
        include_brand_hashtag: true,
        avoid_superlatives: true
      }
    };

    return {
      vocabulary: {
        preferred: vocab.preferred || [],
        forbidden: vocab.forbidden || [],
        alternatives: vocab.alternatives || {}
      },
      writing_style: writingStyles[category],
      content_rules: contentRules[category],
      identity: {
        tone_of_voice: identity.tone || '',
        target_market: identity.market || '',
        preferred_style: identity.style || '',
        brand_values: identity.values || ''
      }
    };
  };

  const handleApplyTemplate = (category: typeof TEMPLATE_CATEGORIES[number]) => {
    const templateData = getTemplateRulesData(category);
    const rules = getTemplateRules(category);
    onApplyTemplate(rules, templateData.strictness);
    setSelectedTemplate(category);
  };

  const isTemplateApplied = (category: string) => {
    if (!currentRules) return false;
    const rules = getTemplateRules(category);
    return JSON.stringify(rules) === JSON.stringify(currentRules);
  };

  const getStrictnessLabel = (level: 'low' | 'medium' | 'high') => {
    return t(`templates.strictness.${level}`, { ns: 'templates' });
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
        {TEMPLATE_CATEGORIES.map((category) => {
          const Icon = getTemplateIcon(category);
          const templateData = getTemplateRulesData(category);
          const isApplied = isTemplateApplied(category);

          return (
            <Card key={category} className={`hover:border-primary/50 transition-colors ${isApplied ? 'border-primary' : ''}`}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{t(`templates.${category}.name`, { ns: 'templates' })}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-2">
                      {t(`templates.${category}.description`, { ns: 'templates' })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span className="font-medium">{t('brandBook.templates.rigor')}:</span>
                    <Badge variant="outline" className="h-5 text-xs px-1.5">
                      {getStrictnessLabel(templateData.strictness)}
                    </Badge>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setPreviewCategory(category)}
                      >
                        {t('brandBook.templates.preview')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          {t(`templates.${previewCategory}.name`, { ns: 'templates' })}
                        </DialogTitle>
                      </DialogHeader>
                      
                      {previewCategory && (
                        <div className="space-y-4 mt-4">
                          {(() => {
                            const rules = getTemplateRules(previewCategory);
                            return (
                              <>
                                {rules.vocabulary.preferred && rules.vocabulary.preferred.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.preferredWords')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {rules.vocabulary.preferred.map((word, idx) => (
                                        <Badge key={idx} variant="secondary">{word}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {rules.vocabulary.forbidden && rules.vocabulary.forbidden.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.forbiddenWords')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {rules.vocabulary.forbidden.map((word, idx) => (
                                        <Badge key={idx} variant="destructive">{word}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {rules.vocabulary.alternatives && Object.keys(rules.vocabulary.alternatives).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.alternatives')}</h4>
                                    <div className="space-y-1">
                                      {Object.entries(rules.vocabulary.alternatives).map(([from, to], idx) => (
                                        <div key={idx} className="text-sm">
                                          <span className="line-through text-muted-foreground">{from}</span>
                                          {" → "}
                                          <span className="font-medium">{to}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-sm font-semibold mb-2">{t('brandBook.preview.writingRules')}</h4>
                                  <div className="space-y-1 text-sm">
                                    <div>{t('brandBook.preview.maxSentence')}: {rules.writing_style.max_sentence_length} {t('brandBook.preview.words')}</div>
                                    <div>{t('brandBook.preview.emojis')}: {rules.writing_style.use_emojis ? `${t('brandBook.preview.allowed')} (${t('brandBook.preview.max')} ${rules.writing_style.max_emojis_per_post})` : t('brandBook.preview.notAllowed')}</div>
                                    <div>{t('brandBook.preview.cta')}: {rules.writing_style.call_to_action_required ? t('brandBook.preview.required') : t('brandBook.preview.optional')}</div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-2">{t('brandBook.settings.sections.identity')}</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">{t('brandBook.settings.identity.tone')}:</span> {rules.identity.tone_of_voice}
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('brandBook.settings.identity.market')}:</span> {rules.identity.target_market}
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('brandBook.settings.identity.style')}:</span> {rules.identity.preferred_style}
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('brandBook.settings.identity.values')}:</span> {rules.identity.brand_values}
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  size="sm"
                  variant={isApplied ? "outline" : "default"}
                  className="w-full h-7 text-xs"
                  onClick={() => handleApplyTemplate(category)}
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
