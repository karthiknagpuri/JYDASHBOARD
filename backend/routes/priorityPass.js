const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');
const router = express.Router();

// Configure multer for file uploads (same as participants)
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
    cb(null, 'priority-pass-' + uniqueSuffix + '.csv');
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

// CSV column mapping (same as participants)
const columnMapping = {
  'Yatri Id': 'yatri_id',
  'Yatri Type': 'yatri_type',
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Email': 'email',
  'Dial Code': 'dial_code',
  'Contact Number': 'contact_number',
  'DOB': 'date_of_birth',
  'Gender': 'gender',
  'Address': 'address',
  'Country': 'country',
  'State': 'state',
  'District': 'district',
  'Education': 'education',
  'Status': 'status',
  'Institute': 'institute',
  'Area Of Interest': 'area_of_interest',
  'Area Of Interest2': 'area_of_interest_2',
  'Profile': 'profile',
  'Application Submitted On': 'application_submitted_on',
  'Yatri Annual Income': 'yatri_annual_income',
  'Selected Date': 'selected_date',
  'Scholarship Total Amount Paid': 'scholarship_total_amount_paid',
  'Payment Date': 'payment_date',
  'Payment ID': 'payment_id',
  'Designation': 'designation',
  'Source': 'source'
};

// Parse and validate priority pass data (same logic as participants)
const parsePriorityPassData = (row) => {
  const priorityPass = {};
  
  // Map CSV columns to database columns
  Object.keys(columnMapping).forEach(csvColumn => {
    const dbColumn = columnMapping[csvColumn];
    const value = row[csvColumn];
    
    if (value !== undefined && value !== null && value !== '') {
      priorityPass[dbColumn] = value.toString().trim();
    }
  });

  // Convert date strings to proper format with better validation
  if (priorityPass.date_of_birth) {
    try {
      const date = new Date(priorityPass.date_of_birth);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        priorityPass.date_of_birth = date.toISOString().split('T')[0];
      } else {
        priorityPass.date_of_birth = null;
      }
    } catch (e) {
      priorityPass.date_of_birth = null;
    }
  }

  if (priorityPass.application_submitted_on) {
    try {
      const date = new Date(priorityPass.application_submitted_on);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        priorityPass.application_submitted_on = date.toISOString();
      } else {
        priorityPass.application_submitted_on = null;
      }
    } catch (e) {
      priorityPass.application_submitted_on = null;
    }
  }

  if (priorityPass.selected_date) {
    try {
      const date = new Date(priorityPass.selected_date);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        priorityPass.selected_date = date.toISOString().split('T')[0];
      } else {
        priorityPass.selected_date = null;
      }
    } catch (e) {
      priorityPass.selected_date = null;
    }
  }

  if (priorityPass.payment_date) {
    try {
      const date = new Date(priorityPass.payment_date);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        priorityPass.payment_date = date.toISOString().split('T')[0];
      } else {
        priorityPass.payment_date = null;
      }
    } catch (e) {
      priorityPass.payment_date = null;
    }
  }

  // Convert numeric fields
  if (priorityPass.yatri_annual_income) {
    priorityPass.yatri_annual_income = parseFloat(priorityPass.yatri_annual_income) || 0;
  }

  if (priorityPass.scholarship_total_amount_paid) {
    priorityPass.scholarship_total_amount_paid = parseFloat(priorityPass.scholarship_total_amount_paid) || 0;
  }

  // Clean up gender values
  if (priorityPass.gender) {
    priorityPass.gender = priorityPass.gender.toLowerCase();
  }

  // Add created timestamp
  priorityPass.created_at = new Date().toISOString();

  return priorityPass;
};

// In-memory storage for demo mode
let inMemoryPriorityPass = [];

// Get all priority pass entries
router.get('/', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.json({
        priorityPass: inMemoryPriorityPass,
        total: inMemoryPriorityPass.length,
        message: 'Running in demo mode - using in-memory storage'
      });
    }

    // Fetch all priority pass entries
    const { data, error } = await supabase
      .from('priority_pass')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      priorityPass: data || [],
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching priority pass entries:', error);
    res.status(500).json({
      message: 'Error fetching priority pass entries',
      error: error.message
    });
  }
});

// Get priority pass entry by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      const entry = inMemoryPriorityPass.find(p => p.id === req.params.id || p.yatri_id === req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'Priority pass entry not found' });
      }
      return res.json(entry);
    }

    const { data, error } = await supabase
      .from('priority_pass')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Priority pass entry not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching priority pass entry:', error);
    res.status(500).json({
      message: 'Error fetching priority pass entry',
      error: error.message
    });
  }
});

