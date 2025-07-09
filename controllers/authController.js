// controllers/authController.js
const crypto    = require('crypto');
const User      = require('../models/User');
const sendEmail = require('../utils/mailer');
const jwt       = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Register new user
// @route   POST /register
exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ ok: false, err: 'register' });
    }
    if (password.length < 8) {
      return res.status(400).json({ ok: false, err: 'weakpass' });
    }

    const user = await User.create({ email, password, role });
    return user
      ? res.status(201).json({ ok: true })
      : res.status(400).json({ ok: false, err: 'invalid-data' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ ok: false, err: 'server-error' });
  }
};

// @desc    Authenticate & issue token
// @route   POST /login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      const token = generateToken(user._id, user.role);
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.json({ ok: true, token });
    }
    return res.status(401).json({ ok: false, err: 'invalid-credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ ok: false, err: 'server-error' });
  }
};

// @desc    Send OTP for reset
// @route   POST /send-otp
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, err: 'not-found' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const message = `
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>Expires in 5 minutes.</p>
    `;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      html: message,
    });

    return res.json({ ok: true, msg: 'OTP sent' });
  } catch (error) {
    console.error('sendOtp error:', error);
    return res.status(500).json({ ok: false, err: 'email-error' });
  }
};

// @desc    Verify OTP
// @route   POST /verify-otp
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user
      || user.otp !== otp
      || user.otpExpires < Date.now()
    ) {
      const err = !user ? 'mismatch' : (user.otpExpires < Date.now() ? 'expired' : 'invalid');
      return res.status(400).json({ ok: false, err });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.json({ ok: true, msg: 'OTP verified' });
  } catch (error) {
    console.error('verifyOtp error:', error);
    return res.status(500).json({ ok: false, err: 'server-error' });
  }
};

// @desc    Reset password
// @route   POST /reset_password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, err: 'not-found' });
    }
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({ ok: false, err: 'samepass' });
    }

    user.password = newPassword;
    await user.save();
    return res.json({ ok: true, msg: 'Password has been reset' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ ok: false, err: 'server-error' });
  }
};
