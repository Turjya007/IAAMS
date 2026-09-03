// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationsAsRead } = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/notifications/my → নিজের সব notification আনা (login করা যেকোনো user)
router.get('/my', verifyToken, getMyNotifications);

// PATCH /api/notifications/mark-read → নিজের সব notification "read" মার্ক করা
router.patch('/mark-read', verifyToken, markNotificationsAsRead);

module.exports = router;