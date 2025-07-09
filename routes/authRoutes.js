// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');

// Auth endpoints
router.post('/register',      register);
router.post('/login',         login);
router.post('/send-otp',      sendOtp);
router.post('/verify-otp',    verifyOtp);
router.post('/reset_password', resetPassword);

module.exports = router;
