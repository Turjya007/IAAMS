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

// POST /api/events → Event toiri (Admin + Alumni duijon e, tai shudhu verifyToken, isAdmin na)
router.post('/', verifyToken, createEvent);

// GET /api/events → shudhu approved event er list (sobai dekhte parbe)
router.get('/', verifyToken, getAllEvents);

// GET /api/events/pending → pending event gulor list (shudhu Admin)
router.get('/pending', verifyToken, isAdmin, getPendingEvents);

// PATCH /api/events/approve/:id → Event approve kora (shudhu Admin)
router.patch('/approve/:id', verifyToken, isAdmin, approveEvent);

// PATCH /api/events/reject/:id → Event reject kora (shudhu Admin)
router.patch('/reject/:id', verifyToken, isAdmin, rejectEvent);

module.exports = router;