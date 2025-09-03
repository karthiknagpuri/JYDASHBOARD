-- Create settings table for storing dashboard configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Add RLS (Row Level Security) policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only admins to update settings (you can modify this based on your needs)
CREATE POLICY "Allow authenticated users to update settings" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only admins to insert settings
CREATE POLICY "Allow authenticated users to insert settings" ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only admins to delete settings
CREATE POLICY "Allow authenticated users to delete settings" ON settings
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO settings (key, value, category) VALUES
  ('dashboard_name', 'Jagriti Yatra Dashboard', 'general'),
  ('organization', 'Jagriti Yatra', 'general'),
  ('timezone', 'IST', 'general'),
  ('language', 'English', 'general'),
  ('date_format', 'DD/MM/YYYY', 'general'),
  ('currency', 'INR', 'general'),
  ('event_name', 'Jagriti Yatra 2024-25', 'event'),
  ('start_date', '2024-12-24', 'event'),
  ('end_date', '2025-01-14', 'event'),
  ('total_capacity', '450', 'capacity'),
  ('ticket_price', '31290', 'capacity'),
  ('theme', 'Light', 'appearance')
ON CONFLICT (key) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();