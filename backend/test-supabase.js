require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseServiceRoleKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testConnection() {
  try {
    // Test 1: Check if participants_csv table exists
    console.log('\n📊 Testing participants_csv table...');
    const { data, error, count } = await supabase
      .from('participants_csv')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Table "participants_csv" does not exist.');
        console.log('\n📋 To create the table:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Copy and paste the contents of backend/supabase-schema.sql');
        console.log('4. Click "Run"\n');
        
        // Try creating a simple test table to verify connection works
        console.log('🔧 Testing connection with a simple query...');
        const { data: testData, error: testError } = await supabase
          .from('_test_connection')
          .select('*')
          .limit(1);
        
        if (testError && testError.message.includes('Invalid API key')) {
          console.error('❌ Invalid API key. Please check your .env file.');
        } else if (testError && testError.code === '42P01') {
          console.log('✅ Connection successful! API key is valid.');
          console.log('   Just need to create the participants_csv table.');
        }
      } else if (error.message && error.message.includes('Invalid API key')) {
        console.error('❌ Invalid API key:', error.message);
        console.log('\n🔍 Please verify:');
        console.log('1. The SUPABASE_SERVICE_ROLE_KEY in .env is correct');
        console.log('2. It\'s the service_role key, not the anon key');
        console.log('3. The key matches your Supabase project');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Table exists! Row count:', count || 0);
      
      // Test 2: Try to insert a test record
      console.log('\n🔧 Testing insert operation...');
      const testParticipant = {
        yatri_id: 'TEST_' + Date.now(),
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('participants_csv')
        .insert([testParticipant])
        .select();
      
      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ Insert successful!');
        
        // Clean up test record
        const { error: deleteError } = await supabase
          .from('participants_csv')
          .delete()
          .eq('yatri_id', testParticipant.yatri_id);
        
        if (!deleteError) {
          console.log('✅ Cleanup successful!');
        }
      }
    }
    
    console.log('\n📊 Connection test complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();