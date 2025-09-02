-- Create participants_csv table if it doesn't exist
CREATE TABLE IF NOT EXISTS participants_csv (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  yatri_id VARCHAR(255) UNIQUE NOT NULL,
  yatri_type VARCHAR(100),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  dial_code VARCHAR(10),
  contact_number VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(50),
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
  application_submitted_on TIMESTAMP,
  yatri_annual_income DECIMAL(12, 2),
  selected_date DATE,
  scholarship_total_amount_paid DECIMAL(12, 2),
  payment_date DATE,
  payment_id VARCHAR(255),
  designation VARCHAR(255),
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on commonly queried fields
CREATE INDEX idx_yatri_type ON participants_csv(yatri_type);
CREATE INDEX idx_state ON participants_csv(state);
CREATE INDEX idx_gender ON participants_csv(gender);
CREATE INDEX idx_created_at ON participants_csv(created_at);

-- Create analytics_cache table for storing computed insights
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value JSONB,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Create uploads table for tracking CSV uploads
CREATE TABLE IF NOT EXISTS uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255),
  file_size INTEGER,
  records_count INTEGER,
  uploaded_by VARCHAR(255),
  upload_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE participants_csv ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON participants_csv FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON participants_csv FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON participants_csv FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON analytics_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON analytics_cache FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON uploads FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON uploads FOR INSERT WITH CHECK (true);