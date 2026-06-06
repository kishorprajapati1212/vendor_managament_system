const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// The 'protect' middleware ensures only logged-in users with a valid token can hit this
router.get('/profile', protect, getUserProfile);

module.exports =  router ;