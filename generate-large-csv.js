const fs = require('fs');

// Generate a CSV with 50 unique participants
let csvContent = 'Yatri Id,Yatri Type,First Name,Last Name,Email,Contact Number,Gender,State,District,Scholarship Total Amount Paid\n';

for (let i = 1; i <= 50; i++) {
  const type = i % 5 === 0 ? 'facilitator' : 'participant';
  const gender = i % 2 === 0 ? 'female' : 'male';
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Punjab', 'Rajasthan'];
  const state = states[i % states.length];
  const amount = 1000 + (i * 100);
  
  csvContent += `LARGE${String(i).padStart(3, '0')},${type},User${i},Test${i},user${i}@test.com,90000${String(i).padStart(5, '0')},${gender},${state},District${i},${amount}\n`;
}

fs.writeFileSync('large-batch.csv', csvContent);
console.log('✅ Generated large-batch.csv with 50 unique participants');