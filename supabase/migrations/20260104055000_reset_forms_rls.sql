-- Reset RLS for forms table to be permissive for authenticated users
-- This is a temporary measure to unblock development and verify data flow.

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop all existing complexity
DROP POLICY IF EXISTS "Users can view forms of their entity" ON forms;
DROP POLICY IF EXISTS "Users can insert forms for their entity" ON forms;
DROP POLICY IF EXISTS "Users can update forms for their entity" ON forms;
DROP POLICY IF EXISTS "Users can delete forms for their entity" ON forms;
DROP POLICY IF EXISTS "Enable access for entity members" ON forms;

-- Add simple authenticated policy
CREATE POLICY "Allow authenticated users full access" ON forms
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
