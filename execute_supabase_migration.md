# Supabase Table Creation Instructions

## Table: submissions

This table is designed to store 7000+ application submission records for Jagriti Yatra.

## Steps to Create the Table in Supabase:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor (usually in the left sidebar)

2. **Execute the Migration**
   - Copy the entire contents of `supabase_migrations/create_submissions_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Verify Table Creation**
   - Go to Table Editor in the dashboard
   - You should see the new `submissions` table
   - Check that all columns are created correctly

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
cd "/Users/karthiknagapuri/Desktop/JY Dashboard"

# Initialize Supabase if not already done
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Run the migration
npx supabase db push < supabase_migrations/create_submissions_table.sql
```

### Option 3: Using pgAdmin or psql

```bash
# Using psql command line
psql -h db.your-project-ref.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f supabase_migrations/create_submissions_table.sql
```

## Table Features:

### Main Columns:
- **Personal Information**: name, email, phone, gender, DOB, age
- **Address**: Complete address with city, state, pincode
- **Education**: education level, institution, field of study
- **Professional**: occupation, organization, experience, income
- **Application**: status, submission date, review details
- **Selection**: selected status, date, round, waitlist
- **Payment**: payment status, amount, transaction details, scholarship
- **Yatra Info**: yatri type, batch, coach, seat, boarding point
- **Geographical**: tier category (Tier 1/2&3/4/Rural&Tribal)
- **Source/Campaign**: UTM parameters, referral codes
- **Documents**: ID proof, verification status
- **Metadata**: timestamps, import batch, data quality score

### Special Features:
- **JSONB fields** for flexibility (custom_fields, raw_data)
- **Indexes** on frequently queried columns for performance
- **RLS (Row Level Security)** enabled for security
- **Auto-updating timestamps** via triggers
- **Statistics View** for quick dashboard metrics

## After Table Creation:

1. **Test the Table**
   ```sql
   -- Insert a test record
   INSERT INTO submissions (
     application_id,
     full_name,
     email,
     phone,
     tier_category,
     yatri_type
   ) VALUES (
     'TEST001',
     'Test User',
     'test@example.com',
     '9999999999',
     'Tier 1',
     'participant'
   );
   
   -- Check if it worked
   SELECT * FROM submissions WHERE application_id = 'TEST001';
   
   -- Check statistics view
   SELECT * FROM submission_statistics;
   
   -- Delete test record
   DELETE FROM submissions WHERE application_id = 'TEST001';
   ```

2. **Update Environment Variables** (if needed)
   Make sure your `.env` file has:
   ```
   REACT_APP_SUPABASE_URL=your-project-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Set Permissions** (if needed)
   - Go to Authentication > Policies in Supabase Dashboard
   - Review and adjust the RLS policies as needed
   - For testing, you might temporarily disable RLS:
   ```sql
   ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
   ```

## CSV Import Preparation:

The table is ready to handle bulk CSV imports with:
- `import_batch_id` to track different import sessions
- `imported_from` to record the source file
- `raw_data` JSONB field to store original CSV data
- `data_quality_score` to track data completeness

## Performance Considerations:

- Table can handle 7000+ records efficiently
- Indexes are created on commonly queried fields
- Use the `submission_statistics` view for dashboard metrics
- JSONB fields allow flexibility for varying CSV formats

## Next Steps:

1. Create the table using one of the methods above
2. Test with a small sample of data
3. Build the CSV upload component in the frontend
4. Implement bulk import functionality