// routes/fund.routes.js
const express = require('express');
const router = express.Router();
const { addFundEntry, getFundData } = require('../controllers/fund.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/fund → নতুন income/expense entry যোগ করা (শুধু Admin)
router.post('/', verifyToken, isAdmin, addFundEntry);

// GET /api/fund → সব entry + summary আনা (শুধু Admin)
router.get('/', verifyToken, isAdmin, getFundData);

module.exports = router;