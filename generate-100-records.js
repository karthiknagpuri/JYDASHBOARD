const fs = require('fs');

// Generate a CSV with 100 unique participants
let csvContent = 'Yatri Id,Yatri Type,First Name,Last Name,Email,Contact Number,Gender,State,District,Scholarship Total Amount Paid\n';

for (let i = 1; i <= 100; i++) {
  const type = i % 5 === 0 ? 'facilitator' : 'participant';
  const gender = i % 2 === 0 ? 'female' : 'male';
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Punjab', 'Rajasthan'];
  const state = states[i % states.length];
  const amount = 1000 + (i * 100);
  
  csvContent += `BULK${String(i).padStart(3, '0')},${type},First${i},Last${i},bulk${i}@test.com,88000${String(i).padStart(5, '0')},${gender},${state},District${i},${amount}\n`;
}

fs.writeFileSync('bulk-100.csv', csvContent);
console.log('✅ Generated bulk-100.csv with 100 unique participants');
console.log('   All IDs start with BULK (BULK001 to BULK100)');