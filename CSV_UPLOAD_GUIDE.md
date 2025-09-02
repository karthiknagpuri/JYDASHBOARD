# CSV Upload to Supabase - How It Works

## ✅ Current Implementation Features

Your JY Dashboard **already has** the functionality to:
1. **Upload CSV data to Supabase** when configured
2. **Detect duplicates** using `yatri_id` as the unique identifier
3. **Merge only new data** - skips existing records automatically
4. **Batch processing** - uploads in batches of 100 for performance

## 🔄 How the Upload Process Works

### Step 1: Upload CSV File
When you upload a CSV file through the dashboard:
1. File is validated (must be CSV format, max 10MB)
2. CSV is parsed and data is validated
3. Each row must have: `yatri_id`, `first_name`, `last_name`, and `email`

### Step 2: Duplicate Detection
The system automatically:
1. Fetches all existing `yatri_id` values from Supabase
2. Compares uploaded data against existing IDs
3. Filters out any duplicates found

### Step 3: Data Insertion
Only new records are inserted:
1. New participants are inserted in batches of 100
2. Duplicates are skipped and counted
3. Response shows how many were added vs skipped

## 📊 Example Upload Scenarios

### First Upload (Empty Database)
- Upload: 1000 participants
- Result: 1000 added, 0 skipped
- Database now has: 1000 records

### Second Upload (Same File)
- Upload: Same 1000 participants
- Result: 0 added, 1000 skipped (all duplicates)
- Database still has: 1000 records

### Third Upload (Mixed Data)
- Upload: 1500 participants (500 new + 1000 existing)
- Result: 500 added, 1000 skipped
- Database now has: 1500 records

## 🚀 How to Use

### Prerequisites
1. **Supabase must be configured** with valid credentials in `.env`
2. **Database table must exist** (run `supabase-setup.sql` in Supabase)

### Upload Process
1. Go to http://localhost:3000
2. Login with Admin/zero
3. Click "Upload CSV"
4. Select your CSV file
5. System will automatically:
   - Upload new records to Supabase
   - Skip duplicates
   - Show summary of results

### Response Example
```json
{
  "success": true,
  "message": "CSV processed successfully",
  "total": 1500,
  "success": 500,  // New records added
  "errors": 1,     // Including duplicate count
  "errorDetails": ["Skipped 1000 duplicate participants (already exist)"]
}
```

## 🛡️ Key Features

### Duplicate Prevention
- **Unique Key**: `yatri_id` is used as the unique identifier
- **Automatic Detection**: System checks before inserting
- **No Overwrites**: Existing records are never overwritten
- **Merge Only**: Only new unique records are added

### Data Validation
- Required fields are validated before upload
- Date formats are automatically converted
- Numeric fields are properly parsed
- Gender values are normalized to lowercase

### Performance Optimization
- Batch inserts (100 records at a time)
- Efficient duplicate checking using Sets
- File cleanup after processing
- Error handling and recovery

## 🔍 Monitoring Uploads

### Check Upload Status
After uploading, you can verify:
1. **In Dashboard**: See total participant count increase
2. **In Supabase**: Check Table Editor for new records
3. **Response Messages**: Note the success/skip counts

### Common Messages
- ✅ `"CSV processed successfully"` - Upload completed
- ⚠️ `"Skipped X duplicate participants"` - Duplicates found and skipped
- ❌ `"Database table not found"` - Need to run SQL schema
- ❌ `"Invalid API key"` - Check Supabase credentials

## 🔧 Troubleshooting

### If Duplicates Aren't Being Detected
1. Check that `yatri_id` field exists in CSV
2. Verify `yatri_id` values are unique and consistent
3. Ensure database connection is working

### If Nothing Uploads
1. Check Supabase credentials in `.env`
2. Verify table exists in Supabase
3. Check backend console for error messages

### If Some Records Fail
1. Check CSV for missing required fields
2. Verify date formats are valid
3. Look at `errorDetails` in response

## 📝 Implementation Details

The duplicate detection and merge logic is in:
- **Backend**: `/backend/routes/participants.js` (lines 183-259)
- **Key Code**:
  ```javascript
  // Get existing yatri_ids from database
  const existingIds = new Set(existingParticipants?.map(p => p.yatri_id) || []);
  
  // Filter out duplicates
  participants.forEach(participant => {
    if (!existingIds.has(participant.yatri_id)) {
      newParticipants.push(participant);
    } else {
      duplicateCount++;
    }
  });
  ```

## ✨ Summary

Your system is **already configured** to:
- ✅ Push CSV data to Supabase
- ✅ Detect and skip duplicates
- ✅ Merge only new data
- ✅ Handle batch uploads efficiently
- ✅ Provide detailed upload feedback

No additional code changes needed - just ensure Supabase is properly configured!