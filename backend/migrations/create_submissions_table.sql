-- Create Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id VARCHAR(255) UNIQUE,
    yatri_id VARCHAR(255),
    application_id VARCHAR(255),
    submission_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(100),
    review_status VARCHAR(100),
    score DECIMAL(5, 2),
    comments TEXT,
    reviewer VARCHAR(255),
    category VARCHAR(255),
    priority VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    contact_number VARCHAR(20),
    essay TEXT,
    references TEXT,
    documents TEXT,
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_score DECIMAL(5, 2),
    final_decision VARCHAR(100),
    decision_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_submission_id ON submissions(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_yatri_id ON submissions(yatri_id);
CREATE INDEX IF NOT EXISTS idx_submissions_application_id ON submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_review_status ON submissions(review_status);
CREATE INDEX IF NOT EXISTS idx_submissions_category ON submissions(category);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON submissions(priority);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_submission_date ON submissions(submission_date DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users (adjust as needed)
CREATE POLICY "Enable all operations for authenticated users" ON submissions
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Create a policy for public read access (optional - remove if not needed)
CREATE POLICY "Enable read access for all users" ON submissions
    FOR SELECT 
    TO public 
    USING (true);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_submissions_updated_at();

-- Add comments to describe the table and important columns
COMMENT ON TABLE submissions IS 'Application submissions and review tracking';
COMMENT ON COLUMN submissions.submission_id IS 'Unique identifier for each submission';
COMMENT ON COLUMN submissions.yatri_id IS 'Reference to the Yatri/participant ID';
COMMENT ON COLUMN submissions.application_id IS 'Application identifier';
COMMENT ON COLUMN submissions.status IS 'Current status of the submission';
COMMENT ON COLUMN submissions.review_status IS 'Review stage/status';
COMMENT ON COLUMN submissions.score IS 'Application score';
COMMENT ON COLUMN submissions.interview_score IS 'Interview score if applicable';
COMMENT ON COLUMN submissions.final_decision IS 'Final decision on the application';
COMMENT ON COLUMN submissions.priority IS 'Priority level of the submission';