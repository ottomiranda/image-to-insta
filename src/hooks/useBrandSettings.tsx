import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_BRAND_SETTINGS } from "@/lib/brandDefaults";

export interface BrandSettings {
  id?: string;
  brand_name: string;
  instagram_handle?: string;
  website?: string;
  brand_values: string;
  tone_of_voice: string;
  target_market: string;
  preferred_style: string;
  primary_color: string;
  secondary_color: string;
  preferred_keywords?: string;
  words_to_avoid?: string;
  logo_url?: string;
}

export const useBrandSettings = () => {
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSettings(null);
        return;
      }

      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setSettings(data || null);
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações da marca.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: BrandSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const settingsData = {
        user_id: user.id,
        ...newSettings,
      };

      const { data, error } = await supabase
        .from("brand_settings")
        .upsert(settingsData, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da marca foram atualizadas com sucesso.",
      });

      return data;
    } catch (error) {
      console.error("Error updating brand settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da marca.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_BRAND_SETTINGS as BrandSettings);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    resetToDefaults,
    refetch: fetchSettings,
  };
};
