-- Create Priority Pass table with same schema as participants_csv
CREATE TABLE IF NOT EXISTS priority_pass (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    yatri_id VARCHAR(255) UNIQUE,
    yatri_type VARCHAR(100),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    dial_code VARCHAR(10),
    contact_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    country VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    education VARCHAR(255),
    status VARCHAR(50),
    institute TEXT,
    area_of_interest TEXT,
    area_of_interest_2 TEXT,
    profile TEXT,
    application_submitted_on TIMESTAMP WITH TIME ZONE,
    yatri_annual_income DECIMAL(12, 2),
    selected_date DATE,
    scholarship_total_amount_paid DECIMAL(12, 2),
    payment_date DATE,
    payment_id VARCHAR(255),
    designation VARCHAR(255),
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_priority_pass_yatri_id ON priority_pass(yatri_id);
CREATE INDEX IF NOT EXISTS idx_priority_pass_email ON priority_pass(email);
CREATE INDEX IF NOT EXISTS idx_priority_pass_state ON priority_pass(state);
CREATE INDEX IF NOT EXISTS idx_priority_pass_district ON priority_pass(district);
CREATE INDEX IF NOT EXISTS idx_priority_pass_status ON priority_pass(status);
CREATE INDEX IF NOT EXISTS idx_priority_pass_created_at ON priority_pass(created_at DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE priority_pass ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users (adjust as needed)
CREATE POLICY "Enable all operations for authenticated users" ON priority_pass
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Create a policy for public read access (optional - remove if not needed)
CREATE POLICY "Enable read access for all users" ON priority_pass
    FOR SELECT 
    TO public 
    USING (true);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_priority_pass_updated_at 
    BEFORE UPDATE ON priority_pass 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to describe the table and important columns
COMMENT ON TABLE priority_pass IS 'Priority Pass participants with same structure as participants_csv table';
COMMENT ON COLUMN priority_pass.yatri_id IS 'Unique identifier for each Yatri/participant';
COMMENT ON COLUMN priority_pass.yatri_type IS 'Type of participant (e.g., Participant, VIP, etc.)';
COMMENT ON COLUMN priority_pass.status IS 'Current status of the participant (Active, Inactive, etc.)';
COMMENT ON COLUMN priority_pass.yatri_annual_income IS 'Annual income of the participant in currency units';
COMMENT ON COLUMN priority_pass.scholarship_total_amount_paid IS 'Total scholarship amount paid to the participant';