# Push Updated CSV Submissions Table to Supabase

## Steps to Update Your Supabase Database

### 1. Access Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/ipiopwfghlaejgcerztc/sql/new

### 2. Run the Migration Script
Copy and paste the contents of `supabase_migrations/update_csv_submissions_structure.sql` into the SQL editor and execute it.

### 3. Alternative: Run Individual Commands

If you prefer to run commands step by step, here are the key commands:

#### Check Current Table Structure
```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'csv_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### Drop Existing Table (WARNING: This deletes all data)
```sql
DROP TABLE IF EXISTS csv_submissions CASCADE;
```

#### Create New Table with Updated Structure
```sql
CREATE TABLE csv_submissions (
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
```

#### Create Indexes
```sql
CREATE INDEX idx_csv_submissions_yatra_id ON csv_submissions(yatri_id);
CREATE INDEX idx_csv_submissions_role ON csv_submissions(role);
CREATE INDEX idx_csv_submissions_gender ON csv_submissions(gender);
CREATE INDEX idx_csv_submissions_submitted_date ON csv_submissions(submitted_date DESC);
CREATE INDEX idx_csv_submissions_name ON csv_submissions(first_name, last_name);
```

#### Create Trigger Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Create Trigger
```sql
CREATE TRIGGER update_csv_submissions_updated_at
    BEFORE UPDATE ON csv_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Grant Permissions
```sql
GRANT ALL ON csv_submissions TO authenticated;
GRANT ALL ON csv_submissions TO service_role;
```

### 4. Verify the Update
After running the migration, verify the new structure:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'csv_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 5. Test with Sample Data
You can test the new structure by inserting a sample record:

```sql
INSERT INTO csv_submissions (
    yatri_id, 
    first_name, 
    last_name, 
    gender, 
    role, 
    mobile_no, 
    age, 
    address
) VALUES (
    'YT001',
    'John',
    'Doe',
    'Male',
    'Participant',
    '+91-9876543210',
    25,
    '123 Main Street, City, State'
);
```

## New Column Structure
Your table now has these columns:
1. **yatri_id** - Unique identifier for each participant
2. **first_name** - First name (required)
3. **last_name** - Last name
4. **gender** - Gender (Male/Female/Other)
5. **role** - Role (Participant/Facilitator)
6. **mobile_no** - Mobile number
7. **age** - Age as integer
8. **address** - Full address as text
9. **submitted_date** - When the record was submitted
10. **created_at** - Record creation timestamp
11. **updated_at** - Last update timestamp

## Important Notes
- ⚠️ **WARNING**: The migration script drops the existing table, which will delete all existing data
- If you have important data, export it first before running the migration
- The new structure is optimized for your CSV format with the specified columns
- All necessary indexes and triggers are created for optimal performance
