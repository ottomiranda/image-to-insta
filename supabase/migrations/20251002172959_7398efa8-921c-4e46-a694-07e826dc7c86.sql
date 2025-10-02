-- Create brand_settings table
CREATE TABLE public.brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações Básicas
  brand_name text NOT NULL,
  instagram_handle text,
  website text,
  brand_values text NOT NULL,
  
  -- Tom de Voz e Estilo
  tone_of_voice text NOT NULL,
  target_market text NOT NULL,
  preferred_style text NOT NULL,
  
  -- Cores da Marca
  primary_color text NOT NULL DEFAULT '#6366f1',
  secondary_color text NOT NULL DEFAULT '#8b5cf6',
  
  -- Palavras-chave
  preferred_keywords text,
  words_to_avoid text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own brand settings"
  ON public.brand_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand settings"
  ON public.brand_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand settings"
  ON public.brand_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_brand_settings_updated_at
  BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();