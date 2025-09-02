-- Create Screenshot Pending table
CREATE TABLE IF NOT EXISTS screenshot_pending (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    yatra_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    mobile_no VARCHAR(20),
    email_id VARCHAR(255),
    gender VARCHAR(20),
    selector_score DECIMAL(10, 2),
    screenshot_status VARCHAR(50) DEFAULT 'pending',
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_yatra_id ON screenshot_pending(yatra_id);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_email ON screenshot_pending(email_id);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_mobile ON screenshot_pending(mobile_no);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_status ON screenshot_pending(screenshot_status);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_gender ON screenshot_pending(gender);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_selector_score ON screenshot_pending(selector_score DESC);
CREATE INDEX IF NOT EXISTS idx_screenshot_pending_created_at ON screenshot_pending(created_at DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE screenshot_pending ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON screenshot_pending
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Create a policy for public read access (optional - remove if not needed)
CREATE POLICY "Enable read access for all users" ON screenshot_pending
    FOR SELECT 
    TO public 
    USING (true);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_screenshot_pending_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_screenshot_pending_updated_at 
    BEFORE UPDATE ON screenshot_pending 
    FOR EACH ROW 
    EXECUTE FUNCTION update_screenshot_pending_updated_at();

-- Add comments to describe the table and important columns
COMMENT ON TABLE screenshot_pending IS 'Track participants with pending screenshot submissions';
COMMENT ON COLUMN screenshot_pending.yatra_id IS 'Unique Yatra ID for the participant';
COMMENT ON COLUMN screenshot_pending.first_name IS 'First name of the participant';
COMMENT ON COLUMN screenshot_pending.last_name IS 'Last name of the participant';
COMMENT ON COLUMN screenshot_pending.mobile_no IS 'Mobile/contact number';
COMMENT ON COLUMN screenshot_pending.email_id IS 'Email address';
COMMENT ON COLUMN screenshot_pending.gender IS 'Gender of the participant';
COMMENT ON COLUMN screenshot_pending.selector_score IS 'Selection score or rating';
COMMENT ON COLUMN screenshot_pending.screenshot_status IS 'Status of screenshot (pending/submitted/verified)';
COMMENT ON COLUMN screenshot_pending.screenshot_url IS 'URL/path to the screenshot if uploaded';