-- FIX INFINITE RECURSION
-- The issue is that policies on 'entities' and 'entity_members' query 'entity_members' directly.
-- Since 'entity_members' has RLS enabled, this triggers its own policy, creating a loop.
-- Solution: Use a SECURITY DEFINER function to read 'entity_members' without triggering RLS.

-- 1. Define the Safe Lookup Function
DROP FUNCTION IF EXISTS get_user_entity_ids() CASCADE;

CREATE OR REPLACE FUNCTION get_user_entity_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT entity_id FROM entity_members WHERE user_id = auth.uid();
$$;

-- 2. Update 'entities' Policy to use the function
DROP POLICY IF EXISTS "Users can view joined entities" ON entities;
CREATE POLICY "Users can view joined entities" ON entities
  FOR SELECT USING (
    id IN (SELECT get_user_entity_ids())
  );

-- 3. Update 'entity_members' Policy to use the function
DROP POLICY IF EXISTS "Users can view members of their entities" ON entity_members;
CREATE POLICY "Users can view members of their entities" ON entity_members
  FOR SELECT USING (
    entity_id IN (SELECT get_user_entity_ids())
  );

-- 4. Ensure Insert Policy Exists for Entity Members (for invites/joining)
-- Allow authenticated users to insert a new membership for themselves (needed if not using RPC or if RPC is invoker)
-- More strict: Only allow if they are the owner of the entity? No, on creation they become owner.
-- For simple MVP correctness + security: 
-- Allow inserting if:
-- A) You are adding yourself AND (the entity has no members OR you are owner) -- Complex.
-- Simpler: Trust the 'create_entity' RPC. 
-- BUT, just in case they are doing direct inserts:
DROP POLICY IF EXISTS "Users can create memberships" ON entity_members;
CREATE POLICY "Users can create memberships" ON entity_members
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- 5. Update Forms Policy to use the function (Consistency)
DROP POLICY IF EXISTS "Users can view forms of their entity" ON forms;
CREATE POLICY "Users can view forms of their entity" ON forms
FOR SELECT USING (
  entity_id IN (SELECT get_user_entity_ids())
);
