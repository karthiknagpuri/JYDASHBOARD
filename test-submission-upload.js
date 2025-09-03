const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  const form = new FormData();
  const csvPath = '/Users/karthiknagapuri/Downloads/Submitted Application.csv';
  
  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    return;
  }
  
  form.append('csv', fs.createReadStream(csvPath));

  try {
    console.log('📤 Uploading CSV file to submissions endpoint...');
    const response = await axios.post('http://localhost:5002/api/submissions/upload-csv', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log('✅ Upload successful!');
    console.log('📊 Results:');
    console.log(`  - Total rows: ${response.data.total}`);
    console.log(`  - Successful: ${response.data.success}`);
    console.log(`  - Errors: ${response.data.errors}`);
    
    if (response.data.errorDetails && response.data.errorDetails.length > 0) {
      console.log('⚠️ Error details:', response.data.errorDetails);
    }
    
    if (response.data.submissions && response.data.submissions.length > 0) {
      console.log('\n📋 Sample uploaded data (first record):');
      console.log(JSON.stringify(response.data.submissions[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Upload failed:', error.response ? error.response.data : error.message);
  }
}

testUpload();