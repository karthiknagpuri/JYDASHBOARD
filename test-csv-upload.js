const fs = require('fs');
const path = require('path');

// Create a sample CSV file for testing
const csvContent = `Yatri Id,Yatri Type,First Name,Last Name,Email,Contact Number,Gender,State,District,Scholarship Total Amount Paid
TEST001,participant,John,Doe,john@example.com,9876543210,male,Karnataka,Bangalore,5000
TEST002,facilitator,Jane,Smith,jane@example.com,9876543211,female,Maharashtra,Mumbai,7500
TEST003,participant,Bob,Wilson,bob@example.com,9876543212,male,Tamil Nadu,Chennai,3000`;

const testFilePath = path.join(__dirname, 'test-participants.csv');
fs.writeFileSync(testFilePath, csvContent);

console.log('✅ Test CSV file created: test-participants.csv');
console.log('\n📝 CSV contains 3 test participants:');
console.log('   - TEST001: John Doe');
console.log('   - TEST002: Jane Smith');
console.log('   - TEST003: Bob Wilson');

console.log('\n🚀 To test automatic upload to Supabase:');
console.log('1. Go to http://localhost:3000');
console.log('2. Login with Admin/zero');
console.log('3. Click "Upload CSV"');
console.log('4. Select the file: test-participants.csv');
console.log('\n✨ The system will automatically:');
console.log('   - Parse the CSV file');
console.log('   - Check for duplicates in Supabase');
console.log('   - Upload only new records');
console.log('   - Show you the results');

console.log('\n📊 To verify in Supabase:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to Table Editor → participants_csv');
console.log('3. You should see the 3 new records');

console.log('\n🔄 If you upload the same file again:');
console.log('   - It will detect all 3 as duplicates');
console.log('   - Skip all of them');
console.log('   - Report "0 added, 3 skipped"');