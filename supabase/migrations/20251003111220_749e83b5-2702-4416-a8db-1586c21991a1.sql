-- Fase 1: Expandir brand_settings com campos avançados de brand book
ALTER TABLE brand_settings 
  ADD COLUMN IF NOT EXISTS brand_book_rules JSONB DEFAULT '{
    "vocabulary": {
      "preferred": [],
      "forbidden": [],
      "alternatives": {}
    },
    "writing_style": {
      "max_sentence_length": 20,
      "use_emojis": true,
      "max_emojis_per_post": 3,
      "call_to_action_required": true
    },
    "content_rules": {
      "always_mention_sustainability": false,
      "include_brand_hashtag": true,
      "avoid_superlatives": false
    }
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS tone_examples JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS competitor_brands TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS content_guidelines JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS validation_strictness TEXT DEFAULT 'medium' CHECK (validation_strictness IN ('low', 'medium', 'high'));

-- Fase 5: Criar tabela para histórico de validações
CREATE TABLE IF NOT EXISTS brand_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  original_content JSONB NOT NULL,
  corrected_content JSONB,
  validation_score INTEGER CHECK (validation_score >= 0 AND validation_score <= 100),
  adjustments_made JSONB DEFAULT '[]'::jsonb,
  user_approved BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on brand_validations
ALTER TABLE brand_validations ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_validations
CREATE POLICY "Users can view own validations"
  ON brand_validations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validations"
  ON brand_validations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own validations"
  ON brand_validations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_validations_campaign_id ON brand_validations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brand_validations_user_id ON brand_validations(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_validations_created_at ON brand_validations(created_at DESC);