const { User, Session } = require('../models');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const { Op } = require('sequelize');
const { revokeToken } = require('../middleware/authMiddleware');

// Sanitize input string against XSS
const sanitizeText = (str) => (typeof str === 'string' ? validator.escape(str.trim()) : str);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id, jti: crypto.randomBytes(8).toString('hex') },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

// Persist active session if Session table is available
const recordSession = async (userId, token, req) => {
  if (!Session || !token) return;
  try {
    await Session.create({
      user_id: userId,
      token,
      expires_at: new Date(Date.now() + 3600000),
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.headers?.['user-agent'] || null
    });
  } catch (e) {
    // Non-blocking if sessions table is not synced in isolated unit tests
  }
};

// Calculate profile completion score and missing field tips
const calculateProfileCompletion = (user) => {
  let score = 20; // Base score for registration
  if (user.is_verified) score += 25;
  if (user.phone) score += 20;
  if (user.institution) score += 20;
  if (user.first_name && user.last_name) score += 15;
  return Math.min(100, score);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role, institution } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const userExists = await User.findOne({ where: { email: normalizedEmail } });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user - hashing is handled by the model hook (12 rounds)
  const user = await User.create({
    first_name: sanitizeText(firstName),
    last_name: sanitizeText(lastName),
    email: normalizedEmail,
    password_hash: password,
    phone: phone ? phone.trim() : null,
    institution: institution ? sanitizeText(institution) : null,
    role: role || 'student',
    verification_token: verificationToken,
    is_verified: false
  });

  if (user) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.log(`[AUTH] Verification token for ${normalizedEmail}: ${verificationToken}`);
    }

    const token = generateToken(user.id);
    await recordSession(user.id, token, req);

    res.status(201).json({
      id: user.id,
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
      role: user.role,
      isVerified: user.is_verified,
      profileCompletion: calculateProfileCompletion(user),
      createdAt: user.created_at || user.createdAt,
      token,
      message: 'Registration successful. Please verify your email.'
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  // Check for user email
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (user && (await user.matchPassword(password))) {
    if (!user.is_active) {
      res.status(403);
      throw new Error('Forbidden: Account has been deactivated');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const token = generateToken(user.id);
    await recordSession(user.id, token, req);

    res.json({
      id: user.id,
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
      role: user.role,
      isVerified: user.is_verified,
      profileCompletion: calculateProfileCompletion(user),
      lastLogin: user.last_login,
      createdAt: user.created_at || user.createdAt,
      token
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({ where: { verification_token: token } });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  user.is_verified = true;
  user.verification_token = null;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully' });
});

// @desc    Resend verification email token
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = (req.body.email || req.user?.email || '').trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error('Email address is required');
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(200).json({
      message: 'If that email address is registered and unverified, a verification link has been sent.'
    });
  }

  if (user.is_verified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verification_token = verificationToken;
  await user.save();

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.log(`[AUTH] Resent verification token for ${email}: ${verificationToken}`);
  }

  res.status(200).json({
    message: 'Verification email resent successfully.',
    ...(process.env.NODE_ENV === 'test' && { verificationToken })
  });
});

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ where: { email } });

  let resetToken;
  if (user) {
    resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_token = resetToken;
    user.reset_expires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.log(`[AUTH] Password reset token for ${email}: ${resetToken}`);
    }
  }

  // Return generic response to prevent user enumeration
  res.status(200).json({
    message: 'If that email address is in our database, we will send a password reset link.',
    ...(process.env.NODE_ENV === 'test' && { resetToken })
  });
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_expires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password_hash = newPassword; // Hook hashes this with 12 rounds
  user.reset_token = null;
  user.reset_expires = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
});

// @desc    Logout user & revoke current session token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const token =
    req.token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    await revokeToken(token);
  }

  res.status(200).json({ message: 'Successfully logged out' });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  const token = generateToken(req.user.id);
  await recordSession(req.user.id, token, req);
  res.status(200).json({ token });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash', 'reset_token', 'verification_token'] }
  });

  if (user) {
    res.json({
      id: user.id,
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
      role: user.role,
      isVerified: user.is_verified,
      profileCompletion: calculateProfileCompletion(user),
      lastLogin: user.last_login,
      createdAt: user.created_at || user.createdAt
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID (Admin or Self)
// @route   GET /api/users/:id
// @access  Private (Admin/Self)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password_hash', 'reset_token', 'verification_token'] }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    id: user.id,
    _id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    institution: user.institution,
    role: user.role,
    isVerified: user.is_verified,
    isActive: user.is_active,
    profileCompletion: calculateProfileCompletion(user),
    lastLogin: user.last_login,
    createdAt: user.created_at || user.createdAt
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    if (req.body.firstName) user.first_name = sanitizeText(req.body.firstName);
    if (req.body.lastName) user.last_name = sanitizeText(req.body.lastName);
    if (req.body.phone !== undefined) user.phone = req.body.phone ? req.body.phone.trim() : null;
    if (req.body.institution !== undefined) {
      user.institution = req.body.institution ? sanitizeText(req.body.institution) : null;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser.id,
      _id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      institution: updatedUser.institution,
      role: updatedUser.role,
      isVerified: updatedUser.is_verified,
      profileCompletion: calculateProfileCompletion(updatedUser),
      lastLogin: updatedUser.last_login,
      createdAt: updatedUser.created_at || updatedUser.createdAt
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password does not match');
  }

  user.password_hash = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshToken,
  getUserProfile,
  getUserById,
  updateUserProfile,
  changePassword
};