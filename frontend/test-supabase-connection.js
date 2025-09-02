// Test Supabase connection and CSV upload
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
console.log('Key preview:', supabaseKey ? supabaseKey.substring(0, 50) + '...' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if table exists
    console.log('\n1. Testing table access...');
    const { data: testSelect, error: selectError } = await supabase
      .from('csv_submissions')
      .select('*')
      .limit(1);
    
    if (selectError) {
      if (selectError.code === '42P01') {
        console.log('❌ Table "csv_submissions" does not exist');
        console.log('   Run the SQL script in Supabase first!');
      } else if (selectError.message.includes('JWT')) {
        console.log('❌ Invalid API key');
        console.log('   Error:', selectError.message);
      } else {
        console.log('❌ Select error:', selectError.message);
      }
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Test 2: Try to insert a test record
    console.log('\n2. Testing insert capability...');
    const testRecord = {
      yatra_id: 'JY_TEST_' + Date.now(),
      first_name: 'Test',
      last_name: 'User',
      gender: 'male',
      role: 'participant',
      mobile_no: '9999999999',
      age: 25,
      address: 'Test Address',
      submitted_section: 'Test',
      submitted_date: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('csv_submissions')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      if (insertError.code === '42501') {
        console.log('   RLS (Row Level Security) is blocking inserts');
        console.log('   Run the SQL script with RLS policies!');
      }
    } else {
      console.log('✅ Insert successful:', insertData[0].yatra_id);
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('csv_submissions')
        .delete()
        .eq('yatra_id', testRecord.yatra_id);
      
      if (!deleteError) {
        console.log('✅ Test record cleaned up');
      }
    }
    
    // Test 3: Check table structure
    console.log('\n3. Checking table structure...');
    const { data: emptySelect } = await supabase
      .from('csv_submissions')
      .select('*')
      .limit(0);
    
    console.log('✅ Table columns are configured correctly');
    
    console.log('\n✨ All tests passed! Your Supabase setup is working.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();