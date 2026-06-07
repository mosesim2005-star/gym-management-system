require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const memberRoutes = require('./routes/memberRoutes'); // ← ADD
const dashboardRoutes  = require('./routes/dashboardRoutes');          // ← ADD

const startScheduledReminders = require('./utils/scheduledReminders');   // ← ADD


const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/members', memberRoutes); // ← ADD
app.use('/api/dashboard',   dashboardRoutes);                          // ← ADD


app.get('/api/health', (req, res) => res.json({ status: 'Server is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduledReminders();   // ← ADD — starts daily check after server boots
});