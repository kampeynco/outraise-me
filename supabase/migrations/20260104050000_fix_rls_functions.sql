-- Create a secure function to check permissions
-- This runs as the database owner, bypassing RLS on the lookup tables
CREATE OR REPLACE FUNCTION can_manage_entity(check_entity_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM entity_members 
    WHERE entity_id = check_entity_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  );
END;
$$;

-- Create a function to check read access (any member)
CREATE OR REPLACE FUNCTION can_view_entity(check_entity_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM entity_members 
    WHERE entity_id = check_entity_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- Update Policies to use these functions
DROP POLICY IF EXISTS "Users can view forms of their entity" ON forms;
CREATE POLICY "Users can view forms of their entity" ON forms
FOR SELECT USING (
  can_view_entity(entity_id)
);

DROP POLICY IF EXISTS "Users can insert forms for their entity" ON forms;
CREATE POLICY "Users can insert forms for their entity" ON forms
FOR INSERT WITH CHECK (
  can_manage_entity(entity_id)
);

DROP POLICY IF EXISTS "Users can update forms for their entity" ON forms;
CREATE POLICY "Users can update forms for their entity" ON forms
FOR UPDATE USING (
  can_manage_entity(entity_id)
);

-- Delete policy (was missing)
DROP POLICY IF EXISTS "Users can delete forms for their entity" ON forms;
CREATE POLICY "Users can delete forms for their entity" ON forms
FOR DELETE USING (
  can_manage_entity(entity_id)
);
