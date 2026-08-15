// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // .env file thke connection string niye connect kora hocche
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully ✓✓✓');
  } catch (error) {
    // 'catch' diye error ke dhorlam, jate error ashle error message show kora jai
    console.log('MongoDB connection failed:', error.message);
  }
}

module.exports = connectDB;