const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token - use Sequelize findByPk
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Forbidden: admin access required');
  }
};

// Seller/Tutor middleware (roles: 'tutor', 'institute', 'admin' — matches User model ENUM)
const seller = (req, res, next) => {
  if (req.user && (req.user.role === 'tutor' || req.user.role === 'institute' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Forbidden: seller/tutor access required');
  }
};

module.exports = { protect, admin, seller };