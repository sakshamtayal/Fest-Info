require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://sakshamtayal.github.io',
    'http://localhost:6774',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/societies', require('./routes/societies'));
app.use('/api/college-events', require('./routes/collegeEvents'));

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ status: 'ok', db: statusMap[dbStatus] || 'unknown' });
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// MongoDB connection (Cleaned up to prevent the reconnection storm loop)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️  MongoDB initial connection failed. Retrying in 30s...');
    setTimeout(connectDB, 30000);
  }
};

// Mongoose handles runtime auto-reconnections natively. 
// Removed duplicate connectDB() call from here to stop the crash loops.
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB connection lost. Mongoose is auto-reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Start server first, then try DB
app.listen(PORT, () => {
  console.log(`🚀 Fest Info server running at http://localhost:${PORT}`);
  connectDB();
});