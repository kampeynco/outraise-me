-- Add new columns to forms table if they don't exist
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS goal_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Ensure status has correct constraints if needed (optional, assuming handled)
-- ALTER TABLE forms ALTER COLUMN status SET DEFAULT 'draft';
