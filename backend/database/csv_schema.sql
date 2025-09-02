-- Simplified CSV Processing Schema for Jagriti Yatra Participants
-- This schema is designed to handle CSV imports efficiently

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Participants CSV table - stores raw CSV data with flexible structure
CREATE TABLE IF NOT EXISTS participants_csv (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core identification
  yatri_id TEXT UNIQUE NOT NULL,
  yatri_type TEXT,
  
  -- Personal information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  dial_code TEXT,
  contact_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  
  -- Location information
  address TEXT,
  country TEXT,
  state TEXT,
  district TEXT,
  
  -- Education and professional
  education TEXT,
  institute TEXT,
  designation TEXT,
  
  -- Interests and profile
  area_of_interest TEXT,
  area_of_interest_2 TEXT,
  profile TEXT,
  
  -- Status and dates
  status TEXT,
  application_submitted_on TIMESTAMPTZ,
  selected_date DATE,
  
  -- Financial information
  yatri_annual_income DECIMAL(12,2),
  scholarship_total_amount_paid DECIMAL(10,2),
  payment_date DATE,
  payment_id TEXT,
  
  -- Source information
  source TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_participants_csv_yatri_id ON participants_csv(yatri_id);
CREATE INDEX IF NOT EXISTS idx_participants_csv_email ON participants_csv(email);
CREATE INDEX IF NOT EXISTS idx_participants_csv_status ON participants_csv(status);
CREATE INDEX IF NOT EXISTS idx_participants_csv_state ON participants_csv(state);
CREATE INDEX IF NOT EXISTS idx_participants_csv_yatri_type ON participants_csv(yatri_type);
CREATE INDEX IF NOT EXISTS idx_participants_csv_gender ON participants_csv(gender);
CREATE INDEX IF NOT EXISTS idx_participants_csv_created_at ON participants_csv(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_participants_csv_updated_at 
  BEFORE UPDATE ON participants_csv 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - adjust based on needs)
-- ALTER TABLE participants_csv ENABLE ROW LEVEL SECURITY;

-- Create basic policies (uncomment if using RLS)
-- CREATE POLICY "Allow public read access" ON participants_csv FOR SELECT USING (true);
-- CREATE POLICY "Allow admin write access" ON participants_csv FOR ALL USING (true);

-- Sample query to test the schema
-- SELECT 
--   yatri_id,
--   first_name,
--   last_name,
--   email,
--   status,
--   state,
--   created_at
-- FROM participants_csv
-- ORDER BY created_at DESC
-- LIMIT 10;