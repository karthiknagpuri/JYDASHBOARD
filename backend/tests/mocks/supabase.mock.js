// Mock Supabase client for testing
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ 
      data: [], 
      error: null,
      count: 0
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ 
        data: [{ id: 'test-id', yatri_id: 'TEST001' }], 
        error: null 
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ 
        data: [{ id: 'test-id' }], 
        error: null 
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: null 
      }))
    })),
    eq: jest.fn(function() { return this; }),
    single: jest.fn(function() { return this; }),
    order: jest.fn(function() { return this; }),
    limit: jest.fn(function() { return this; })
  }))
};

module.exports = { mockSupabase };