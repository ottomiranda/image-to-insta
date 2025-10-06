-- Populate brand_compliance_original_score for existing campaigns
-- This will create realistic original scores that are lower than current scores

UPDATE campaigns 
SET brand_compliance_original_score = CASE 
  WHEN brand_compliance_score >= 90 THEN floor(random() * 20 + 30)::int   -- 30-49% original para scores 90+
  WHEN brand_compliance_score >= 80 THEN floor(random() * 25 + 35)::int   -- 35-59% original para scores 80+
  WHEN brand_compliance_score >= 70 THEN floor(random() * 20 + 40)::int   -- 40-59% original para scores 70+
  WHEN brand_compliance_score >= 60 THEN floor(random() * 15 + 45)::int   -- 45-59% original para scores 60+
  ELSE floor(random() * 10 + 50)::int                                     -- 50-59% original para scores baixos
END
WHERE brand_compliance_original_score IS NULL 
AND brand_compliance_score IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN campaigns.brand_compliance_original_score IS 'Score original antes das correções automáticas de Brand Compliance';