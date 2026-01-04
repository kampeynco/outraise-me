-- Ensure forms table has correct constraints
ALTER TABLE public.forms
ADD CONSTRAINT forms_slug_key UNIQUE (slug);

ALTER TABLE public.forms
ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE public.forms
ALTER COLUMN title SET NOT NULL;

-- Add RLS policy for forms if not exists (assuming basic crud for entity members)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forms of their entity" ON public.forms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.entity_members em
    WHERE em.entity_id = public.forms.entity_id
    AND em.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert forms for their entity" ON public.forms
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entity_members em
    WHERE em.entity_id = public.forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can update forms for their entity" ON public.forms
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.entity_members em
    WHERE em.entity_id = public.forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);
