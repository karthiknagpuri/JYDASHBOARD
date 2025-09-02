const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import Supabase configuration
const { supabase, testConnection } = require('./config/supabase');

// Import routes
const participantRoutes = require('./routes/participants');
const priorityPassRoutes = require('./routes/priorityPass');
const submissionsRoutes = require('./routes/submissions');
const screenshotPendingRoutes = require('./routes/screenshotPending');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Supabase connection
testConnection();

// Routes
app.use('/api/participants', participantRoutes);
app.use('/api/priority-pass', priorityPassRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/screenshot-pending', screenshotPendingRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
} else {
  // Development mode - serve React build files
  const buildPath = path.join(__dirname, '../frontend/build');
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Handle React Router - send all non-API requests to React app
    app.get('*', (req, res) => {
      if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(buildPath, 'index.html'));
      }
    });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for testing
module.exports = app;
