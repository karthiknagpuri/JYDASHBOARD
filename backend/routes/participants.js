const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'participants-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// CSV column mapping with support for multiple formats
const columnMapping = {
  'Yatri Id': 'yatri_id',
  'yatri_id': 'yatri_id',
  'YatriId': 'yatri_id',
  'ID': 'yatri_id',
  
  'Yatri Type': 'yatri_type',
  'First Name': 'first_name',
  'first_name': 'first_name',
  'FirstName': 'first_name',
  
  'Last Name': 'last_name', 
  'last_name': 'last_name',
  'LastName': 'last_name',
  
  'Email': 'email',
  'email': 'email',
  'EmailAddress': 'email',
  
  'Dial Code': 'dial_code',
  'Contact Number': 'contact_number',
  'Mobile No': 'contact_number',
  'mobile_no': 'contact_number',
  'Phone': 'contact_number',
  
  'DOB': 'date_of_birth',
  'Date of Birth': 'date_of_birth',
  
  'Gender': 'gender',
  'gender': 'gender',
  
  'Address': 'address',
  'address': 'address',
  
  'Country': 'country',
  'State': 'state',
  'District': 'district',
  
  'Education': 'education',
  'Status': 'status',
  'Institute': 'institute',
  
  'Area Of Interest': 'area_of_interest',
  'Area Of Interest2': 'area_of_interest_2',
  
  'Profile': 'profile',
  'Role': 'role',
  'role': 'role',
  
  'Application Submitted On': 'application_submitted_on',
  'Yatri Annual Income': 'yatri_annual_income',
  'Selected Date': 'selected_date',
  'Scholarship Total Amount Paid': 'scholarship_total_amount_paid',
  'Payment Date': 'payment_date',
  'Payment ID': 'payment_id',
  'Designation': 'designation',
  'Source': 'source',
  
  // Additional mappings for flexibility
  'Preference 1': 'preference_1',
  'Preference 2': 'preference_2',
  '12 Digit Aaadhaar': 'aadhaar'
};

// Parse and validate participant data
const parseParticipantData = (row) => {
  const participant = {};
  
  // Map CSV columns to database columns
  Object.keys(columnMapping).forEach(csvColumn => {
    const dbColumn = columnMapping[csvColumn];
    const value = row[csvColumn];
    
    if (value !== undefined && value !== null && value !== '') {
      participant[dbColumn] = value.toString().trim();
    }
  });

  // Convert date strings to proper format with support for DD-MM-YYYY
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Try DD-MM-YYYY format first
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length <= 2) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
      // Otherwise try standard date parsing
      return new Date(dateStr);
    } catch (e) {
      return null;
    }
  };

  if (participant.date_of_birth) {
    const date = parseDate(participant.date_of_birth);
    participant.date_of_birth = date ? date.toISOString().split('T')[0] : null;
  }

  if (participant.application_submitted_on) {
    const date = parseDate(participant.application_submitted_on);
    participant.application_submitted_on = date ? date.toISOString() : null;
  }

  if (participant.selected_date) {
    const date = parseDate(participant.selected_date);
    participant.selected_date = date ? date.toISOString().split('T')[0] : null;
  }

  if (participant.payment_date) {
    const date = parseDate(participant.payment_date);
    participant.payment_date = date ? date.toISOString().split('T')[0] : null;
  }

  // Convert numeric fields
  if (participant.yatri_annual_income) {
    participant.yatri_annual_income = parseFloat(participant.yatri_annual_income) || 0;
  }

  if (participant.scholarship_total_amount_paid) {
    participant.scholarship_total_amount_paid = parseFloat(participant.scholarship_total_amount_paid) || 0;
  }

  // Clean up gender values
  if (participant.gender) {
    participant.gender = participant.gender.toLowerCase();
  }

  // Add created timestamp
  participant.created_at = new Date().toISOString();

  return participant;
};

