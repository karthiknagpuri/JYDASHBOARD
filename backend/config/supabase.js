const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if credentials are properly configured
const isConfigured = supabaseUrl && 
                     supabaseServiceRoleKey && 
                     supabaseUrl.startsWith('https://') &&
                     supabaseServiceRoleKey.startsWith('eyJ');

let supabase = null;

if (isConfigured) {
  // Create Supabase client with service role key for backend operations
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️ Supabase not configured. Running in demo mode.');
  console.log('   To enable Supabase:');
  console.log('   1. Create a Supabase project at https://supabase.com');
  console.log('   2. Update .env file with your Supabase URL and Service Role Key');
  console.log('   3. Run the database schema in your Supabase SQL editor');
}

// Test Supabase connection
const testConnection = async () => {
  if (!supabase) {
    console.log('ℹ️ Supabase not configured - skipping connection test');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('participants_csv')
      .select('count(*)')
      .limit(1);
    
    if (error && error.code !== '42P01') { // 42P01 = relation does not exist (table not found)
      throw error;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Supabase connection test failed:', error.message);
    console.log('   This is normal if tables haven\'t been created yet');
    return false;
  }
};

// Mock service for demo mode
const createMockService = () => ({
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: new Error('Supabase not configured') }),
    update: () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: () => ({ data: null, error: new Error('Supabase not configured') }),
    eq: function() { return this; },
    order: function() { return this; },
    single: function() { return this; }
  })
});

module.exports = {
  supabase: supabase || createMockService(),
  testConnection,
  isConfigured
};