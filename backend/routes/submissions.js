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
    cb(null, 'submissions-' + uniqueSuffix + '.csv');
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

// CSV column mapping for submissions (can be customized based on actual submission fields)
const columnMapping = {
  'Submission ID': 'submission_id',
  'Yatri Id': 'yatri_id',
  'Application ID': 'application_id',
  'Submission Date': 'submission_date',
  'Status': 'status',
  'Review Status': 'review_status',
  'Score': 'score',
  'Comments': 'comments',
  'Reviewer': 'reviewer',
  'Category': 'category',
  'Priority': 'priority',
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Email': 'email',
  'Contact Number': 'contact_number',
  'Essay': 'essay',
  'References': 'references',
  'Documents': 'documents',
  'Interview Date': 'interview_date',
  'Interview Score': 'interview_score',
  'Final Decision': 'final_decision',
  'Decision Date': 'decision_date',
  'Notes': 'notes'
};

// Parse and validate submission data
const parseSubmissionData = (row) => {
  const submission = {};
  
  // Map CSV columns to database columns
  Object.keys(columnMapping).forEach(csvColumn => {
    const dbColumn = columnMapping[csvColumn];
    const value = row[csvColumn];
    
    if (value !== undefined && value !== null && value !== '') {
      submission[dbColumn] = value.toString().trim();
    }
  });

  // Convert date strings to proper format
  if (submission.submission_date) {
    try {
      submission.submission_date = new Date(submission.submission_date).toISOString();
    } catch (e) {
      submission.submission_date = null;
    }
  }

  if (submission.interview_date) {
    try {
      submission.interview_date = new Date(submission.interview_date).toISOString();
    } catch (e) {
      submission.interview_date = null;
    }
  }

  if (submission.decision_date) {
    try {
      submission.decision_date = new Date(submission.decision_date).toISOString();
    } catch (e) {
      submission.decision_date = null;
    }
  }

  // Convert numeric fields
  if (submission.score) {
    submission.score = parseFloat(submission.score) || 0;
  }

  if (submission.interview_score) {
    submission.interview_score = parseFloat(submission.interview_score) || 0;
  }

  // Add created timestamp
  submission.created_at = new Date().toISOString();

  return submission;
};

// In-memory storage for demo mode
let inMemorySubmissions = [];

// Get all submissions
router.get('/', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.json({
        submissions: inMemorySubmissions,
        total: inMemorySubmissions.length,
        message: 'Running in demo mode - using in-memory storage'
      });
    }

    // Fetch all submissions
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return res.json({
          submissions: [],
          total: 0,
          message: 'Submissions table not yet created in Supabase'
        });
      }
      throw error;
    }

    res.json({
      submissions: data || [],
      total: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});

// Get submission by ID
router.get('/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      const submission = inMemorySubmissions.find(s => 
        s.id === req.params.id || 
        s.submission_id === req.params.id || 
        s.yatri_id === req.params.id
      );
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      return res.json(submission);
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      message: 'Error fetching submission',
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
  const submissions = [];
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
            const submission = parseSubmissionData(row);
            
            // Basic validation (can be customized)
            if (!submission.submission_id && !submission.yatri_id && !submission.application_id) {
              errors.push(`Row ${rowCount}: Missing identifier (submission_id, yatri_id, or application_id)`);
              return;
            }

            submissions.push(submission);
          } catch (error) {
            errors.push(`Row ${rowCount} parsing error: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`CSV parsed: ${rowCount} total rows read, ${submissions.length} valid, ${errors.length} errors`);
    
    // Store data
    if (submissions.length > 0) {
      let newSubmissions = [];
      let duplicateCount = 0;

      if (isConfigured) {
        try {
          // Check if table exists first
          const { error: tableCheckError } = await supabase
            .from('submissions')
            .select('id')
            .limit(1);

          if (tableCheckError && tableCheckError.code === '42P01') {
            // Table doesn't exist, store in memory for now
            console.log('Submissions table not found in Supabase, using in-memory storage');
            submissions.forEach(submission => {
              submission.id = Date.now().toString() + Math.random().toString(36);
              inMemorySubmissions.push(submission);
              newSubmissions.push(submission);
            });
          } else {
            // Table exists, proceed with normal flow
            // Get existing submission IDs (if there's a unique identifier)
            const { data: existingSubmissions, error: fetchError } = await supabase
              .from('submissions')
              .select('submission_id, yatri_id, application_id');

            if (fetchError && fetchError.code !== '42P01') {
              console.error('Error fetching existing submissions:', fetchError);
              errors.push(`Database fetch error: ${fetchError.message}`);
            }

            const existingIds = new Set();
            if (existingSubmissions) {
              existingSubmissions.forEach(s => {
                if (s.submission_id) existingIds.add(s.submission_id);
                if (s.yatri_id) existingIds.add(s.yatri_id);
                if (s.application_id) existingIds.add(s.application_id);
              });
            }
            
            // Filter out duplicates
            submissions.forEach(submission => {
              const isDuplicate = 
                (submission.submission_id && existingIds.has(submission.submission_id)) ||
                (submission.yatri_id && existingIds.has(submission.yatri_id)) ||
                (submission.application_id && existingIds.has(submission.application_id));
              
              if (!isDuplicate) {
                newSubmissions.push(submission);
              } else {
                duplicateCount++;
              }
            });
            
            console.log(`Filtered: ${newSubmissions.length} new, ${duplicateCount} duplicates`);

            // Insert in batches
            const batchSize = 30;
            const insertedSubmissions = [];

            for (let i = 0; i < newSubmissions.length; i += batchSize) {
              const batch = newSubmissions.slice(i, i + batchSize);
              console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
              
              try {
                const { data, error } = await supabase
                  .from('submissions')
                  .insert(batch)
                  .select();

                if (error) {
                  console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
                  errors.push(`Batch error: ${error.message}`);
                } else if (data && data.length > 0) {
                  console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful: ${data.length} records inserted`);
                  insertedSubmissions.push(...data);
                }
              } catch (batchError) {
                console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
                errors.push(`Batch error: ${batchError.message}`);
              }
            }
            
            console.log(`📊 Total successfully inserted: ${insertedSubmissions.length} out of ${newSubmissions.length} attempted`);
            newSubmissions = insertedSubmissions.length > 0 ? insertedSubmissions : newSubmissions;
          }
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          errors.push(`Database operation failed: ${dbError.message}`);
        }
      } else {
        // Demo mode
        submissions.forEach(submission => {
          submission.id = Date.now().toString() + Math.random().toString(36);
          inMemorySubmissions.push(submission);
          newSubmissions.push(submission);
        });

        console.log(`Stored ${newSubmissions.length} new submissions in memory (demo mode)`);
      }

      if (duplicateCount > 0) {
        errors.push(`Skipped ${duplicateCount} duplicate submissions (already exist)`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'CSV processed successfully',
      total: submissions.length + errors.length,
      success: submissions.length,
      errors: errors.length,
      submissions: submissions,
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