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
    cb(null, 'screenshot-pending-' + uniqueSuffix + '.csv');
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

// CSV column mapping for screenshot pending
const columnMapping = {
  'Yatra ID': 'yatra_id',
  'Yatri Id': 'yatra_id', // Alternative spelling
  'Yatra Id': 'yatra_id', // Alternative spelling
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Mobile No': 'mobile_no',
  'Mobile Number': 'mobile_no', // Alternative
  'Contact Number': 'mobile_no', // Alternative
  'Phone': 'mobile_no', // Alternative
  'Email ID': 'email_id',
  'Email': 'email_id', // Alternative
  'Gender': 'gender',
  'Selector Score': 'selector_score',
  'Score': 'selector_score', // Alternative
  'Screenshot Status': 'screenshot_status',
  'Status': 'screenshot_status', // Alternative
  'Screenshot URL': 'screenshot_url',
  'URL': 'screenshot_url', // Alternative
  'Notes': 'notes',
  'Comments': 'notes' // Alternative
};

// Parse and validate screenshot pending data
const parseScreenshotData = (row) => {
  const screenshotData = {};
  
  // Map CSV columns to database columns
  Object.keys(columnMapping).forEach(csvColumn => {
    const dbColumn = columnMapping[csvColumn];
    const value = row[csvColumn];
    
    if (value !== undefined && value !== null && value !== '') {
      // Avoid duplicate values if alternative column names exist
      if (!screenshotData[dbColumn]) {
        screenshotData[dbColumn] = value.toString().trim();
      }
    }
  });

  // Convert numeric fields
  if (screenshotData.selector_score) {
    screenshotData.selector_score = parseFloat(screenshotData.selector_score) || 0;
  }

  // Clean up gender values
  if (screenshotData.gender) {
    screenshotData.gender = screenshotData.gender.toLowerCase();
  }

  // Set default status if not provided
  if (!screenshotData.screenshot_status) {
    screenshotData.screenshot_status = 'pending';
  }

  // Add created timestamp
  screenshotData.created_at = new Date().toISOString();

  return screenshotData;
};

// In-memory storage for demo mode
let inMemoryScreenshots = [];

// Get all screenshot pending entries
router.get('/', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.json({
        screenshots: inMemoryScreenshots,
        total: inMemoryScreenshots.length,
        message: 'Running in demo mode - using in-memory storage'
      });
    }

    // Fetch all screenshot pending entries
    const { data, error } = await supabase
      .from('screenshot_pending')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return res.json({
          screenshots: [],
          total: 0,
          message: 'Screenshot pending table not yet created in Supabase'
        });
      }
      throw error;
    }

    res.json({
      screenshots: data || [],
      total: data ? data.length : 0,
      pending: data ? data.filter(s => s.screenshot_status === 'pending').length : 0,
      submitted: data ? data.filter(s => s.screenshot_status === 'submitted').length : 0,
      verified: data ? data.filter(s => s.screenshot_status === 'verified').length : 0
    });
  } catch (error) {
    console.error('Error fetching screenshot pending entries:', error);
    res.status(500).json({
      message: 'Error fetching screenshot pending entries',
      error: error.message
    });
  }
});

// Get screenshot pending entry by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      const entry = inMemoryScreenshots.find(s => 
        s.id === req.params.id || 
        s.yatra_id === req.params.id
      );
      if (!entry) {
        return res.status(404).json({ message: 'Screenshot pending entry not found' });
      }
      return res.json(entry);
    }

    const { data, error } = await supabase
      .from('screenshot_pending')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Screenshot pending entry not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching screenshot pending entry:', error);
    res.status(500).json({
      message: 'Error fetching screenshot pending entry',
      error: error.message
    });
  }
});

