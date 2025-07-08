const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const jwt = require('jsonwebtoken');

// Function to generate a JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// @desc    Register a new user
// @route   POST /register
exports.register = async (req, res) => {
    console.log("register function");
  const { email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ ok: false, err: 'register' });
    }

    // Password strength check (example: at least 8 chars)
    if (password.length < 8) {
        return res.status(400).json({ ok: false, err: 'weakpass' });
    }

    // Create a new user
    const user = await User.create({ email, password, role });

    if (user) {
      res.status(201).json({ ok: true });
    } else {
      res.status(400).json({ ok: false, err: 'invalid-data' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, err: 'server-error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /login
exports.login = async (req, res) => {
  console.log("login function");
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (user) {
      console.log("user found");
    }

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,         // Required for HTTPS
        sameSite: 'None',     // For cross-origin
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.json({
        ok: true,
        token: token,
      });
    } else {
      res.status(401).json({ ok: false, err: 'invalid-credentials' });
    }

  } catch (error) {
    console.error("Login error:", error); // Add this to see detailed error in console
    res.status(500).json({ ok: false, err: 'server-error' });
  }
};


// @desc    Send OTP for password reset
// @route   POST /send-otp
exports.sendOtp = async (req, res) => {
    console.log("sen otp function");
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ ok: false, err: 'not-found' });
        }
        
        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Save OTP and expiry to user document
        user.otp = otp;
        // Set OTP to expire in 5 minutes
        user.otpExpires = Date.now() + 5 * 60 * 1000; 
        await user.save({ validateBeforeSave: false });

        // Send email
        const message = `<p>Your One-Time Password (OTP) for password reset is:</p>
                         <h2>${otp}</h2>
                         <p>This code will expire in 5 minutes.</p>`;
        
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset OTP',
            html: message,
        });

        res.status(200).json({ ok: true, msg: 'OTP sent' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, err: 'email-error' });
    }
};

// @desc    Verify OTP
// @route   POST /verify-otp
exports.verifyOtp = async (req, res) => {
    console.log("verify otp function");
    const { email, otp } = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({ email });
        if(user){
            console.log("user foun");
        }
        if (!user) {
            return res.status(400).json({ ok: false, err: 'mismatch' });
        }
        
        // Check if OTP is correct and not expired
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ ok: false, err: user.otpExpires < Date.now() ? 'expired' : 'invalid' });
        }
        
        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ ok: true, msg: 'OTP verified' });

    } catch (error) {
        res.status(500).json({ ok: false, err: 'server-error' });
    }
};


// @desc    Reset password after OTP verification
// @route   POST /reset_password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ ok: false, err: 'not-found' });
        }

        // Check if new password is same as old
        const isSamePassword = await user.matchPassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({ ok: false, err: 'samepass' });
        }

        // Set new password and save
        user.password = newPassword;
        await user.save(); // The 'save' middleware will hash the new password

        res.status(200).json({ ok: true, msg: 'Password has been reset' });

    } catch (error) {
        res.status(500).json({ ok: false, err: 'server-error' });
    }
};
