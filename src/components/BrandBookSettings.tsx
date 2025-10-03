import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandBookRules } from "@/hooks/useBrandSettings";

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
        <Label>Nível de Rigor na Validação</Label>
        <Select value={strictness} onValueChange={handleStrictnessChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixo - Sugestões leves</SelectItem>
            <SelectItem value="medium">Médio - Equilíbrio (Recomendado)</SelectItem>
            <SelectItem value="high">Alto - Validação rigorosa</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {strictness === 'high' && "Validação rigorosa: penalidades maiores para violações"}
          {strictness === 'medium' && "Validação equilibrada: ideal para maioria dos casos"}
          {strictness === 'low' && "Validação suave: aceita mais variações"}
        </p>
      </div>

      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vocabulary">Vocabulário</TabsTrigger>
          <TabsTrigger value="style">Estilo de Escrita</TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-6 mt-4">
          {/* Preferred Words */}
          <div className="space-y-3">
            <Label>Palavras Preferidas</Label>
            <div className="flex gap-2">
              <Input
                value={preferredWord}
                onChange={(e) => setPreferredWord(e.target.value)}
                placeholder="Ex: sustentável, elegante"
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
            <Label>Palavras Proibidas</Label>
            <div className="flex gap-2">
              <Input
                value={forbiddenWord}
                onChange={(e) => setForbiddenWord(e.target.value)}
                placeholder="Ex: barato, comum"
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
            <Label>Substituições Automáticas</Label>
            <div className="flex gap-2">
              <Input
                value={alternativeFrom}
                onChange={(e) => setAlternativeFrom(e.target.value)}
                placeholder="De: barato"
                className="flex-1"
              />
              <span className="flex items-center">→</span>
              <Input
                value={alternativeTo}
                onChange={(e) => setAlternativeTo(e.target.value)}
                placeholder="Para: acessível"
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
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-4">
          <div className="space-y-3">
            <Label>Comprimento Máximo de Frase</Label>
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
            <Label>Máximo de Emojis por Post</Label>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