// Add single screenshot pending entry
router.post('/', async (req, res) => {
  try {
    const screenshotData = parseScreenshotData(req.body);
    
    // Basic validation
    if (!screenshotData.yatra_id) {
      return res.status(400).json({ message: 'Yatra ID is required' });
    }

    if (!isConfigured) {
      // Demo mode - store in memory
      screenshotData.id = Date.now().toString();
      inMemoryScreenshots.push(screenshotData);
      return res.json({
        success: true,
        data: screenshotData,
        message: 'Screenshot pending entry added (demo mode)'
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('screenshot_pending')
      .insert([screenshotData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Screenshot pending entry added successfully'
    });
  } catch (error) {
    console.error('Error adding screenshot pending entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding screenshot pending entry',
      error: error.message
    });
  }
});

// Update screenshot pending entry (e.g., when screenshot is submitted)
router.put('/:id', async (req, res) => {
  try {
    const updates = parseScreenshotData(req.body);
    delete updates.created_at; // Don't update created_at
    updates.updated_at = new Date().toISOString();

    if (!isConfigured) {
      // Demo mode - update in memory
      const index = inMemoryScreenshots.findIndex(s => 
        s.id === req.params.id || s.yatra_id === req.params.id
      );
      if (index === -1) {
        return res.status(404).json({ message: 'Screenshot pending entry not found' });
      }
      inMemoryScreenshots[index] = { ...inMemoryScreenshots[index], ...updates };
      return res.json({
        success: true,
        data: inMemoryScreenshots[index],
        message: 'Screenshot pending entry updated (demo mode)'
      });
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('screenshot_pending')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Screenshot pending entry not found' });
    }

    res.json({
      success: true,
      data: data,
      message: 'Screenshot pending entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating screenshot pending entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating screenshot pending entry',
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
  const screenshots = [];
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
            const screenshotData = parseScreenshotData(row);
            
            // Basic validation
            if (!screenshotData.yatra_id) {
              errors.push(`Row ${rowCount}: Missing Yatra ID`);
              return;
            }

            screenshots.push(screenshotData);
          } catch (error) {
            errors.push(`Row ${rowCount} parsing error: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`CSV parsed: ${rowCount} total rows read, ${screenshots.length} valid, ${errors.length} errors`);
    
    // Store data
    if (screenshots.length > 0) {
      let newScreenshots = [];
      let duplicateCount = 0;

      if (isConfigured) {
        try {
          // Check if table exists first
          const { error: tableCheckError } = await supabase
            .from('screenshot_pending')
            .select('id')
            .limit(1);

          if (tableCheckError && tableCheckError.code === '42P01') {
            // Table doesn't exist, return error with instructions
            return res.status(400).json({
              success: false,
              message: 'Screenshot pending table not found. Please create the table first using the SQL migration.',
              sqlFile: '/backend/migrations/create_screenshot_pending_table.sql'
            });
          }

          // Get existing yatra_ids
          const { data: existingEntries, error: fetchError } = await supabase
            .from('screenshot_pending')
            .select('yatra_id');

          if (fetchError && fetchError.code !== '42P01') {
            console.error('Error fetching existing screenshot entries:', fetchError);
            errors.push(`Database fetch error: ${fetchError.message}`);
          }

          const existingIds = new Set(existingEntries?.map(s => s.yatra_id) || []);
          
          // Filter out duplicates
          screenshots.forEach(screenshot => {
            if (!existingIds.has(screenshot.yatra_id)) {
              newScreenshots.push(screenshot);
            } else {
              duplicateCount++;
            }
          });
          
          console.log(`Filtered: ${newScreenshots.length} new, ${duplicateCount} duplicates`);

          // Insert in batches
          const batchSize = 30;
          const insertedScreenshots = [];

          for (let i = 0; i < newScreenshots.length; i += batchSize) {
            const batch = newScreenshots.slice(i, i + batchSize);
            console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
            
            try {
              const { data, error } = await supabase
                .from('screenshot_pending')
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
                      .from('screenshot_pending')
                      .insert([entry])
                      .select();
                    
                    if (singleError) {
                      console.error(`Failed to insert ${entry.yatra_id}:`, singleError.message);
                      errors.push(`Failed ${entry.yatra_id}: ${singleError.message}`);
                    } else if (singleData && singleData.length > 0) {
                      insertedScreenshots.push(...singleData);
                    }
                  } catch (e) {
                    console.error(`Exception inserting ${entry.yatra_id}:`, e.message);
                    errors.push(`Exception ${entry.yatra_id}: ${e.message}`);
                  }
                }
              } else if (data && data.length > 0) {
                console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful: ${data.length} records inserted`);
                insertedScreenshots.push(...data);
              }
            } catch (batchError) {
              console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
              errors.push(`Batch error: ${batchError.message}`);
            }
          }
          
          console.log(`📊 Total successfully inserted: ${insertedScreenshots.length} out of ${newScreenshots.length} attempted`);
          newScreenshots = insertedScreenshots.length > 0 ? insertedScreenshots : newScreenshots;
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          errors.push(`Database operation failed: ${dbError.message}`);
        }
      } else {
        // Demo mode
        screenshots.forEach(screenshot => {
          screenshot.id = Date.now().toString() + Math.random().toString(36);
          inMemoryScreenshots.push(screenshot);
          newScreenshots.push(screenshot);
        });

        console.log(`Stored ${newScreenshots.length} new screenshot entries in memory (demo mode)`);
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
      total: screenshots.length + errors.length,
      success: screenshots.length,
      errors: errors.length,
      screenshots: screenshots,
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

// Get statistics about screenshot pending entries
router.get('/stats/summary', async (req, res) => {
  try {
    if (!isConfigured) {
      const total = inMemoryScreenshots.length;
      const pending = inMemoryScreenshots.filter(s => s.screenshot_status === 'pending').length;
      const submitted = inMemoryScreenshots.filter(s => s.screenshot_status === 'submitted').length;
      const verified = inMemoryScreenshots.filter(s => s.screenshot_status === 'verified').length;
      
      return res.json({
        total,
        pending,
        submitted,
        verified,
        completion_rate: total > 0 ? ((submitted + verified) / total * 100).toFixed(2) + '%' : '0%'
      });
    }

    const { data, error } = await supabase
      .from('screenshot_pending')
      .select('screenshot_status');

    if (error) {
      throw error;
    }

    const total = data ? data.length : 0;
    const pending = data ? data.filter(s => s.screenshot_status === 'pending').length : 0;
    const submitted = data ? data.filter(s => s.screenshot_status === 'submitted').length : 0;
    const verified = data ? data.filter(s => s.screenshot_status === 'verified').length : 0;

    res.json({
      total,
      pending,
      submitted,
      verified,
      completion_rate: total > 0 ? ((submitted + verified) / total * 100).toFixed(2) + '%' : '0%'
    });
  } catch (error) {
    console.error('Error fetching screenshot statistics:', error);
    res.status(500).json({
      message: 'Error fetching screenshot statistics',
      error: error.message
    });
  }
});

module.exports = router;