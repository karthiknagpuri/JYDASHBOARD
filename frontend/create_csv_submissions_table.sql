-- Create csv_submissions table for storing large CSV data
CREATE TABLE IF NOT EXISTS csv_submissions (
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
CREATE INDEX IF NOT EXISTS idx_csv_submissions_yatra_id ON csv_submissions(yatra_id);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_role ON csv_submissions(role);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_gender ON csv_submissions(gender);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_submitted_date ON csv_submissions(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_csv_submissions_name ON csv_submissions(first_name, last_name);

-- Enable Row Level Security (RLS)
ALTER TABLE csv_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all data
CREATE POLICY "Allow authenticated users to read csv_submissions" ON csv_submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert data
CREATE POLICY "Allow authenticated users to insert csv_submissions" ON csv_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update data
CREATE POLICY "Allow authenticated users to update csv_submissions" ON csv_submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete data
CREATE POLICY "Allow authenticated users to delete csv_submissions" ON csv_submissions
    FOR DELETE
    TO authenticated
    USING (true);

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

-- Add some comments for documentation
COMMENT ON TABLE csv_submissions IS 'Table for storing CSV submission data with support for 7000+ records';
COMMENT ON COLUMN csv_submissions.yatri_id IS 'Unique identifier for each participant';
COMMENT ON COLUMN csv_submissions.role IS 'Role of the person (Participant or Facilitator)';
COMMENT ON COLUMN csv_submissions.submitted_date IS 'Date when the record was submitted';