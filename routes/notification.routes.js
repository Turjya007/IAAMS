// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationsAsRead } = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/notifications/my → Nijer sob notification ana (login kora jekono user)
router.get('/my', verifyToken, getMyNotifications);

// PATCH /api/notifications/mark-read → Nijer sob notification "read" Mark kora
router.patch('/mark-read', verifyToken, markNotificationsAsRead);

module.exports = router;