const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/adminController');

// Placeholder routes
router.get('/dashboard', getDashboardData);

module.exports = router;
