-- Migração bulk: validar e atualizar todas as campanhas existentes
-- Esta função irá validar todas as campanhas e salvar o resultado no banco

DO $$
DECLARE
  campaign_record RECORD;
  total_campaigns INTEGER := 0;
  valid_campaigns INTEGER := 0;
  invalid_campaigns INTEGER := 0;
BEGIN
  RAISE NOTICE '=== INICIANDO VALIDAÇÃO BULK DE CAMPANHAS ===';
  
  -- Contar total
  SELECT COUNT(*) INTO total_campaigns FROM campaigns WHERE json_schema_valid IS NULL;
  RAISE NOTICE 'Campanhas a validar: %', total_campaigns;
  
  -- Iterar sobre campanhas sem validação
  FOR campaign_record IN 
    SELECT id, title, look_visual, short_description, long_description,
           look_items, palette_hex, seo_keywords, brand_tone,
           governance, telemetry
    FROM campaigns 
    WHERE json_schema_valid IS NULL
  LOOP
    -- Validação básica: verificar se campos obrigatórios existem e não estão vazios
    DECLARE
      is_valid BOOLEAN := true;
      errors_list TEXT[] := ARRAY[]::TEXT[];
      warnings_list TEXT[] := ARRAY[]::TEXT[];
    BEGIN
      -- Validar campos obrigatórios
      IF campaign_record.look_visual IS NULL OR campaign_record.look_visual = '' THEN
        errors_list := array_append(errors_list, 'look_visual is required');
        is_valid := false;
      END IF;
      
      IF campaign_record.short_description IS NULL OR campaign_record.short_description = '' THEN
        errors_list := array_append(errors_list, 'short_description is required');
        is_valid := false;
      END IF;
      
      IF campaign_record.long_description IS NULL OR campaign_record.long_description = '' THEN
        errors_list := array_append(errors_list, 'long_description is required');
        is_valid := false;
      END IF;
      
      -- Validar arrays não vazios
      IF campaign_record.look_items IS NULL OR jsonb_array_length(campaign_record.look_items) = 0 THEN
        warnings_list := array_append(warnings_list, 'look_items is empty');
      END IF;
      
      IF campaign_record.palette_hex IS NULL OR array_length(campaign_record.palette_hex, 1) IS NULL THEN
        warnings_list := array_append(warnings_list, 'palette_hex is empty');
      END IF;
      
      IF campaign_record.seo_keywords IS NULL OR array_length(campaign_record.seo_keywords, 1) IS NULL THEN
        warnings_list := array_append(warnings_list, 'seo_keywords is empty');
      END IF;
      
      IF campaign_record.brand_tone IS NULL OR campaign_record.brand_tone = '' THEN
        warnings_list := array_append(warnings_list, 'brand_tone is empty');
      END IF;
      
      -- Salvar resultado da validação
      UPDATE campaigns 
      SET 
        json_schema_valid = is_valid,
        json_schema_errors = to_jsonb(errors_list),
        json_schema_warnings = to_jsonb(warnings_list),
        json_schema_validated_at = NOW()
      WHERE id = campaign_record.id;
      
      IF is_valid THEN
        valid_campaigns := valid_campaigns + 1;
      ELSE
        invalid_campaigns := invalid_campaigns + 1;
        RAISE NOTICE 'INVÁLIDA: % - Erros: %', campaign_record.title, array_to_string(errors_list, ', ');
      END IF;
    END;
  END LOOP;
  
  -- Relatório final
  RAISE NOTICE '=== RELATÓRIO FINAL DA VALIDAÇÃO BULK ===';
  RAISE NOTICE 'Total processado: %', total_campaigns;
  RAISE NOTICE 'Válidas: %', valid_campaigns;
  RAISE NOTICE 'Inválidas: %', invalid_campaigns;
  RAISE NOTICE '=== VALIDAÇÃO BULK CONCLUÍDA ===';
END;
$$;