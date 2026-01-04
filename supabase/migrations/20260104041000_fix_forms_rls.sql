-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be safe (avoid duplicates)
DROP POLICY IF EXISTS "Users can view forms of their entity" ON forms;
DROP POLICY IF EXISTS "Users can insert forms for their entity" ON forms;
DROP POLICY IF EXISTS "Users can update forms for their entity" ON forms;

-- Create Policies

-- READ: Members can view forms
CREATE POLICY "Users can view forms of their entity" ON forms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM entity_members em
    WHERE em.entity_id = forms.entity_id
    AND em.user_id = auth.uid()
  )
);

-- INSERT: Owner/Admin can insert
CREATE POLICY "Users can insert forms for their entity" ON forms
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM entity_members em
    WHERE em.entity_id = forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);

-- UPDATE: Owner/Admin can update
CREATE POLICY "Users can update forms for their entity" ON forms
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM entity_members em
    WHERE em.entity_id = forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);
