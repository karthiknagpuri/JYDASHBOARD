-- FIX RLS POLICIES FOR CSV_SUBMISSIONS TABLE
-- Run this in Supabase SQL Editor to enable uploads
-- Go to: https://supabase.com/dashboard/project/ipiopwfghlaejgcerztc/sql/new

-- First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'csv_submissions';

-- Option 1: DISABLE RLS completely (easiest for testing)
-- This allows all operations without any restrictions
ALTER TABLE csv_submissions DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled but allow all operations
-- (Comment out Option 1 above and uncomment the lines below)

-- ALTER TABLE csv_submissions ENABLE ROW LEVEL SECURITY;
-- 
-- -- Drop all existing policies first
-- DROP POLICY IF EXISTS "Enable read access for all users" ON csv_submissions;
-- DROP POLICY IF EXISTS "Enable insert for all users" ON csv_submissions;
-- DROP POLICY IF EXISTS "Enable update for all users" ON csv_submissions;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON csv_submissions;
-- DROP POLICY IF EXISTS "Allow authenticated users to read csv_submissions" ON csv_submissions;
-- DROP POLICY IF EXISTS "Allow authenticated users to insert csv_submissions" ON csv_submissions;
-- DROP POLICY IF EXISTS "Allow authenticated users to update csv_submissions" ON csv_submissions;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete csv_submissions" ON csv_submissions;
-- 
-- -- Create new permissive policies for everyone (including anonymous users)
-- CREATE POLICY "Allow all users to read" ON csv_submissions
--     FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow all users to insert" ON csv_submissions
--     FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow all users to update" ON csv_submissions
--     FOR UPDATE USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow all users to delete" ON csv_submissions
--     FOR DELETE USING (true);

-- Verify the fix
SELECT 
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS is DISABLED - All operations allowed!'
        ELSE '⚠️ RLS is still enabled - Check policies below'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'csv_submissions';

-- Show current policies (if RLS is enabled)
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polpermissive as permissive,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'csv_submissions';

-- Show table structure for verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'csv_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;