// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // wait 30s before timeout
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(connectDB, 10000); // auto-retry instead of crashing
  }
};

// Auto-reconnect if connection drops mid-session
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected — retrying in 10s...');
  setTimeout(connectDB, 10000);
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;