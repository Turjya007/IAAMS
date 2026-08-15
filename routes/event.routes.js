// routes/event.routes.js
const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent
} = require('../controllers/event.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/events → Event তৈরি (Admin + Alumni দুজনেই, তাই শুধু verifyToken, isAdmin না)
router.post('/', verifyToken, createEvent);

// GET /api/events → শুধু approved event এর লিস্ট (সবাই দেখতে পারবে)
router.get('/', verifyToken, getAllEvents);

// GET /api/events/pending → pending event গুলোর লিস্ট (শুধু Admin)
router.get('/pending', verifyToken, isAdmin, getPendingEvents);

// PATCH /api/events/approve/:id → Event approve করা (শুধু Admin)
router.patch('/approve/:id', verifyToken, isAdmin, approveEvent);

// PATCH /api/events/reject/:id → Event reject করা (শুধু Admin)
router.patch('/reject/:id', verifyToken, isAdmin, rejectEvent);

module.exports = router;