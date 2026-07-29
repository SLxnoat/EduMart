const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user - hashing is handled by the model hook
  const user = await User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password_hash: password, // Hook will hash this
    phone,
    role: role || 'student'
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user.id)
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

  // Check for user email
  const user = await User.findOne({ where: { email } });

  if (user && (await user.matchPassword(password))) {
    // Update last login
    user.last_login = new Date();
    await user.save();

    res.json({
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user.id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] }
  });

  if (user) {
    res.json({
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    user.first_name = req.body.firstName || user.first_name;
    user.last_name = req.body.lastName || user.last_name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};