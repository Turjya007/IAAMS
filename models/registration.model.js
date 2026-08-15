// models/registration.model.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  serialNumber: {
    type: String
    // এখানে required: true দেইনি, কারণ registration তৈরি হওয়ার সময় (payment pending অবস্থায়)
    // এই ফিল্ড খালি থাকবে। শুধু "paid" হওয়ার পরই এটা বসবে।
  }
}, { timestamps: true });

// ei line ta DB ke bole debe "event" ar "user" er combination always unique hote hobe
// That means eki user eki event a 2nd time registration korte gele DB nijei atke debe
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);