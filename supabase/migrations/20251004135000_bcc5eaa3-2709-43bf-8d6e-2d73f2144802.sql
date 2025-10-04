-- Fase 2: Migração de Dados
-- Copiar dados existentes para a nova estrutura do brand_book_rules

-- Atualizar brand_book_rules para incluir campos de identidade
UPDATE brand_settings
SET brand_book_rules = jsonb_set(
  brand_book_rules,
  '{identity}',
  jsonb_build_object(
    'tone_of_voice', COALESCE(tone_of_voice, ''),
    'target_market', COALESCE(target_market, ''),
    'preferred_style', COALESCE(preferred_style, ''),
    'brand_values', COALESCE(brand_values, '')
  ),
  true
)
WHERE brand_book_rules IS NOT NULL;

-- Migrar palavras-chave preferidas para vocabulary.preferred (se não estiverem vazias)
UPDATE brand_settings
SET brand_book_rules = jsonb_set(
  brand_book_rules,
  '{vocabulary,preferred}',
  (
    SELECT jsonb_agg(DISTINCT value)
    FROM (
      -- Palavras existentes no array
      SELECT value FROM jsonb_array_elements_text(brand_book_rules->'vocabulary'->'preferred')
      UNION
      -- Palavras do campo preferred_keywords
      SELECT TRIM(unnest(string_to_array(preferred_keywords, ',')))
      WHERE preferred_keywords IS NOT NULL AND preferred_keywords != ''
    ) AS combined_words
    WHERE value IS NOT NULL AND value != ''
  ),
  true
)
WHERE preferred_keywords IS NOT NULL AND preferred_keywords != '';

-- Migrar palavras a evitar para vocabulary.forbidden (se não estiverem vazias)
UPDATE brand_settings
SET brand_book_rules = jsonb_set(
  brand_book_rules,
  '{vocabulary,forbidden}',
  (
    SELECT jsonb_agg(DISTINCT value)
    FROM (
      -- Palavras existentes no array
      SELECT value FROM jsonb_array_elements_text(brand_book_rules->'vocabulary'->'forbidden')
      UNION
      -- Palavras do campo words_to_avoid
      SELECT TRIM(unnest(string_to_array(words_to_avoid, ',')))
      WHERE words_to_avoid IS NOT NULL AND words_to_avoid != ''
    ) AS combined_words
    WHERE value IS NOT NULL AND value != ''
  ),
  true
)
WHERE words_to_avoid IS NOT NULL AND words_to_avoid != '';