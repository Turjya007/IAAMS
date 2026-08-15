const express = require('express');
const router = express.Router();
const { approveUser, rejectUser, getPendingUsers } = require('../controllers/admin.controller'); 
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/pending-users', verifyToken, isAdmin, getPendingUsers);

router.patch('/approve/:id', verifyToken, isAdmin, approveUser);

router.patch('/reject/:id', verifyToken, isAdmin, rejectUser);

module.exports = router;