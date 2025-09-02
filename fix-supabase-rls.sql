-- Disable RLS on participants_csv table if it's enabled
-- This allows the service role key to have full access

ALTER TABLE participants_csv DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated and service_role
GRANT ALL ON participants_csv TO authenticated;
GRANT ALL ON participants_csv TO service_role;
GRANT ALL ON participants_csv TO anon;

-- Ensure we can see all records
CREATE POLICY "Enable all access for service role" ON participants_csv
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read access for everyone" ON participants_csv
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert for everyone" ON participants_csv
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Check current record count
SELECT COUNT(*) as total_records FROM participants_csv;