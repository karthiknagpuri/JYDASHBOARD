# Supabase Setup Guide for Jagriti Yatra Dashboard

## Steps to Push Data to Supabase

### 1. Create a Supabase Account (if you don't have one)
- Go to https://supabase.com
- Sign up for a free account
- Create a new project

### 2. Get Your Supabase Credentials
Once your project is created:
1. Go to your project dashboard
2. Click on "Settings" (gear icon) in the sidebar
3. Click on "API" under Configuration
4. You'll find:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public**: This is your public key
   - **service_role secret**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Update Your Environment Variables
Edit the file `/Users/karthiknagapuri/Desktop/JY Dashboard/backend/.env`:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Create the Database Tables
1. In your Supabase dashboard, click on "SQL Editor" in the sidebar
2. Click "New query"
3. Copy and paste the entire contents of `/Users/karthiknagapuri/Desktop/JY Dashboard/supabase-setup.sql`
4. Click "Run" to execute the SQL

### 5. Restart the Backend Server
After updating the credentials:

```bash
# Kill the current backend process (Ctrl+C in the terminal running the backend)
# Then restart it:
cd "/Users/karthiknagapuri/Desktop/JY Dashboard/backend"
NODE_ENV=development PORT=5002 node server.js
```

### 6. Test the Upload
1. Go to http://localhost:3000
2. Login with Admin/zero
3. Click "Upload CSV"
4. Select your CSV file
5. The data should now be saved to Supabase!

### 7. Verify Data in Supabase
1. Go to your Supabase dashboard
2. Click on "Table Editor" in the sidebar
3. Select the `participants_csv` table
4. You should see your uploaded data!

## Troubleshooting

### If you get "Invalid API key" error:
- Double-check that you copied the service_role key (not the anon key)
- Make sure there are no extra spaces or quotes in the .env file
- Ensure the URL starts with `https://` and ends with `.supabase.co`

### If the table doesn't create:
- Make sure you're running the SQL in the correct project
- Check for any error messages in the SQL editor
- Try running the SQL commands one section at a time

### If data doesn't upload:
- Check the browser console for errors (F12 → Console tab)
- Check the backend terminal for error messages
- Ensure the CSV file format matches the expected columns

## Current Table Structure
The `participants_csv` table includes:
- yatri_id (unique identifier)
- yatri_type (participant/facilitator)
- first_name, last_name
- email, contact_number
- date_of_birth, gender
- address, country, state, district
- education, status, institute
- scholarship_total_amount_paid
- And many more fields...

## Important Notes
- The backend will automatically detect duplicate `yatri_id` values and skip them
- Data is processed in batches of 100 records for better performance
- The service_role key gives full access to your database - keep it secret!
- Never commit the .env file to Git (it's already in .gitignore)