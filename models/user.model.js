// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true // email unique hole eki email diye duibar account banano jabe na
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'alumni'], // either alumni hobe, ar naile admin hobe.
      default: 'alumni'
    },

    // ⬇️ only Alumni der jonno dorkari fields (Admin er jonno khali thakbe)
    batch: {
      type: String
    },
    department: {
      type: String
    },
    graduationYear: {
      type: Number
    },
    membershipType: {
      type: String,
      enum: ['New Member', 'Active Member', 'Senior Member'],
      default: 'New Member'
    },

    // ⬇️ Registration verification er jonno
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending' // Registration er por by default pending thakbe
    },
    approvedAt: {
      // kokhon account approve hoyeche, seita save rakhchi
      // eita membershipType (New/Active/Senior) hisab korte kaje lagbe
      type: Date
    }
  },
  {
    timestamps: true // createdAt, updatedAt automatically add hoye jabe
  }
);

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;