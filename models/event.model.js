// models/event.model.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  place: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  registrationFee: {
    type: Number,
    required: true,
    default: 0
  },
  bkashNumber: {                   
    type: String,
    required: true
  },
  postedBy: {                     
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {                        
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {                   
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);