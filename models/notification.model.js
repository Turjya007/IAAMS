// models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    // notification ta kar jonno, seita bujhar jonno
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    // je text ta dashboard e dekhabe
    type: String,
    required: true
  },
  type: {
    // kon dhoroner notification, eita frontend e icon/color select korte kaje lagbe
    type: String,
    enum: ['event_approved', 'payment_confirmed', 'deadline_reminder'],
    required: true
  },
  isRead: {
    // alumni ei notification ta dekheche kina
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);