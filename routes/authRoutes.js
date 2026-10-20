const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiting strictly for auth attempts (login & registration) to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

module.exports = router;
