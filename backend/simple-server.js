const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

const participantsRoutes = require('./routes/participants');
app.use('/api/participants', participantsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