// Add single priority pass entry
router.post('/', async (req, res) => {
  try {
    const priorityPassData = parsePriorityPassData(req.body);
    
    // Basic validation
    if (!priorityPassData.yatri_id) {
      return res.status(400).json({ message: 'Yatri ID is required' });
    }

    if (!priorityPassData.first_name || !priorityPassData.last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    if (!priorityPassData.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isConfigured) {
      // Demo mode - store in memory
      priorityPassData.id = Date.now().toString();
      inMemoryPriorityPass.push(priorityPassData);
      return res.json({
        success: true,
        data: priorityPassData,
        message: 'Priority pass entry added (demo mode)'
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('priority_pass')
      .insert([priorityPassData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Priority pass entry added successfully'
    });
  } catch (error) {
    console.error('Error adding priority pass entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding priority pass entry',
      error: error.message
    });
  }
});

// Update priority pass entry
router.put('/:id', async (req, res) => {
  try {
    const updates = parsePriorityPassData(req.body);
    delete updates.created_at; // Don't update created_at
    updates.updated_at = new Date().toISOString();

    if (!isConfigured) {
      // Demo mode - update in memory
      const index = inMemoryPriorityPass.findIndex(p => p.id === req.params.id || p.yatri_id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Priority pass entry not found' });
      }
      inMemoryPriorityPass[index] = { ...inMemoryPriorityPass[index], ...updates };
      return res.json({
        success: true,
        data: inMemoryPriorityPass[index],
        message: 'Priority pass entry updated (demo mode)'
      });
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('priority_pass')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Priority pass entry not found' });
    }

    res.json({
      success: true,
      data: data,
      message: 'Priority pass entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating priority pass entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating priority pass entry',
      error: error.message
    });
  }
});

// Delete priority pass entry
router.delete('/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      // Demo mode - delete from memory
      const index = inMemoryPriorityPass.findIndex(p => p.id === req.params.id || p.yatri_id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Priority pass entry not found' });
      }
      inMemoryPriorityPass.splice(index, 1);
      return res.json({
        success: true,
        message: 'Priority pass entry deleted (demo mode)'
      });
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('priority_pass')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Priority pass entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting priority pass entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting priority pass entry',
      error: error.message
    });
  }
});

// Upload CSV for bulk import
router.post('/upload-csv', upload.single('csv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No CSV file uploaded' });
  }

  const filePath = req.file.path;
  const priorityPassEntries = [];
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
            const entry = parsePriorityPassData(row);
            
            // Basic validation
            if (!entry.yatri_id) {
              errors.push(`Row missing Yatri ID: ${JSON.stringify(row)}`);
              return;
            }

            if (!entry.first_name || !entry.last_name) {
              errors.push(`Row ${entry.yatri_id}: Missing name information`);
              return;
            }

            if (!entry.email) {
              errors.push(`Row ${entry.yatri_id}: Missing email`);
              return;
            }

            priorityPassEntries.push(entry);
          } catch (error) {
            errors.push(`Row parsing error: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`CSV parsed: ${rowCount} total rows read, ${priorityPassEntries.length} valid, ${errors.length} errors`);
    
    // Store data
    if (priorityPassEntries.length > 0) {
      let newEntries = [];
      let duplicateCount = 0;

      if (isConfigured) {
        try {
          // Get existing yatri_ids
          const { data: existingEntries, error: fetchError } = await supabase
            .from('priority_pass')
            .select('yatri_id');

          if (fetchError && fetchError.code !== '42P01') {
            console.error('Error fetching existing priority pass entries:', fetchError);
            errors.push(`Database fetch error: ${fetchError.message}`);
          }

          const existingIds = new Set(existingEntries?.map(p => p.yatri_id) || []);
          
          // Filter out duplicates
          priorityPassEntries.forEach(entry => {
            if (!existingIds.has(entry.yatri_id)) {
              newEntries.push(entry);
            } else {
              duplicateCount++;
            }
          });
          
          console.log(`Filtered: ${newEntries.length} new, ${duplicateCount} duplicates`);

          // Insert in batches
          const batchSize = 30;
          const insertedEntries = [];

          for (let i = 0; i < newEntries.length; i += batchSize) {
            const batch = newEntries.slice(i, i + batchSize);
            console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
            
            try {
              const { data, error } = await supabase
                .from('priority_pass')
                .insert(batch)
                .select();

              if (error) {
                console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
                errors.push(`Batch error: ${error.message}`);
                
                // Try inserting one by one if batch fails
                console.log('Attempting individual inserts for failed batch...');
                for (const entry of batch) {
                  try {
                    const { data: singleData, error: singleError } = await supabase
                      .from('priority_pass')
                      .insert([entry])
                      .select();
                    
                    if (singleError) {
                      console.error(`Failed to insert ${entry.yatri_id}:`, singleError.message);
                      errors.push(`Failed ${entry.yatri_id}: ${singleError.message}`);
                    } else if (singleData && singleData.length > 0) {
                      insertedEntries.push(...singleData);
                    }
                  } catch (e) {
                    console.error(`Exception inserting ${entry.yatri_id}:`, e.message);
                    errors.push(`Exception ${entry.yatri_id}: ${e.message}`);
                  }
                }
              } else if (data && data.length > 0) {
                console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful: ${data.length} records inserted`);
                insertedEntries.push(...data);
              }
            } catch (batchError) {
              console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
              errors.push(`Batch error: ${batchError.message}`);
            }
          }
          
          console.log(`📊 Total successfully inserted: ${insertedEntries.length} out of ${newEntries.length} attempted`);
          newEntries = insertedEntries.length > 0 ? insertedEntries : newEntries;
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          errors.push(`Database operation failed: ${dbError.message}`);
        }
      } else {
        // Demo mode
        const existingIds = new Set(inMemoryPriorityPass.map(p => p.yatri_id));
        
        priorityPassEntries.forEach(entry => {
          if (!existingIds.has(entry.yatri_id)) {
            newEntries.push(entry);
            inMemoryPriorityPass.push(entry);
          } else {
            duplicateCount++;
          }
        });

        console.log(`Stored ${newEntries.length} new entries in memory (demo mode)`);
        if (duplicateCount > 0) {
          console.log(`Skipped ${duplicateCount} duplicate entries`);
        }
      }

      if (duplicateCount > 0) {
        errors.push(`Skipped ${duplicateCount} duplicate entries (already exist)`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'CSV processed successfully',
      total: priorityPassEntries.length + errors.length,
      success: priorityPassEntries.length,
      errors: errors.length,
      priorityPassEntries: priorityPassEntries,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : []
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

module.exports = router;