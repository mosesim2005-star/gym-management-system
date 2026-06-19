require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const startScheduledReminders = require('./utils/scheduledReminders');

const app = express();
connectDB();

// ───────── CORS CONFIG ─────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://gym-management-frontend.netlify.app',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean); // removes undefined/null values

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ───────── MIDDLEWARE ─────────
app.use(express.json());

// ───────── ROUTES ─────────
app.use('/api/auth', authRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Gym Management Backend Running');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// ───────── SERVER ─────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduledReminders();
});