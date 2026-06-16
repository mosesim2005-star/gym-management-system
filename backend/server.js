require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Fix ENETUNREACH IPv6 SMTP errors

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

// ── CORS: localhost only ──
app.use(cors({
origin: process.env.FRONTEND_URL || 'http://localhost:3000',  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Server is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startScheduledReminders();
});