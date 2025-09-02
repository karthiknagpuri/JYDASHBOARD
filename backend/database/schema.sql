-- Jagriti Yatra Dashboard Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Information
  registration_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')) NOT NULL,
  
  -- Address Information (JSONB for flexibility)
  address JSONB DEFAULT '{}',
  
  -- Participation Details
  year INTEGER NOT NULL,
  participation_type TEXT CHECK (participation_type IN ('National', 'International')) NOT NULL,
  category TEXT CHECK (category IN ('Student', 'Professional', 'Entrepreneur', 'Other')),
  occupation TEXT,
  organization TEXT,
  
  -- Payment Information
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Partial', 'Completed', 'Refunded')),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('Online', 'Bank Transfer', 'Cash', 'Cheque', 'Other')),
  transaction_id TEXT,
  
  -- Journey Details
  seat_number TEXT,
  coach_number TEXT,
  boarding_point TEXT,
  emergency_contact JSONB DEFAULT '{}',
  
  -- Health Information
  medical_conditions TEXT,
  dietary_restrictions TEXT,
  blood_group TEXT,
  
  -- Status
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Under Review', 'Approved', 'Rejected', 'Waitlisted', 'Confirmed', 'Cancelled')),
  
  -- Additional Fields
  special_requirements TEXT,
  referral_source TEXT,
  previous_participation JSONB DEFAULT '[]',
  social_media JSONB DEFAULT '{}',
  
  -- Timestamps and metadata
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS participant_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('ID Proof', 'Photo', 'Medical Certificate', 'Other')) NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS participant_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,2),
  metadata JSONB DEFAULT '{}',
  date_recorded DATE DEFAULT CURRENT_DATE,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue table
CREATE TABLE IF NOT EXISTS revenue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  transaction_date DATE NOT NULL,
  description TEXT,
  category TEXT,
  year INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Targets table
CREATE TABLE IF NOT EXISTS targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  target_name TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('participants', 'revenue', 'applications', 'other')) NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  year INTEGER NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table (for data imports)
CREATE TABLE IF NOT EXISTS uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  year INTEGER,
  columns_detected JSONB DEFAULT '[]',
  rows_processed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File data table (stores processed data from uploads)
CREATE TABLE IF NOT EXISTS file_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
  row_data JSONB NOT NULL,
  row_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_year_status ON participants(year, status);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_registration_id ON participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_participants_gender ON participants(gender);
CREATE INDEX IF NOT EXISTS idx_participants_participation_type ON participants(participation_type);
CREATE INDEX IF NOT EXISTS idx_participants_payment_status ON participants(payment_status);

CREATE INDEX IF NOT EXISTS idx_analytics_date_year ON analytics(date_recorded, year);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON analytics(metric_name);

CREATE INDEX IF NOT EXISTS idx_revenue_year ON revenue(year);
CREATE INDEX IF NOT EXISTS idx_revenue_transaction_date ON revenue(transaction_date);

CREATE INDEX IF NOT EXISTS idx_targets_year_status ON targets(year, status);

CREATE INDEX IF NOT EXISTS idx_uploads_year ON uploads(year);
CREATE INDEX IF NOT EXISTS idx_file_data_upload_id ON file_data(upload_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON revenue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_data ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust based on your authentication requirements)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

-- Admin users can read all data (adjust based on your role system)
CREATE POLICY "Admin access" ON participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

-- Similar policies for other tables
CREATE POLICY "Admin analytics access" ON analytics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admin revenue access" ON revenue FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admin targets access" ON targets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admin uploads access" ON uploads FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admin file_data access" ON file_data FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'moderator')
  )
);

-- Create a storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Upload files policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "View files policy" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Delete files policy" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');