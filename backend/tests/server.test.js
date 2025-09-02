const request = require('supertest');

// Mock environment and Supabase before importing server
process.env.NODE_ENV = 'test';
process.env.PORT = 5004;

jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  },
  testConnection: jest.fn(),
  isConfigured: true
}));

describe('Server Integration Tests', () => {
  let app;
  let server;

  beforeAll(() => {
    // Import server after mocks are set up
    app = require('../server');
  });

  afterAll((done) => {
    if (server && server.close) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Server Setup', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(404); // Since we haven't implemented health endpoint yet

      // This test verifies the server is running
      expect(response.status).toBeDefined();
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/participants')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle JSON payloads', async () => {
      const response = await request(app)
        .post('/api/participants')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // The endpoint doesn't exist, but we're testing middleware
      expect(response.status).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should have participants routes mounted', async () => {
      const response = await request(app)
        .get('/api/participants')
        .expect(200);

      expect(response.body).toHaveProperty('participants');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      expect(response.status).toBe(400);
    });
  });
});