// Upload CSV endpoint
router.post('/upload-csv', upload.single('csv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded' });
  }

  const filePath = req.file.path;
  const participants = [];
  const errors = [];

  try {
    // Read and parse CSV file
    let rowCount = 0;
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          try {
            const participant = parseParticipantData(row);
            
            // Basic validation - only require yatri_id
            if (!participant.yatri_id) {
              errors.push(`Row ${rowCount}: Missing Yatri ID`);
              return;
            }

            participants.push(participant);
          } catch (error) {
            errors.push(`Row parsing error: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Log parsing results
    console.log(`CSV parsed: ${rowCount} total rows read, ${participants.length} valid, ${errors.length} errors`);
    
    // Store data (either in Supabase or in-memory for demo) - merge unique only
    if (participants.length > 0) {
      let newParticipants = [];
      let duplicateCount = 0;

      if (isConfigured) {
        try {
          // Get ALL existing yatri_ids from database
          // Fetch all records without pagination - Supabase returns all by default
          const { data: existingParticipants, error: fetchError } = await supabase
            .from('participants_csv')
            .select('yatri_id');

          if (fetchError && fetchError.code !== '42P01') {
            console.error('Error fetching existing participants:', fetchError);
            errors.push(`Database fetch error: ${fetchError.message}`);
          }
          console.log(`Checking ${participants.length} records against ${existingParticipants ? existingParticipants.length : 0} existing records`);

          const existingIds = new Set(existingParticipants?.map(p => p.yatri_id) || []);
          
          // Filter out duplicates
          participants.forEach(participant => {
            if (!existingIds.has(participant.yatri_id)) {
              newParticipants.push(participant);
            } else {
              duplicateCount++;
            }
          });
          
          console.log(`Filtered: ${newParticipants.length} new, ${duplicateCount} duplicates`);

          // Insert only new participants in smaller batches to avoid Supabase limits
          const batchSize = 30; // Reduced from 100 to avoid issues
          const insertedParticipants = [];

          for (let i = 0; i < newParticipants.length; i += batchSize) {
            const batch = newParticipants.slice(i, i + batchSize);
            console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records (${batch[0].yatri_id} to ${batch[batch.length-1].yatri_id})`);
            
            try {
              const { data, error } = await supabase
                .from('participants_csv')
                .insert(batch)
                .select();

              if (error) {
                console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
                
                // Try inserting one by one if batch fails
                console.log('Attempting individual inserts for failed batch...');
                for (const participant of batch) {
                  try {
                    const { data: singleData, error: singleError } = await supabase
                      .from('participants_csv')
                      .insert([participant])
                      .select();
                    
                    if (singleError) {
                      console.error(`Failed to insert ${participant.yatri_id}:`, singleError.message);
                      errors.push(`Failed ${participant.yatri_id}: ${singleError.message}`);
                    } else if (singleData && singleData.length > 0) {
                      insertedParticipants.push(...singleData);
                    }
                  } catch (e) {
                    console.error(`Exception inserting ${participant.yatri_id}:`, e.message);
                  }
                }
              } else if (data && data.length > 0) {
                console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful: ${data.length} records inserted`);
                insertedParticipants.push(...data);
              } else {
                console.log(`⚠️ Batch ${Math.floor(i/batchSize) + 1}: No data returned (possible silent failure)`);
              }
            } catch (batchError) {
              console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
              errors.push(`Batch error: ${batchError.message}`);
            }
          }
          
          console.log(`📊 Total successfully inserted: ${insertedParticipants.length} out of ${newParticipants.length} attempted`);

          newParticipants = insertedParticipants.length > 0 ? insertedParticipants : newParticipants;
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          errors.push(`Database operation failed: ${dbError.message}`);
        }
      } else {
        // Demo mode - merge unique participants in memory
        const existingIds = new Set(inMemoryParticipants.map(p => p.yatri_id));
        
        participants.forEach(participant => {
          if (!existingIds.has(participant.yatri_id)) {
            newParticipants.push(participant);
            inMemoryParticipants.push(participant);
          } else {
            duplicateCount++;
          }
        });

        console.log(`Stored ${newParticipants.length} new participants in memory (demo mode)`);
        if (duplicateCount > 0) {
          console.log(`Skipped ${duplicateCount} duplicate participants`);
        }
      }

      // Update response to reflect actual new participants added
      participants.length = 0;
      participants.push(...newParticipants);

      if (duplicateCount > 0) {
        errors.push(`Skipped ${duplicateCount} duplicate participants (already exist)`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'CSV processed successfully',
      total: participants.length + errors.length,
      success: participants.length,
      errors: errors.length,
      participants: participants,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : [] // Return only first 10 errors
    });

  } catch (error) {
    console.error('CSV processing error:', error);
    
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing CSV file',
      error: error.message
    });
  }
});

// In-memory storage for demo mode
let inMemoryParticipants = [];

// Get all participants
router.get('/', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.json({
        participants: inMemoryParticipants,
        total: inMemoryParticipants.length,
        message: 'Running in demo mode - using in-memory storage'
      });
    }

    // Fetch all participants - Supabase returns all by default
    const { data, error } = await supabase
      .from('participants_csv')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      participants: data || [],
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      message: 'Error fetching participants',
      error: error.message
    });
  }
});

// Get participant by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      const participant = inMemoryParticipants.find(p => p.id === req.params.id || p.yatri_id === req.params.id);
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
      return res.json(participant);
    }

    const { data, error } = await supabase
      .from('participants_csv')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({
      message: 'Error fetching participant',
      error: error.message
    });
  }
});

module.exports = router;