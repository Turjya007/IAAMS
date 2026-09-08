// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes'); //new line added
const adminRoutes = require('./routes/admin.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const notificationRoutes = require('./routes/notification.routes');
const fundRoutes = require('./routes/fund.routes');
const cron = require('node-cron');
const sendDeadlineReminders = require('./jobs/deadlineReminder.job');
const updateMembershipTypes = require('./jobs/membershipUpdate.job');

const app = express();

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ⬇️ new line — /api/auth diye shuru howa shob route ekhon 'authRoutes' e jabe
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fund', fundRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'IAAMS server is running!' });
});

// shudhu test korar jonno — server chalu hole ekbar chalabo
//sendDeadlineReminders();

// shudhu test korar jonno — server chalu hole ekbar chalab0
//updateMembershipTypes();

// Protidin 9 tai (21:00) deadline reminder check korbe
// cron format: minute hour day month weekday
cron.schedule('0 21 * * *', () => {
  console.log('Deadline reminder job shuru hocche...');
  sendDeadlineReminders();
});

// Protidin 9 tai (21:00) membership type (New/Active/Senior) update korbe
cron.schedule('0 21 * * *', () => {
  console.log('Membership update job shuru hocche...');
  updateMembershipTypes();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
