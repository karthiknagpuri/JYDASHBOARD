const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  
  // Test 1: Count total records
  const { count, error: countError } = await supabase
    .from('participants_csv')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Count error:', countError);
  } else {
    console.log(`✅ Total records in database: ${count}`);
  }
  
  // Test 2: Fetch first 10 records
  const { data: first10, error: fetch10Error } = await supabase
    .from('participants_csv')
    .select('yatri_id, first_name, last_name')
    .limit(10);
  
  if (fetch10Error) {
    console.error('Fetch error:', fetch10Error);
  } else {
    console.log(`\n✅ Fetched ${first10.length} records (limit 10)`);
    first10.forEach(p => console.log(`   - ${p.yatri_id}: ${p.first_name} ${p.last_name}`));
  }
  
  // Test 3: Fetch records with pagination
  console.log('\n📊 Testing pagination:');
  let total = 0;
  let offset = 0;
  const pageSize = 50;
  
  while (true) {
    const { data: page, error: pageError } = await supabase
      .from('participants_csv')
      .select('yatri_id')
      .range(offset, offset + pageSize - 1);
    
    if (pageError) {
      console.error('Page error:', pageError);
      break;
    }
    
    if (!page || page.length === 0) {
      break;
    }
    
    total += page.length;
    console.log(`   Page ${Math.floor(offset/pageSize) + 1}: ${page.length} records`);
    
    if (page.length < pageSize) {
      break;
    }
    
    offset += pageSize;
  }
  
  console.log(`\n✅ Total fetched with pagination: ${total} records`);
  
  // Test 4: Check for specific test records
  const testIds = ['TEST001', 'TEST002', 'TEST003', 'NEW001', 'BATCH001'];
  console.log('\n🔍 Checking for test records:');
  
  for (const id of testIds) {
    const { data, error } = await supabase
      .from('participants_csv')
      .select('yatri_id')
      .eq('yatri_id', id)
      .single();
    
    if (data) {
      console.log(`   ✅ ${id} exists`);
    } else {
      console.log(`   ❌ ${id} not found`);
    }
  }
}

testSupabase().catch(console.error);