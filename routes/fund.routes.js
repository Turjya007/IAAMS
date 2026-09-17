// routes/fund.routes.js
const express = require('express');
const router = express.Router();
const { addFundEntry, getFundData } = require('../controllers/fund.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/fund → notun income/expense entry jog kora (shudhu Admin)
router.post('/', verifyToken, isAdmin, addFundEntry);

// GET /api/fund → sob entry + summary ana (shudhu Admin)
router.get('/', verifyToken, isAdmin, getFundData);

module.exports = router;