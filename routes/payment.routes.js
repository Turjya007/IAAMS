// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN
} = require('../controllers/payment.controller');

// Alumni login kora thakle tobei payment shuru korte parbe
router.post('/initiate/:registrationId', verifyToken, initiatePayment);

// Egulo SSLCommerz nije theke call kore, tai eikhane verifyToken nai
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.post('/ipn', paymentIPN);

module.exports = router;