# CSV Submissions Setup Guide

## Overview
The CSV Submissions feature allows you to upload and manage 7000+ participant records efficiently with batch processing, filtering, and export capabilities.

## Features
- ✅ Upload CSV files with 7000+ records
- ✅ Batch processing (500 records at a time)
- ✅ Duplicate detection
- ✅ Real-time progress tracking
- ✅ Advanced filtering (search, role, gender)
- ✅ Pagination (50 records per page)
- ✅ Export to CSV
- ✅ Detailed view for each submission
- ✅ Statistics dashboard

## Database Setup

### Step 1: Create the Table in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from `create_csv_submissions_table.sql`
4. Click "Run" to execute the SQL

### Step 2: Verify Table Creation

1. Go to Table Editor in Supabase
2. You should see a new table called `csv_submissions`
3. Verify the columns match the CSV format

## CSV Format

Your CSV file should have the following columns:

```csv
Submitted Section,Yatra ID,First Name,Last Name,Gender,Role,Mobile No,Age,Address,Submitted Date
```

### Column Details:
- **Submitted Section**: Section/location of submission
- **Yatra ID**: Unique identifier (required)
- **First Name**: Participant's first name (required)
- **Last Name**: Participant's last name
- **Gender**: Male/Female/Other
- **Role**: Participant/Facilitator
- **Mobile No**: Contact number
- **Age**: Participant's age (integer)
- **Address**: Full address
- **Submitted Date**: Date of submission (YYYY-MM-DD format)

## How to Use

### Uploading CSV Files

1. Navigate to the Dashboard
2. Click on "CSV Submissions" tab
3. Click "Upload CSV" button
4. Select your CSV file (up to 7000+ records)
5. Wait for the upload progress to complete
6. System will show:
   - Number of records uploaded
   - Number of duplicates skipped
   - Any errors encountered

### Viewing Submissions

1. Data is displayed in a paginated table (50 records per page)
2. Use pagination controls to navigate through pages
3. Click the eye icon to view detailed information for any record

### Filtering Data

1. **Search**: Type in the search box to filter by:
   - Name (first or last)
   - Yatra ID
   - Mobile number
   - Address

2. **Role Filter**: Select from dropdown:
   - All Roles
   - Participants only
   - Facilitators only

3. **Gender Filter**: Select from dropdown:
   - All Genders
   - Male
   - Female
   - Other

### Exporting Data

1. Apply any filters you need
2. Click "Export" button
3. A CSV file will be downloaded with the filtered data

## Performance Considerations

- The system handles large datasets efficiently with:
  - Batch processing (500 records at a time)
  - Indexed database columns for fast queries
  - Pagination to limit displayed records
  - Client-side caching for better performance

## Troubleshooting

### Common Issues:

1. **"No valid data found in CSV"**
   - Check CSV format matches the required columns
   - Ensure Yatra ID and First Name are present

2. **"All records already exist"**
   - System prevents duplicates based on Yatra ID
   - Check if records were previously uploaded

3. **Upload seems slow**
   - Large files are processed in batches
   - Progress bar shows current status
   - 7000+ records typically take 30-60 seconds

## Sample CSV

A sample CSV file is provided: `sample_submissions.csv`

You can use this to test the upload functionality.

## Technical Details

- **Frontend**: React component with hooks
- **Database**: Supabase PostgreSQL
- **Batch Size**: 500 records per batch
- **Page Size**: 50 records per page
- **Indexes**: On yatra_id, role, gender, submitted_date, and name fields