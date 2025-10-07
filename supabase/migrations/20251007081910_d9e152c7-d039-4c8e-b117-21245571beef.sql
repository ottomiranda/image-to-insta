-- Adicionar colunas para persistir resultado da validação JSON Schema
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS json_schema_valid BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS json_schema_errors JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS json_schema_warnings JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS json_schema_validated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN campaigns.json_schema_valid IS 'Indica se o JSON Schema da campanha é válido (true/false/null se não validado)';
COMMENT ON COLUMN campaigns.json_schema_errors IS 'Array de erros de validação do JSON Schema';
COMMENT ON COLUMN campaigns.json_schema_warnings IS 'Array de avisos de validação do JSON Schema';
COMMENT ON COLUMN campaigns.json_schema_validated_at IS 'Timestamp da última validação do JSON Schema';

-- Índice para otimizar queries por status de validação
CREATE INDEX IF NOT EXISTS idx_campaigns_json_schema_valid ON campaigns(json_schema_valid) WHERE json_schema_valid IS NOT NULL;