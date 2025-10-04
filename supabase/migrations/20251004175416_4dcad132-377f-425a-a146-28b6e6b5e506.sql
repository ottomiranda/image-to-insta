-- Update campaigns with random brand compliance scores and adjustments
-- This will create visual variety in the Brand Compliance indicators

UPDATE campaigns 
SET 
  brand_compliance_score = CASE 
    WHEN random() < 0.18 THEN floor(random() * 6 + 90)::int   -- 90-95% - Excelente
    WHEN random() < 0.40 THEN floor(random() * 10 + 80)::int  -- 80-89% - Muito Bom
    WHEN random() < 0.63 THEN floor(random() * 10 + 70)::int  -- 70-79% - Bom
    WHEN random() < 0.86 THEN floor(random() * 10 + 60)::int  -- 60-69% - Adequado
    ELSE floor(random() * 5 + 55)::int                        -- 55-59% - Precisa Melhorias
  END;

-- Update adjustments based on the score assigned
UPDATE campaigns
SET brand_compliance_adjustments = CASE 
  WHEN brand_compliance_score >= 90 THEN 
    '["✓ Tom de voz alinhado perfeitamente com a marca", "✓ Vocabulário premium utilizado corretamente", "✓ Estilo visual impecável"]'::jsonb
  WHEN brand_compliance_score >= 80 THEN 
    '["✓ Excelente alinhamento com Brand Book", "✓ Palavras-chave estratégicas presentes", "✓ Call-to-action efetiva"]'::jsonb
  WHEN brand_compliance_score >= 70 THEN 
    '["✓ Bom alinhamento geral", "⚠️ Pequeno ajuste no tom de voz", "✓ Hashtags apropriadas"]'::jsonb
  WHEN brand_compliance_score >= 60 THEN 
    '["⚠️ Ajustes moderados no vocabulário", "⚠️ Tom de voz refinado", "✓ Guidelines respeitadas", "⚠️ Substituída palavra genérica"]'::jsonb
  ELSE 
    '["⚠️ Múltiplos ajustes necessários", "⚠️ Vocabulário reestruturado significativamente", "⚠️ Tom casual convertido para sofisticado", "⚠️ Removidos termos não permitidos"]'::jsonb
END
WHERE brand_compliance_score IS NOT NULL;