const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', require('./routes/health'));

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

// Start server
const PORT = process.env.BACKEND_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend API server running on port ${PORT}`);
});

module.exports = app;
