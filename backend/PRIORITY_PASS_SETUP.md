# Priority Pass Table Setup Guide

## Overview
The Priority Pass table is a separate table in Supabase with the same schema as the `participants_csv` table. This allows you to manage a distinct set of priority participants while maintaining the same data structure.

## Setup Instructions

### Option 1: Using Supabase SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire SQL from `backend/migrations/create_priority_pass_table.sql`
5. Paste it in the SQL Editor
6. Click **Run** to execute the SQL
7. You should see a success message confirming the table creation

### Option 2: Using the Node.js Script
1. Ensure your `.env` file has the correct Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional but recommended)
   ```

2. Run the creation script:
   ```bash
   cd backend
   node scripts/createPriorityPassTable.js
   ```

### Option 3: Manual Creation in Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Click **New Table**
4. Name it `priority_pass`
5. Add all the columns as defined in the SQL file

## Table Schema

The Priority Pass table includes the following columns:
- `id` (UUID, Primary Key)
- `yatri_id` (String, Unique)
- `yatri_type` (String)
- `first_name` (String)
- `last_name` (String)
- `email` (String)
- `dial_code` (String)
- `contact_number` (String)
- `date_of_birth` (Date)
- `gender` (String)
- `address` (Text)
- `country` (String)
- `state` (String)
- `district` (String)
- `education` (String)
- `status` (String)
- `institute` (Text)
- `area_of_interest` (Text)
- `area_of_interest_2` (Text)
- `profile` (Text)
- `application_submitted_on` (Timestamp)
- `yatri_annual_income` (Decimal)
- `selected_date` (Date)
- `scholarship_total_amount_paid` (Decimal)
- `payment_date` (Date)
- `payment_id` (String)
- `designation` (String)
- `source` (String)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## API Endpoints

Once the table is created and the server is running, you can use these endpoints:

### Get All Priority Pass Entries
```
GET /api/priority-pass
```

### Get Single Priority Pass Entry
```
GET /api/priority-pass/:id
```

### Add Priority Pass Entry
```
POST /api/priority-pass
Content-Type: application/json

{
  "yatri_id": "PP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  // ... other fields
}
```

### Update Priority Pass Entry
```
PUT /api/priority-pass/:id
Content-Type: application/json

{
  "status": "VIP",
  // ... fields to update
}
```

### Delete Priority Pass Entry
```
DELETE /api/priority-pass/:id
```

### Bulk Import via CSV
```
POST /api/priority-pass/upload-csv
Content-Type: multipart/form-data

csv: [file]
```

## Row Level Security (RLS)

The table has RLS enabled with two policies:
1. **Authenticated users**: Full access (read, write, update, delete)
2. **Public users**: Read-only access

To modify these policies, update them in the Supabase dashboard under:
**Authentication > Policies > priority_pass**

## Indexes

The following indexes are created for optimal query performance:
- `yatri_id` (for unique lookups)
- `email` (for email searches)
- `state` (for state-based filtering)
- `district` (for district-based filtering)
- `status` (for status filtering)
- `created_at` (for sorting by creation date)

## Testing the Setup

After creating the table, you can test it:

1. **Via API**:
   ```bash
   # Get all entries (should return empty array initially)
   curl http://localhost:5000/api/priority-pass
   ```

2. **Via Supabase Dashboard**:
   - Go to Table Editor
   - Select `priority_pass` table
   - You should see the empty table with all columns

## Troubleshooting

### Table creation fails
- Ensure you have the correct permissions in Supabase
- Check that the table doesn't already exist
- Verify your Supabase credentials in `.env`

### API endpoints return 404
- Make sure the backend server is running
- Check that the routes are properly registered in `server.js`
- Verify the table exists in Supabase

### RLS blocking access
- Check your authentication status
- Review the RLS policies in Supabase
- Ensure your API key has proper permissions

## Next Steps

1. Create a frontend interface for Priority Pass management (similar to the Add Yatri modal)
2. Add Priority Pass specific analytics and reporting
3. Implement Priority Pass-specific business logic if needed
4. Set up automated workflows for Priority Pass participants