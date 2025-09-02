const fs = require('fs');

// Generate a CSV with 200 NEW unique participants (not in DB yet)
let csvContent = 'Yatri Id,Yatri Type,First Name,Last Name,Email,Contact Number,Gender,State,District,Scholarship Total Amount Paid\n';

for (let i = 1; i <= 200; i++) {
  const type = i % 5 === 0 ? 'facilitator' : 'participant';
  const gender = i % 2 === 0 ? 'female' : 'male';
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Punjab', 'Rajasthan'];
  const state = states[i % states.length];
  const amount = 2000 + (i * 50);
  
  csvContent += `MEGA${String(i).padStart(3, '0')},${type},Mega${i},User${i},mega${i}@test.com,77000${String(i).padStart(5, '0')},${gender},${state},District${i},${amount}\n`;
}

fs.writeFileSync('mega-200.csv', csvContent);
console.log('✅ Generated mega-200.csv with 200 NEW unique participants');
console.log('   All IDs start with MEGA (MEGA001 to MEGA200)');
console.log('   These are all NEW records not in the database');