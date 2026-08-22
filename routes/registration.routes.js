// routes/registration.routes.js
const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  markAsPaid,
  getPendingPayments,
  getInvitationCardData,
  markAttendance,
  getAttendanceList
} = require('../controllers/registration.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/registrations → নতুন event এ register করা (যেকোনো logged-in user)
router.post('/', verifyToken, registerForEvent);

// GET /api/registrations/my → নিজের সব registration দেখা ("My Events")
router.get('/my', verifyToken, getMyRegistrations);

// PATCH /api/registrations/:id/mark-paid → payment paid মার্ক করা (শুধু Admin)
router.patch('/:id/mark-paid', verifyToken, isAdmin, markAsPaid);

router.get('/pending', verifyToken, isAdmin, getPendingPayments); // ⬅️ নতুন লাইন

router.get('/:id/invitation-card', verifyToken, getInvitationCardData);

// GET/PATCH decide korte hobe - amra PATCH use korchi karon ei kaj ta kono existing data update kortese
router.patch('/attendance/:eventId', verifyToken, markAttendance);

router.get('/attendance-list/:eventId', verifyToken, isAdmin, getAttendanceList);

module.exports = router;