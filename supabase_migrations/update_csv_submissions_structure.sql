-- Migration: Update csv_submissions table structure
-- Run this in Supabase SQL Editor to update the table structure
-- Go to: https://supabase.com/dashboard/project/ipiopwfghlaejgcerztc/sql/new

-- First, check if the table exists and its current structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'csv_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the existing table if it exists (WARNING: This will delete all data)
-- Only run this if you want to completely recreate the table
DROP TABLE IF EXISTS csv_submissions CASCADE;

-- Create the new csv_submissions table with updated structure
CREATE TABLE csv_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    yatri_id VARCHAR(100) UNIQUE NOT NULL,
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
CREATE INDEX idx_csv_submissions_yatra_id ON csv_submissions(yatri_id);
CREATE INDEX idx_csv_submissions_role ON csv_submissions(role);
CREATE INDEX idx_csv_submissions_gender ON csv_submissions(gender);
CREATE INDEX idx_csv_submissions_submitted_date ON csv_submissions(submitted_date DESC);
CREATE INDEX idx_csv_submissions_name ON csv_submissions(first_name, last_name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_csv_submissions_updated_at
    BEFORE UPDATE ON csv_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON csv_submissions TO authenticated;
GRANT ALL ON csv_submissions TO service_role;

-- Add comments for documentation
COMMENT ON TABLE csv_submissions IS 'Table for storing CSV submission data with support for 7000+ records';
COMMENT ON COLUMN csv_submissions.yatri_id IS 'Unique identifier for each participant';
COMMENT ON COLUMN csv_submissions.role IS 'Role of the person (Participant or Facilitator)';
COMMENT ON COLUMN csv_submissions.submitted_date IS 'Date when the record was submitted';

-- Verify the new table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'csv_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show table info
SELECT 
    tablename,
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'csv_submissions';
