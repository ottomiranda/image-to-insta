-- Adicionar colunas para dados normalizados do JSON
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS look_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS palette_hex text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS seo_keywords text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS brand_tone text,
ADD COLUMN IF NOT EXISTS governance jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS telemetry jsonb DEFAULT '{}'::jsonb;

-- Adicionar comentários
COMMENT ON COLUMN campaigns.look_items IS 'Array de itens do look (role, name, colors, etc)';
COMMENT ON COLUMN campaigns.palette_hex IS 'Palette de cores em formato hex';
COMMENT ON COLUMN campaigns.seo_keywords IS 'Keywords SEO extraídas';
COMMENT ON COLUMN campaigns.brand_tone IS 'Tom de voz da marca normalizado';
COMMENT ON COLUMN campaigns.governance IS 'Dados de governança (brand rules, safety checks)';
COMMENT ON COLUMN campaigns.telemetry IS 'Métricas de geração e performance';