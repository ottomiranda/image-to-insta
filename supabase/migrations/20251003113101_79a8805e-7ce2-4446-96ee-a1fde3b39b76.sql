-- Adicionar colunas de brand compliance à tabela campaigns
ALTER TABLE campaigns 
  ADD COLUMN IF NOT EXISTS brand_compliance_score INTEGER CHECK (brand_compliance_score >= 0 AND brand_compliance_score <= 100),
  ADD COLUMN IF NOT EXISTS brand_compliance_adjustments JSONB DEFAULT '[]'::jsonb;

-- Adicionar comentários para documentação
COMMENT ON COLUMN campaigns.brand_compliance_score IS 'Score de 0-100 indicando aderência ao brand book';
COMMENT ON COLUMN campaigns.brand_compliance_adjustments IS 'Array JSON com lista de ajustes feitos pela validação';

-- Criar índice para consultas por score
CREATE INDEX IF NOT EXISTS idx_campaigns_compliance_score 
  ON campaigns(brand_compliance_score) 
  WHERE brand_compliance_score IS NOT NULL;