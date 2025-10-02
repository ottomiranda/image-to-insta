-- Create campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Campaign data
  title text NOT NULL,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  
  -- Images used in generation
  centerpiece_image text NOT NULL,
  accessories_images jsonb DEFAULT '[]'::jsonb,
  model_image text,
  
  -- Generated content
  look_visual text NOT NULL,
  image_analysis jsonb,
  short_description text NOT NULL,
  long_description text NOT NULL,
  instagram jsonb NOT NULL,
  
  -- Publishing
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON public.campaigns(scheduled_at) WHERE status = 'scheduled';

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();