// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller'); // ⬅️ getMe যোগ করা হলো
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);

module.exports = router;