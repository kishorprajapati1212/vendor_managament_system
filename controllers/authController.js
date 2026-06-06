const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../utils/emailService');

// @desc    POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, phone, role } = req.body;

  if (!email || !password || !full_name) {
    res.statusCode = 400;
    throw new Error('Missing registration details. Please provide email, password, and full_name.');
  }

  // Rule Protection Safeguard: Only allow managers or admins to assign administrative roles
  if (role && ['admin', 'manager'].includes(role)) {
    // If testing validation mid-hackathon without access-tokens, you can comment this block out
    if (!req.user || req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Unauthorized: Only Administrator roles can assign privileged permissions.');
    }
  }

  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    res.statusCode = 400;
    throw new Error('Account email is already registered.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await userRepository.create(email, hashedPassword, full_name, phone, role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: newUser
  });
});

// @desc    POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.statusCode = 400;
    throw new Error('Please provide both email and password.');
  }

  const user = await userRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.statusCode = 401;
    throw new Error('Invalid email or password credentials.');
  }

  // Create JWT session expiration window (24 Hours out)
  const expiresInSec = 24 * 60 * 60;
  const expiresAtDate = new Date(Date.now() + expiresInSec * 1000);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );

  // Store metadata to session tracking database table
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'Unknown Client';
  await userRepository.createSession(user.id, token, expiresAtDate, ip, ua);
  await userRepository.updateLastLogin(user.id);

  res.status(200).json({
    success: true,
    data: {
      token,
      expires_at: expiresAtDate.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      }
    }
  });
});

// @desc    POST /auth/logout
const logout = asyncHandler(async (req, res) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    await userRepository.deleteSession(token);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/// @desc    POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.statusCode = 400;
    throw new Error('Please supply your email address.');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    res.statusCode = 404;
    throw new Error('No user profile found matching this email.');
  }

  // 1. Generate 6-Digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Min Window

  // 2. Save it directly to your user_otps table
  const otpRecord = await userRepository.saveOTP(email, otp, expiresAt);
  
  // 3. CRITICAL HACKATHON SHORTCUT: Link the numeric OTP string as the valid reset token
  await userRepository.linkResetTokenToOTP(otpRecord.id, otp);

  // 4. Send email (It will show up in your terminal logs or landing inbox)
  await emailService.sendOTP(email, otp);

  res.status(200).json({
    success: true,
    message: 'Password reset email sent'
  });
});

// @desc    POST /auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  // Convert token explicitly to a string just in case an unquoted number is sent in JSON
  const token = req.body.token ? req.body.token.toString() : null;
  const { new_password } = req.body;

  if (!token || !new_password) {
    res.statusCode = 400;
    throw new Error('Missing token or new_password update values.');
  }

  // Searches user_otps where reset_token matches your 6-digit number string
  const tokenRecord = await userRepository.findByResetToken(token);
  if (!tokenRecord) {
    res.statusCode = 400;
    throw new Error('Invalid or expired password reset token validation link.');
  }

  // Hash new password and update user record
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(new_password, salt);

  await userRepository.updatePassword(tokenRecord.email, hashedPassword);
  
  // FIXED: No more "pool is not defined" error! We use the repository layer.
  await userRepository.deleteOTPRecord(tokenRecord.id);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    GET /auth/me
const getMe = asyncHandler(async (req, res) => {
  // req.user is already fetched from database by protect middleware
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      phone: req.user.phone || null,
      last_login_at: req.user.last_login_at || null
    }
  });
});

module.exports = { register, login, logout, forgotPassword, resetPassword, getMe };