-- Add last_shown_at to track when onboarding was last displayed
ALTER TABLE public.user_onboarding
ADD COLUMN IF NOT EXISTS last_shown_at TIMESTAMPTZ;

-- Optional: backfill updated_at for rows missing it
UPDATE public.user_onboarding
SET updated_at = NOW()
WHERE updated_at IS NULL;
