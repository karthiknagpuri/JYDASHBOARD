-- Supabase SQL Schema for Jagriti Yatra Dashboard
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (be careful with this in production!)
DROP TABLE IF EXISTS participants_csv CASCADE;

-- Create the participants_csv table with all fields from CSV
CREATE TABLE participants_csv (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    yatri_id VARCHAR(255) UNIQUE NOT NULL,
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
    status VARCHAR(100),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_participants_yatri_id ON participants_csv(yatri_id);
CREATE INDEX idx_participants_email ON participants_csv(email);
CREATE INDEX idx_participants_yatri_type ON participants_csv(yatri_type);
CREATE INDEX idx_participants_state ON participants_csv(state);
CREATE INDEX idx_participants_created_at ON participants_csv(created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_participants_csv_updated_at 
    BEFORE UPDATE ON participants_csv 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your needs)
-- For anonymous access (be careful with this!)
GRANT SELECT ON participants_csv TO anon;
GRANT INSERT ON participants_csv TO anon;
GRANT UPDATE ON participants_csv TO anon;
GRANT DELETE ON participants_csv TO anon;

-- For authenticated users
GRANT ALL ON participants_csv TO authenticated;

-- For service role (full access)
GRANT ALL ON participants_csv TO service_role;

-- Create RLS (Row Level Security) policies if needed
ALTER TABLE participants_csv ENABLE ROW LEVEL SECURITY;

-- Policy for reading (everyone can read)
CREATE POLICY "Allow public read access" ON participants_csv
    FOR SELECT USING (true);

-- Policy for inserting (only authenticated users)
CREATE POLICY "Allow authenticated insert" ON participants_csv
    FOR INSERT WITH CHECK (true);

-- Policy for updating (only authenticated users)
CREATE POLICY "Allow authenticated update" ON participants_csv
    FOR UPDATE USING (true);

-- Policy for deleting (only authenticated users)
CREATE POLICY "Allow authenticated delete" ON participants_csv
    FOR DELETE USING (true);

-- Insert a test record to verify the table works
INSERT INTO participants_csv (
    yatri_id,
    yatri_type,
    first_name,
    last_name,
    email,
    gender,
    state,
    scholarship_total_amount_paid
) VALUES (
    'TEST001',
    'participant',
    'Test',
    'User',
    'test@example.com',
    'male',
    'Karnataka',
    0
);

-- Verify the insert worked
SELECT COUNT(*) as total_records FROM participants_csv;

-- Clean up the test record
DELETE FROM participants_csv WHERE yatri_id = 'TEST001';

-- Final verification
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM 
    information_schema.columns
WHERE 
    table_name = 'participants_csv'
ORDER BY 
    ordinal_position;