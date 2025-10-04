import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, BookOpen, PenTool, CheckCircle, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandBookRules } from "@/hooks/useBrandSettings";
import { useTranslation } from "react-i18next";

interface BrandBookSettingsProps {
  brandBookRules: BrandBookRules;
  validationStrictness: 'low' | 'medium' | 'high';
  onUpdate: (rules: BrandBookRules, strictness: 'low' | 'medium' | 'high') => void;
}

export function BrandBookSettings({ 
  brandBookRules, 
  validationStrictness,
  onUpdate 
}: BrandBookSettingsProps) {
  const { t } = useTranslation();
  const [rules, setRules] = useState<BrandBookRules>(brandBookRules);
  const [strictness, setStrictness] = useState(validationStrictness);
  
  // Vocabulary state
  const [preferredWord, setPreferredWord] = useState("");
  const [forbiddenWord, setForbiddenWord] = useState("");
  const [alternativeFrom, setAlternativeFrom] = useState("");
  const [alternativeTo, setAlternativeTo] = useState("");

  const handleAddPreferred = () => {
    if (preferredWord.trim()) {
      const updated = {
        ...rules,
        vocabulary: {
          ...rules.vocabulary,
          preferred: [...rules.vocabulary.preferred, preferredWord.trim()]
        }
      };
      setRules(updated);
      onUpdate(updated, strictness);
      setPreferredWord("");
    }
  };

  const handleRemovePreferred = (word: string) => {
    const updated = {
      ...rules,
      vocabulary: {
        ...rules.vocabulary,
        preferred: rules.vocabulary.preferred.filter(w => w !== word)
      }
    };
    setRules(updated);
    onUpdate(updated, strictness);
  };

  const handleAddForbidden = () => {
    if (forbiddenWord.trim()) {
      const updated = {
        ...rules,
        vocabulary: {
          ...rules.vocabulary,
          forbidden: [...rules.vocabulary.forbidden, forbiddenWord.trim()]
        }
      };
      setRules(updated);
      onUpdate(updated, strictness);
      setForbiddenWord("");
    }
  };

  const handleRemoveForbidden = (word: string) => {
    const updated = {
      ...rules,
      vocabulary: {
        ...rules.vocabulary,
        forbidden: rules.vocabulary.forbidden.filter(w => w !== word)
      }
    };
    setRules(updated);
    onUpdate(updated, strictness);
  };

  const handleAddAlternative = () => {
    if (alternativeFrom.trim() && alternativeTo.trim()) {
      const updated = {
        ...rules,
        vocabulary: {
          ...rules.vocabulary,
          alternatives: {
            ...rules.vocabulary.alternatives,
            [alternativeFrom.trim()]: alternativeTo.trim()
          }
        }
      };
      setRules(updated);
      onUpdate(updated, strictness);
      setAlternativeFrom("");
      setAlternativeTo("");
    }
  };

  const handleRemoveAlternative = (key: string) => {
    const { [key]: removed, ...rest } = rules.vocabulary.alternatives;
    const updated = {
      ...rules,
      vocabulary: {
        ...rules.vocabulary,
        alternatives: rest
      }
    };
    setRules(updated);
    onUpdate(updated, strictness);
  };

  const handleStrictnessChange = (value: 'low' | 'medium' | 'high') => {
    setStrictness(value);
    onUpdate(rules, value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t('brandBook.settings.validationLevel')}</Label>
        <Select value={strictness} onValueChange={handleStrictnessChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">{t('brandBook.settings.validationOptions.low')}</SelectItem>
            <SelectItem value="medium">{t('brandBook.settings.validationOptions.medium')}</SelectItem>
            <SelectItem value="high">{t('brandBook.settings.validationOptions.high')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {strictness === 'high' && t('brandBook.settings.validationDesc.high')}
          {strictness === 'medium' && t('brandBook.settings.validationDesc.medium')}
          {strictness === 'low' && t('brandBook.settings.validationDesc.low')}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Vocabulário */}
        <AccordionItem value="vocabulary">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('brandBook.settings.sections.vocabulary')}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Preferred Words */}
            <div className="space-y-3">
              <Label>{t('brandBook.settings.vocabulary.preferred')}</Label>
              <div className="flex gap-2">
                <Input
                  value={preferredWord}
                  onChange={(e) => setPreferredWord(e.target.value)}
                  placeholder={t('brandBook.settings.vocabulary.preferredPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPreferred())}
                />
                <Button type="button" onClick={handleAddPreferred} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {rules.vocabulary.preferred.map((word) => (
                  <Badge key={word} variant="secondary" className="gap-1">
                    {word}
                    <button onClick={() => handleRemovePreferred(word)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Forbidden Words */}
            <div className="space-y-3">
              <Label>{t('brandBook.settings.vocabulary.forbidden')}</Label>
              <div className="flex gap-2">
                <Input
                  value={forbiddenWord}
                  onChange={(e) => setForbiddenWord(e.target.value)}
                  placeholder={t('brandBook.settings.vocabulary.forbiddenPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddForbidden())}
                />
                <Button type="button" onClick={handleAddForbidden} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {rules.vocabulary.forbidden.map((word) => (
                  <Badge key={word} variant="destructive" className="gap-1">
                    {word}
                    <button onClick={() => handleRemoveForbidden(word)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Alternatives */}
            <div className="space-y-3">
              <Label>{t('brandBook.settings.vocabulary.alternatives')}</Label>
              <div className="flex gap-2">
                <Input
                  value={alternativeFrom}
                  onChange={(e) => setAlternativeFrom(e.target.value)}
                  placeholder={t('brandBook.settings.vocabulary.alternativesFrom')}
                  className="flex-1"
                />
                <span className="flex items-center">→</span>
                <Input
                  value={alternativeTo}
                  onChange={(e) => setAlternativeTo(e.target.value)}
                  placeholder={t('brandBook.settings.vocabulary.alternativesTo')}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddAlternative} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(rules.vocabulary.alternatives).map(([from, to]) => (
                  <div key={from} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{from}</Badge>
                    <span>→</span>
                    <Badge variant="outline">{to}</Badge>
                    <button 
                      onClick={() => handleRemoveAlternative(from)}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estilo de Escrita */}
        <AccordionItem value="style">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              {t('brandBook.settings.sections.writingStyle')}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>{t('brandBook.settings.writingStyle.maxSentence')}</Label>
              <Input
                type="number"
                value={rules.writing_style.max_sentence_length || 20}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    writing_style: {
                      ...rules.writing_style,
                      max_sentence_length: parseInt(e.target.value) || 20
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                min={10}
                max={50}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('brandBook.settings.writingStyle.maxEmojis')}</Label>
              <Input
                type="number"
                value={rules.writing_style.max_emojis_per_post || 3}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    writing_style: {
                      ...rules.writing_style,
                      max_emojis_per_post: parseInt(e.target.value) || 3
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                min={0}
                max={10}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Regras de Conteúdo */}
        <AccordionItem value="content">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('brandBook.settings.sections.contentRules')}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sustainability"
                checked={rules.content_rules?.always_mention_sustainability || false}
                onCheckedChange={(checked) => {
                  const updated = {
                    ...rules,
                    content_rules: {
                      ...rules.content_rules,
                      always_mention_sustainability: checked as boolean,
                      include_brand_hashtag: rules.content_rules?.include_brand_hashtag || false,
                      avoid_superlatives: rules.content_rules?.avoid_superlatives || false
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
              />
              <Label htmlFor="sustainability" className="cursor-pointer">
                {t('brandBook.settings.contentRules.sustainability')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hashtag"
                checked={rules.content_rules?.include_brand_hashtag || false}
                onCheckedChange={(checked) => {
                  const updated = {
                    ...rules,
                    content_rules: {
                      ...rules.content_rules,
                      always_mention_sustainability: rules.content_rules?.always_mention_sustainability || false,
                      include_brand_hashtag: checked as boolean,
                      avoid_superlatives: rules.content_rules?.avoid_superlatives || false
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
              />
              <Label htmlFor="hashtag" className="cursor-pointer">
                {t('brandBook.settings.contentRules.hashtag')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="superlatives"
                checked={rules.content_rules?.avoid_superlatives || false}
                onCheckedChange={(checked) => {
                  const updated = {
                    ...rules,
                    content_rules: {
                      ...rules.content_rules,
                      always_mention_sustainability: rules.content_rules?.always_mention_sustainability || false,
                      include_brand_hashtag: rules.content_rules?.include_brand_hashtag || false,
                      avoid_superlatives: checked as boolean
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
              />
              <Label htmlFor="superlatives" className="cursor-pointer">
                {t('brandBook.settings.contentRules.superlatives')}
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Identidade */}
        <AccordionItem value="identity">
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('brandBook.settings.sections.identity')}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>{t('brandBook.settings.identity.tone')}</Label>
              <Input
                value={rules.identity?.tone_of_voice || ''}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    identity: {
                      ...rules.identity,
                      tone_of_voice: e.target.value,
                      target_market: rules.identity?.target_market || '',
                      preferred_style: rules.identity?.preferred_style || '',
                      brand_values: rules.identity?.brand_values || ''
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                placeholder={t('brandBook.settings.identity.tonePlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('brandBook.settings.identity.market')}</Label>
              <Input
                value={rules.identity?.target_market || ''}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    identity: {
                      ...rules.identity,
                      tone_of_voice: rules.identity?.tone_of_voice || '',
                      target_market: e.target.value,
                      preferred_style: rules.identity?.preferred_style || '',
                      brand_values: rules.identity?.brand_values || ''
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                placeholder={t('brandBook.settings.identity.marketPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('brandBook.settings.identity.style')}</Label>
              <Input
                value={rules.identity?.preferred_style || ''}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    identity: {
                      ...rules.identity,
                      tone_of_voice: rules.identity?.tone_of_voice || '',
                      target_market: rules.identity?.target_market || '',
                      preferred_style: e.target.value,
                      brand_values: rules.identity?.brand_values || ''
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                placeholder={t('brandBook.settings.identity.stylePlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('brandBook.settings.identity.values')}</Label>
              <Input
                value={rules.identity?.brand_values || ''}
                onChange={(e) => {
                  const updated = {
                    ...rules,
                    identity: {
                      ...rules.identity,
                      tone_of_voice: rules.identity?.tone_of_voice || '',
                      target_market: rules.identity?.target_market || '',
                      preferred_style: rules.identity?.preferred_style || '',
                      brand_values: e.target.value
                    }
                  };
                  setRules(updated);
                  onUpdate(updated, strictness);
                }}
                placeholder={t('brandBook.settings.identity.valuesPlaceholder')}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
