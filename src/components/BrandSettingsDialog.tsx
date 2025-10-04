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
import { Label } from "@/components/ui/label";
import ColorPicker from "./ColorPicker";
import { useBrandSettings, BrandSettings } from "@/hooks/useBrandSettings";
import {
  TONE_OF_VOICE_OPTIONS,
  TARGET_MARKET_OPTIONS,
  PREFERRED_STYLE_OPTIONS,
  DEFAULT_BRAND_SETTINGS,
} from "@/lib/brandDefaults";
import { Loader2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrandBookSettings } from "./BrandBookSettings";
import { BrandBookTemplateSelector } from "./BrandBookTemplateSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const createBrandSettingsSchema = (t: any) => z.object({
  brand_name: z.string().min(1, t('brandSettings.brandName')).max(100),
  instagram_handle: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  brand_values: z.string().optional(),
  tone_of_voice: z.string().optional(),
  target_market: z.string().optional(),
  preferred_style: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária inválida"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor secundária inválida"),
  preferred_keywords: z.string().optional(),
  words_to_avoid: z.string().optional(),
  logo_url: z.string().optional().nullable(),
});

type BrandSettingsFormValues = z.infer<ReturnType<typeof createBrandSettingsSchema>>;

interface BrandSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandSettingsDialog({ open, onOpenChange }: BrandSettingsDialogProps) {
  console.log('=== BrandSettingsDialog RENDER ===');
  
  const { settings, updateSettings } = useBrandSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm<BrandSettingsFormValues>({
    resolver: zodResolver(createBrandSettingsSchema(t)),
    defaultValues: DEFAULT_BRAND_SETTINGS,
  });

  // Monitor form state changes
  useEffect(() => {
    console.log('=== FORM STATE MONITOR ===', {
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
      isSaving,
      isUploadingLogo,
      hasLogoFile: !!logoFile,
      formValues: form.getValues(),
    });
  }, [form.formState.isValid, form.formState.isDirty, form.formState.errors, isSaving, isUploadingLogo, logoFile]);

  useEffect(() => {
    if (settings) {
      form.reset(settings);
      setLogoPreview(settings.logo_url || null);
    } else {
      form.reset(DEFAULT_BRAND_SETTINGS);
      setLogoPreview(null);
    }
  }, [settings, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('=== LOGO FILE SELECTED ===', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo PNG, JPG ou SVG.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast({
        title: "Arquivo muito grande",
        description: "O logo deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    console.log('Logo file validated, setting preview...');
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Logo preview ready');
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    form.setValue('logo_url', '');
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) {
      console.log('uploadLogo: No logo file to upload');
      return null;
    }

    console.log('uploadLogo: Starting upload...', { fileName: logoFile.name, fileSize: logoFile.size });
    setIsUploadingLogo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      console.log('uploadLogo: Uploading to storage...', fileName);

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) {
        console.error('uploadLogo: Upload error', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(fileName);

      console.log('uploadLogo: Upload successful!', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer upload do logo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const onSubmit = async (data: BrandSettingsFormValues) => {
    console.log('=== FORM SUBMIT TRIGGERED ===');
    console.log('Form values:', form.getValues());
    console.log('Form errors:', form.formState.errors);
    console.log('Is valid:', form.formState.isValid);
    console.log('Logo file:', logoFile);
    console.log('Data received:', data);
    
    try {
      setIsSaving(true);
      
      // Upload logo if a new file was selected
      let logoUrl = data.logo_url || '';
      if (logoFile) {
        console.log('onSubmit: Uploading new logo file...');
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log('onSubmit: Logo uploaded successfully', logoUrl);
        } else {
          console.log('onSubmit: Logo upload failed or returned null');
        }
      } else {
        console.log('onSubmit: No new logo file, keeping existing URL:', logoUrl);
      }

      console.log('onSubmit: Updating settings with logo_url:', logoUrl);
      await updateSettings({ ...data, logo_url: logoUrl } as BrandSettings);
      console.log('onSubmit: Settings updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving brand settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">{t('brandSettings.title')}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure a identidade da sua marca para personalizar as campanhas geradas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-white">{t('brandSettings.basicInfo')}</h3>
              
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


              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo da Marca</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center px-2">
                        PNG, JPG, SVG<br />Max 2MB
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p>Faça upload do logo da sua marca para incluí-lo nas imagens geradas.</p>
                    <p className="text-xs mt-1">Formatos aceitos: PNG, JPG, SVG (máx 2MB)</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Cores da Marca */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-2 text-white">{t('brandSettings.brandColors')}</h3>

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


            {/* Brand Book Rules - Avançado */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="brand-book" className="border-white/10">
                  <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline">
                    📚 Brand Book Avançado
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    {/* Templates Selector */}
                    <BrandBookTemplateSelector
                      onApplyTemplate={(rules, strictness) => {
                        updateSettings({
                          ...settings,
                          brand_name: settings?.brand_name || '',
                          brand_values: settings?.brand_values || '',
                          tone_of_voice: settings?.tone_of_voice || '',
                          target_market: settings?.target_market || '',
                          preferred_style: settings?.preferred_style || '',
                          primary_color: settings?.primary_color || '#6366f1',
                          secondary_color: settings?.secondary_color || '#8b5cf6',
                          brand_book_rules: rules,
                          validation_strictness: strictness
                        });
                      }}
                      currentRules={settings?.brand_book_rules}
                    />

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou personalize</span>
                      </div>
                    </div>

                    {/* Custom Settings */}
                    <BrandBookSettings
                      brandBookRules={settings?.brand_book_rules || {
                        vocabulary: { preferred: [], forbidden: [], alternatives: {} },
                        writing_style: { max_sentence_length: 20, use_emojis: true, max_emojis_per_post: 3, call_to_action_required: true },
                        content_rules: { always_mention_sustainability: false, include_brand_hashtag: true, avoid_superlatives: false }
                      }}
                      validationStrictness={settings?.validation_strictness || 'medium'}
                      onUpdate={(rules, strictness) => {
                        updateSettings({
                          ...settings,
                          brand_name: settings?.brand_name || '',
                          brand_values: settings?.brand_values || '',
                          tone_of_voice: settings?.tone_of_voice || '',
                          target_market: settings?.target_market || '',
                          preferred_style: settings?.preferred_style || '',
                          primary_color: settings?.primary_color || '#6366f1',
                          secondary_color: settings?.secondary_color || '#8b5cf6',
                          brand_book_rules: rules,
                          validation_strictness: strictness
                        });
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Footer com botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-card/95 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t('brandSettings.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isUploadingLogo}
                onClick={(e) => {
                  console.log('=== BUTTON CLICKED ===');
                  console.log('Button disabled:', isSaving || isUploadingLogo);
                  console.log('Form valid:', form.formState.isValid);
                  console.log('Form errors:', form.formState.errors);
                }}
              >
                {isSaving || isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingLogo ? 'Fazendo upload...' : t('brandSettings.saving')}
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
