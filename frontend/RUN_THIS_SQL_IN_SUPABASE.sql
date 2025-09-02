-- IMPORTANT: Run this SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/ipiopwfghlaejgcerztc/sql/new
-- Copy and paste this entire SQL script and click "Run"

-- Drop table if exists (be careful, this will delete existing data)
-- Uncomment the line below only if you want to recreate the table
-- DROP TABLE IF EXISTS csv_submissions CASCADE;

-- Create csv_submissions table for storing large CSV data
CREATE TABLE IF NOT EXISTS csv_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submitted_section VARCHAR(255) DEFAULT 'Online',
    yatra_id VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(20),
    role VARCHAR(50),
    mobile_no VARCHAR(20),
    age INTEGER,
    address TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance with large datasets
CREATE INDEX IF NOT EXISTS idx_csv_submissions_yatra_id ON csv_submissions(yatra_id);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_role ON csv_submissions(role);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_gender ON csv_submissions(gender);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_submitted_date ON csv_submissions(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_name ON csv_submissions(first_name, last_name);

-- Enable Row Level Security (RLS)
ALTER TABLE csv_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON csv_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON csv_submissions;
DROP POLICY IF EXISTS "Enable update for all users" ON csv_submissions;
DROP POLICY IF EXISTS "Enable delete for all users" ON csv_submissions;

-- Create policies to allow all operations for authenticated and anon users
-- This is for testing - you may want to restrict this later
CREATE POLICY "Enable read access for all users" ON csv_submissions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON csv_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON csv_submissions
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON csv_submissions
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON csv_submissions TO anon;
GRANT ALL ON csv_submissions TO authenticated;
GRANT ALL ON csv_submissions TO service_role;

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_csv_submissions_updated_at ON csv_submissions;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_csv_submissions_updated_at
    BEFORE UPDATE ON csv_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some comments for documentation
COMMENT ON TABLE csv_submissions IS 'Table for storing CSV submission data with support for 7000+ records';
COMMENT ON COLUMN csv_submissions.yatra_id IS 'Unique identifier for each participant (with JY prefix)';
COMMENT ON COLUMN csv_submissions.role IS 'Role of the person (participant or facilitator)';
COMMENT ON COLUMN csv_submissions.submitted_section IS 'Section from which the submission was made (default: Online)';
COMMENT ON COLUMN csv_submissions.submitted_date IS 'Date when the record was submitted';

-- Verify the table was created
SELECT 
    'Table created successfully!' as status,
    COUNT(*) as existing_records 
FROM csv_submissions;