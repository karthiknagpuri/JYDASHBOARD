const fs = require('fs');

// Generate a CSV with exactly 132 unique participants
let csvContent = 'Yatri Id,Yatri Type,First Name,Last Name,Email,Contact Number,Gender,State,District,Scholarship Total Amount Paid\n';

for (let i = 1; i <= 132; i++) {
  const type = i % 5 === 0 ? 'facilitator' : 'participant';
  const gender = i % 2 === 0 ? 'female' : 'male';
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Punjab', 'Rajasthan'];
  const state = states[i % states.length];
  const amount = 1000 + (i * 50);
  
  csvContent += `FULL${String(i).padStart(3, '0')},${type},First${i},Last${i},full${i}@test.com,99000${String(i).padStart(5, '0')},${gender},${state},District${i},${amount}\n`;
}

fs.writeFileSync('full-132.csv', csvContent);

// Count lines to verify
const lines = csvContent.split('\n').length - 1; // -1 for the last empty line
console.log(`✅ Generated full-132.csv with exactly ${lines - 1} data rows (${lines} total lines including header)`);
console.log('   IDs: FULL001 to FULL132');