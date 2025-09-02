-- Drop table if exists (optional - remove in production)
-- DROP TABLE IF EXISTS submissions CASCADE;

-- Create submissions table for 7000+ application records
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Personal Information
    yatri_id VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(20),
    role VARCHAR(50),
    mobile_no VARCHAR(20),
    age INTEGER,
    address TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_submissions_yatri_id ON submissions(yatri_id);
CREATE INDEX idx_submissions_role ON submissions(role);
CREATE INDEX idx_submissions_gender ON submissions(gender);
CREATE INDEX idx_submissions_submitted_date ON submissions(submitted_date DESC);
CREATE INDEX idx_submissions_name ON submissions(first_name, last_name);

-- Create a view for quick statistics
CREATE OR REPLACE VIEW submission_statistics AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN role = 'participant' THEN 1 END) as total_participants,
    COUNT(CASE WHEN role = 'facilitator' THEN 1 END) as total_facilitators,
    AVG(age) as average_age,
    COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
    COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count
FROM submissions;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update the updated_at column
CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Adjust based on your requirements
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- Example: Allow authenticated users to read all submissions
CREATE POLICY "Allow authenticated read access" ON submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Example: Allow authenticated users to insert submissions
CREATE POLICY "Allow authenticated insert access" ON submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Example: Allow authenticated users to update their own submissions
CREATE POLICY "Allow authenticated update access" ON submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions (adjust based on your needs)
GRANT ALL ON submissions TO authenticated;
GRANT SELECT ON submission_statistics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE submissions IS 'Stores all application submissions for Jagriti Yatra with support for 7000+ records';
COMMENT ON COLUMN submissions.yatri_id IS 'Unique identifier for each participant';
COMMENT ON COLUMN submissions.role IS 'Role of the person (Participant or Facilitator)';
COMMENT ON COLUMN submissions.submitted_date IS 'Date when the record was submitted';