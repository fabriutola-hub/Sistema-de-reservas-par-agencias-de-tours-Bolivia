-- Migration: fix_recordatorios_enviados_rls
-- Description: Fix critical security issue in recordatorios_enviados table RLS policies
-- 
-- PROBLEM: The "Service role full access" policy uses USING (true) and WITH CHECK (true) 
-- for the 'public' role, allowing ANY anonymous user to read and modify all reminders.
--
-- SOLUTION: 
-- 1. Drop the insecure policy
-- 2. Create admin-only SELECT policy using is_admin() function
-- 3. Restrict INSERT/UPDATE/DELETE to service_role only (server actions/cron)

-- Step 1: Drop the insecure policy that allowed public access
DROP POLICY IF EXISTS "Service role full access" ON recordatorios_enviados;

-- Step 2: Create admin-only SELECT policy
-- Only users with is_admin() = true can view reminders
CREATE POLICY "Admin can view reminders" ON recordatorios_enviados
    FOR SELECT
    USING (is_admin());

-- Step 3: Create service_role-only policies for data modification
-- These policies will only apply when using service_role (from server actions/cron)
-- and will bypass RLS entirely, so we don't need explicit policies for service_role

-- Note: service_role bypasses RLS by default, so INSERT/UPDATE/DELETE 
-- operations can only happen from server-side code using the service_role key.
-- Client-side code using anon/authenticated keys will be blocked from 
-- INSERT/UPDATE/DELETE operations since there are no policies allowing them.

-- Verification query (run after applying migration):
-- SELECT policyname, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'recordatorios_enviados';
