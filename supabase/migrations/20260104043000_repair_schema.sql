-- Safe creation of entities
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'personal',
  owner_id UUID REFERENCES auth.users(id)
);
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Safe creation of entity_members
CREATE TABLE IF NOT EXISTS entity_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  UNIQUE(entity_id, user_id)
);
ALTER TABLE entity_members ENABLE ROW LEVEL SECURITY;

-- Safe creation of forms
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  goal_amount NUMERIC DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create Helper Function to avoid RLS recursion (NOW SAFE to create, tables exist)
CREATE OR REPLACE FUNCTION get_user_entity_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT entity_id FROM entity_members WHERE user_id = auth.uid();
$$;

-- RLS Policies for entities
DROP POLICY IF EXISTS "Users can view joined entities" ON entities;
CREATE POLICY "Users can view joined entities" ON entities
  FOR SELECT USING (
    id IN (SELECT get_user_entity_ids())
  );

-- RLS Policies for entity_members
DROP POLICY IF EXISTS "Users can view members of their entities" ON entity_members;
CREATE POLICY "Users can view members of their entities" ON entity_members
  FOR SELECT USING (
    entity_id IN (SELECT get_user_entity_ids())
  );

-- RLS Policies for forms
DROP POLICY IF EXISTS "Users can view forms of their entity" ON forms;
CREATE POLICY "Users can view forms of their entity" ON forms
FOR SELECT USING (
  entity_id IN (SELECT get_user_entity_ids())
);

DROP POLICY IF EXISTS "Users can insert forms for their entity" ON forms;
CREATE POLICY "Users can insert forms for their entity" ON forms
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM entity_members em
    WHERE em.entity_id = forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS "Users can update forms for their entity" ON forms;
CREATE POLICY "Users can update forms for their entity" ON forms
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM entity_members em
    WHERE em.entity_id = forms.entity_id
    AND em.user_id = auth.uid()
    AND em.role IN ('owner', 'admin')
  )
);
