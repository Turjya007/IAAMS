// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes'); //new line added
const adminRoutes = require('./routes/admin.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const fundRoutes = require('./routes/fund.routes');

const app = express();

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ⬇️ new line — /api/auth diye shuru howa shob route ekhon 'authRoutes' e jabe
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/fund', fundRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'IAAMS server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

