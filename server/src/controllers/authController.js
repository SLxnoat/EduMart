const { User, Session, Order, Review, Notification, AiInteraction } = require('../models');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const { Op } = require('sequelize');
const { revokeToken } = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

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
    const emailResult = await sendVerificationEmail(normalizedEmail, user.first_name, verificationToken);

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
      emailSent: emailResult.sent,
      ...(process.env.NODE_ENV === 'test' && { verificationToken }),
      message: emailResult.sent
        ? `Registration successful! A verification email has been sent to ${user.email}.`
        : 'Registration successful. Please verify your email.'
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

  const emailResult = await sendVerificationEmail(email, user.first_name, verificationToken);

  res.status(200).json({
    emailSent: emailResult.sent,
    message: emailResult.sent
      ? `Verification email sent to ${email}. Please check your inbox and spam folder.`
      : 'Verification email dispatched. Please check your email inbox.',
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

    await sendPasswordResetEmail(email, user.first_name, resetToken);
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

  // Dispatch security alert notification to user
  await createNotification({
    userId: user.id,
    type: 'security_alert',
    title: 'Security Alert: Password Changed',
    message: 'Your account password was updated successfully. If you did not initiate this change, please contact support immediately.',
    priority: 'urgent'
  });

  res.status(200).json({ message: 'Password updated successfully' });
});

// @desc    Get active login sessions for user
// @route   GET /api/users/sessions
// @access  Private
const getUserSessions = asyncHandler(async (req, res) => {
  if (!Session) {
    return res.status(200).json({ sessions: [] });
  }

  const sessions = await Session.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']]
  });

  const formatted = sessions.map((s) => ({
    id: s.id,
    ip_address: s.ip_address || '127.0.0.1',
    user_agent: s.user_agent || 'Web Browser',
    created_at: s.created_at,
    expires_at: s.expires_at,
    is_current: s.token === req.token
  }));

  res.status(200).json({ sessions: formatted });
});

// @desc    Revoke all other device sessions
// @route   DELETE /api/users/sessions
// @access  Private
const revokeOtherSessions = asyncHandler(async (req, res) => {
  if (!Session) {
    return res.status(200).json({ message: 'Session store not active' });
  }

  const destroyed = await Session.destroy({
    where: {
      user_id: req.user.id,
      token: { [Op.ne]: req.token }
    }
  });

  res.status(200).json({
    message: `Revoked ${destroyed} other active session${destroyed === 1 ? '' : 's'}`
  });
});

// @desc    Export personal data archive (GDPR compliance)
// @route   GET /api/users/export-data
// @access  Private
const exportUserData = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash', 'verification_token', 'reset_token'] }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Aggregate user records across modules safely
  let userOrders = [];
  try {
    if (Order) {
      userOrders = await Order.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'order_number', 'total_amount', 'status', 'created_at']
      });
    }
  } catch (e) {}

  let userReviews = [];
  try {
    if (Review) {
      userReviews = await Review.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'product_id', 'rating', 'title', 'comment', 'created_at']
      });
    }
  } catch (e) {}

  let userNotifications = [];
  try {
    if (Notification) {
      userNotifications = await Notification.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'title', 'message', 'type', 'created_at']
      });
    }
  } catch (e) {}

  let activeSessions = [];
  try {
    if (Session) {
      activeSessions = await Session.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'ip_address', 'user_agent', 'created_at']
      });
    }
  } catch (e) {}

  res.status(200).json({
    export_metadata: {
      platform: 'EduMart Academic E-Commerce Platform',
      compliance: 'GDPR Article 15 Data Portability',
      generated_at: new Date().toISOString(),
      account_email: user.email
    },
    user_profile: user,
    active_sessions: activeSessions,
    orders: userOrders,
    reviews: userReviews,
    notifications: userNotifications
  });
});

// @desc    Self-service account deactivation
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Password is required to confirm account deletion');
  }

  const user = await User.findByPk(req.user.id);
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Incorrect password confirmation');
  }

  // Revoke token and terminate all sessions
  if (Session) {
    await Session.destroy({ where: { user_id: user.id } });
  }
  revokeToken(req.token);

  user.is_active = false;
  await user.save();

  res.status(200).json({
    message: 'Account deactivated successfully. You have been logged out.'
  });
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
  changePassword,
  getUserSessions,
  revokeOtherSessions,
  exportUserData,
  deleteUserAccount
};