-- Migration: fix_clientes_rls
-- Fixes permission denied error by avoiding direct query to auth.users in RLS policy

-- Drop the faulty policy
DROP POLICY IF EXISTS "Users can view own client data" ON clientes;

-- Create the new policy using auth.jwt()
CREATE POLICY "Users can view own client data"
  ON clientes FOR SELECT
  TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
  );
