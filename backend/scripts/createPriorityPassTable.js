const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function createPriorityPassTable() {
  try {
    console.log('Creating Priority Pass table in Supabase...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_priority_pass_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      // If the RPC function doesn't exist, try using the SQL directly through the admin API
      console.log('Note: Direct SQL execution may require Supabase admin privileges.');
      console.log('You can also run the SQL directly in the Supabase SQL Editor:');
      console.log('\nNavigate to: https://app.supabase.com/project/[YOUR_PROJECT_ID]/sql/new');
      console.log('\nThen paste and run the SQL from:', sqlFilePath);
      throw error;
    }
    
    console.log('✅ Priority Pass table created successfully!');
    
    // Verify the table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('priority_pass')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Table verification successful - Priority Pass table is ready to use!');
    } else {
      console.log('⚠️ Table created but verification query failed:', checkError.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating Priority Pass table:', error.message);
    console.log('\n📝 Alternative: Please run the SQL manually in Supabase:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from backend/migrations/create_priority_pass_table.sql');
    console.log('4. Click "Run" to execute the SQL');
  }
}

// Run the script
createPriorityPassTable();