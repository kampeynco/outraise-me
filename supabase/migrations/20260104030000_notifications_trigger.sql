-- Notifications Table Schema Update
-- We are modifying the existing notifications table or creating it if it doesn't exist securely

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Trigger Function for New Donations
CREATE OR REPLACE FUNCTION public.handle_new_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member RECORD;
  donor_name TEXT;
  amount_formatted TEXT;
BEGIN
  -- Format amount (assuming amount is numeric)
  amount_formatted := '$' || NEW.amount::TEXT;
  donor_name := NEW.donor_name;

  -- Loop through all members of the entity
  FOR member IN
    SELECT user_id FROM public.entity_members WHERE entity_id = NEW.entity_id
  LOOP
    INSERT INTO public.notifications (user_id, entity_id, title, message, type, link)
    VALUES (
      member.user_id,
      NEW.entity_id,
      'New Donation',
      donor_name || ' donated ' || amount_formatted,
      'donation',
      '/donations'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create Trigger
DROP TRIGGER IF EXISTS on_new_donation ON public.donations;
CREATE TRIGGER on_new_donation
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_donation();
