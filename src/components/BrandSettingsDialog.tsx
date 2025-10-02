import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ColorPicker from "./ColorPicker";
import { useBrandSettings, BrandSettings } from "@/hooks/useBrandSettings";
import {
  TONE_OF_VOICE_OPTIONS,
  TARGET_MARKET_OPTIONS,
  PREFERRED_STYLE_OPTIONS,
  DEFAULT_BRAND_SETTINGS,
} from "@/lib/brandDefaults";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const createBrandSettingsSchema = (t: any) => z.object({
  brand_name: z.string().min(1, t('brandSettings.brandName')).max(100),
  instagram_handle: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  brand_values: z.string().min(10, "Descreva os valores da sua marca (mínimo 10 caracteres)"),
  tone_of_voice: z.string().min(1, "Selecione um tom de voz"),
  target_market: z.string().min(1, "Selecione um mercado-alvo"),
  preferred_style: z.string().min(1, "Selecione um estilo"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária inválida"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor secundária inválida"),
  preferred_keywords: z.string().optional(),
  words_to_avoid: z.string().optional(),
});

type BrandSettingsFormValues = z.infer<ReturnType<typeof createBrandSettingsSchema>>;

interface BrandSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandSettingsDialog({ open, onOpenChange }: BrandSettingsDialogProps) {
  const { settings, updateSettings } = useBrandSettings();
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const form = useForm<BrandSettingsFormValues>({
    resolver: zodResolver(createBrandSettingsSchema(t)),
    defaultValues: DEFAULT_BRAND_SETTINGS,
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    } else {
      form.reset(DEFAULT_BRAND_SETTINGS);
    }
  }, [settings, form]);

  const onSubmit = async (data: BrandSettingsFormValues) => {
    try {
      setIsSaving(true);
      await updateSettings(data as BrandSettings);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving brand settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('brandSettings.title')}</DialogTitle>
          <DialogDescription>
            Configure a identidade da sua marca para personalizar as campanhas geradas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('brandSettings.basicInfo')}</h3>
              
              <FormField
                control={form.control}
                name="brand_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('brandSettings.brandName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('brandSettings.brandNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instagram_handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="@suamarca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://suamarca.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="brand_values"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('brandSettings.targetAudience')} *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('brandSettings.targetAudiencePlaceholder')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tom de Voz e Estilo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('brandSettings.toneAndStyle')}</h3>

              <FormField
                control={form.control}
                name="tone_of_voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('brandSettings.toneOfVoice')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('brandSettings.selectTone')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONE_OF_VOICE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mercado-Alvo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mercado-alvo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TARGET_MARKET_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo Preferido *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estilo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PREFERRED_STYLE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cores da Marca */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('brandSettings.brandColors')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ColorPicker
                          label={t('brandSettings.primaryColor') + ' *'}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ColorPicker
                          label={t('brandSettings.secondaryColor') + ' *'}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Palavras-chave */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t('brandSettings.keywords')}</h3>

              <FormField
                control={form.control}
                name="preferred_keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('brandSettings.keywords')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('brandSettings.keywordsPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="words_to_avoid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palavras a Evitar</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: barato, comum, simples (separadas por vírgula)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer com botões */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t('brandSettings.cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('brandSettings.saving')}
                  </>
                ) : (
                  t('brandSettings.save')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
