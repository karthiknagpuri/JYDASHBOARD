require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table') || 
          statement.toLowerCase().includes('create index') ||
          statement.toLowerCase().includes('create policy') ||
          statement.toLowerCase().includes('alter table')) {
        
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        }).catch(() => {
          // If RPC doesn't exist, try direct execution (this won't work but we'll show the message)
          console.log('⚠️  Note: Direct SQL execution not available via client SDK');
          console.log('📋 Please run the following SQL in your Supabase SQL editor:');
          console.log('---');
          console.log(statement + ';');
          console.log('---\n');
          return { error: null };
        });

        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
        }
      }
    }

    // Test the connection by checking if table exists
    console.log('\n🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('participants_csv')
      .select('count(*)', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('\n⚠️  Table does not exist yet.');
        console.log('📋 Please copy the contents of supabase-schema.sql and run it in your Supabase SQL editor:');
        console.log('   1. Go to https://supabase.com/dashboard/project/ipiopwfghlaejgcerztc/sql');
        console.log('   2. Click "New Query"');
        console.log('   3. Paste the SQL from backend/supabase-schema.sql');
        console.log('   4. Click "Run"\n');
      } else {
        console.error('❌ Connection test failed:', error.message);
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Tables are ready to use.\n');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();