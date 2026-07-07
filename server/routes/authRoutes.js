const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');

// Placeholder routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getUserProfile);

module.exports = router;
