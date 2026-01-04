-- TEMPORARILY DISABLE RLS on all relevant tables to identify the blocker
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE entity_members DISABLE ROW LEVEL SECURITY;

-- Also ensure the FK constraints are not the hidden cause (though error says RLS)
-- We will keep the constraints but the RLS disablement should allow the FK check to see the rows.
