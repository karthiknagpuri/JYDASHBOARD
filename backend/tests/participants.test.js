const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock Supabase before importing the route
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockImplementation(() => ({
        data: [],
        error: null,
        count: 0,
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      })),
      insert: jest.fn().mockImplementation((data) => ({
        select: jest.fn().mockResolvedValue({
          data: data.map(d => ({ ...d, id: 'test-id' })),
          error: null
        })
      }))
    }))
  },
  isConfigured: true
}));

const participantRoutes = require('../routes/participants');

describe('Participants Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/participants', participantRoutes);
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any test files
    const uploadDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
      });
    }
  });

  describe('GET /api/participants', () => {
    it('should return all participants', async () => {
      const mockParticipants = [
        { id: '1', yatri_id: 'YT001', first_name: 'John', last_name: 'Doe' },
        { id: '2', yatri_id: 'YT002', first_name: 'Jane', last_name: 'Smith' }
      ];

      const { supabase } = require('../config/supabase');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockParticipants,
            error: null
          })
        })
      });

      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body).toHaveProperty('participants');
      expect(response.body).toHaveProperty('total');
      expect(response.body.participants).toEqual(mockParticipants);
      expect(response.body.total).toBe(2);
    });

    it('should handle database errors gracefully', async () => {
      const { supabase } = require('../config/supabase');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        })
      });

      const response = await request(app)
        .get('/api/participants')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Error fetching participants');
    });
  });

  describe('GET /api/participants/:id', () => {
    it('should return a single participant by ID', async () => {
      const mockParticipant = {
        id: '1',
        yatri_id: 'YT001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };

      const { supabase } = require('../config/supabase');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockParticipant,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/participants/1')
        .expect(200);

      expect(response.body).toEqual(mockParticipant);
    });

    it('should return 404 for non-existent participant', async () => {
      const { supabase } = require('../config/supabase');
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/api/participants/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Participant not found');
    });
  });

  describe('POST /api/participants/upload-csv', () => {
    it('should handle CSV upload with valid data', async () => {
      const csvContent = `Yatri Id,First Name,Last Name,Email,Gender
YT001,John,Doe,john@example.com,male
YT002,Jane,Smith,jane@example.com,female`;

      const csvPath = path.join(__dirname, 'test-participants.csv');
      fs.writeFileSync(csvPath, csvContent);

      const { supabase } = require('../config/supabase');
      
      // Mock for checking existing participants
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // Mock for inserting new participants
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockImplementation((data) => ({
          select: jest.fn().mockResolvedValue({
            data: data.map((d, i) => ({ ...d, id: `test-id-${i}` })),
            error: null
          })
        }))
      });

      const response = await request(app)
        .post('/api/participants/upload-csv')
        .attach('csv', csvPath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('CSV processed successfully');
      expect(response.body).toHaveProperty('participants');
      expect(response.body.participants).toHaveLength(2);

      // Clean up
      fs.unlinkSync(csvPath);
    });

    it('should reject duplicate participants', async () => {
      const csvContent = `Yatri Id,First Name,Last Name,Email
YT001,John,Doe,john@example.com
YT001,John,Doe,john@example.com`;

      const csvPath = path.join(__dirname, 'test-duplicates.csv');
      fs.writeFileSync(csvPath, csvContent);

      const { supabase } = require('../config/supabase');
      
      // Mock existing participants
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: [{ yatri_id: 'YT001' }],
          error: null
        })
      });

      const response = await request(app)
        .post('/api/participants/upload-csv')
        .attach('csv', csvPath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.errorDetails[0]).toContain('Skipped 1 duplicate participants (already exist)');

      // Clean up
      fs.unlinkSync(csvPath);
    });

    it('should validate required fields', async () => {
      const csvContent = `Yatri Id,First Name,Last Name,Email
,John,Doe,john@example.com
YT002,,Smith,jane@example.com
YT003,Bob,Brown,`;

      const csvPath = path.join(__dirname, 'test-invalid.csv');
      fs.writeFileSync(csvPath, csvContent);

      const response = await request(app)
        .post('/api/participants/upload-csv')
        .attach('csv', csvPath)
        .expect(200);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeGreaterThan(0);
      expect(response.body.errorDetails).toBeDefined();

      // Clean up
      fs.unlinkSync(csvPath);
    });

    it('should handle missing CSV file', async () => {
      const response = await request(app)
        .post('/api/participants/upload-csv')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'No CSV file uploaded');
    });

    it('should parse dates correctly', async () => {
      const csvContent = `Yatri Id,First Name,Last Name,Email,DOB,Application Submitted On
YT001,John,Doe,john@example.com,1990-01-15,2024-01-10T10:30:00Z`;

      const csvPath = path.join(__dirname, 'test-dates.csv');
      fs.writeFileSync(csvPath, csvContent);

      const { supabase } = require('../config/supabase');
      
      // Mock for checking existing
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // Mock for insert
      let insertedData = null;
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockImplementation((data) => {
          insertedData = data;
          return {
            select: jest.fn().mockResolvedValue({
              data: data.map((d, i) => ({ ...d, id: `test-id-${i}` })),
              error: null
            })
          };
        })
      });

      await request(app)
        .post('/api/participants/upload-csv')
        .attach('csv', csvPath)
        .expect(200);

      // Verify date parsing
      expect(insertedData).toBeDefined();
      expect(insertedData[0].date_of_birth).toBe('1990-01-15');
      expect(insertedData[0].application_submitted_on).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // Clean up
      fs.unlinkSync(csvPath);
    });

    it('should handle numeric fields conversion', async () => {
      const csvContent = `Yatri Id,First Name,Last Name,Email,Yatri Annual Income,Scholarship Total Amount Paid
YT001,John,Doe,john@example.com,500000,25000.50`;

      const csvPath = path.join(__dirname, 'test-numbers.csv');
      fs.writeFileSync(csvPath, csvContent);

      const { supabase } = require('../config/supabase');
      
      // Mock for checking existing
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // Mock for insert
      let insertedData = null;
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockImplementation((data) => {
          insertedData = data;
          return {
            select: jest.fn().mockResolvedValue({
              data: data.map((d, i) => ({ ...d, id: `test-id-${i}` })),
              error: null
            })
          };
        })
      });

      await request(app)
        .post('/api/participants/upload-csv')
        .attach('csv', csvPath)
        .expect(200);

      // Verify numeric conversion
      expect(insertedData).toBeDefined();
      expect(insertedData[0].yatri_annual_income).toBe(500000);
      expect(insertedData[0].scholarship_total_amount_paid).toBe(25000.50);

      // Clean up
      fs.unlinkSync(csvPath);
    });
  });
});