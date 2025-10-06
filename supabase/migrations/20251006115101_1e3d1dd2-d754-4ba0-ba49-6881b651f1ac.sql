-- Add column to track original brand compliance score before corrections
ALTER TABLE campaigns 
ADD COLUMN brand_compliance_original_score integer;