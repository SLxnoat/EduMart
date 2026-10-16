const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User, Session } = require('../models');

// In-memory revocation set for fast token invalidation upon logout
const revokedTokens = new Set();

const revokeToken = async (token) => {
  if (!token) return;
  revokedTokens.add(token);
  if (Session) {
    try {
      await Session.destroy({ where: { token } });
    } catch (e) {
      // Ignore if sessions table is not synced in isolated unit tests
    }
  }
};

const isTokenRevoked = (token) => revokedTokens.has(token);

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

      if (isTokenRevoked(token)) {
        res.status(401);
        throw new Error('Not authorized, token has been revoked');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token - use Sequelize findByPk
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (!req.user.is_active) {
        res.status(403);
        throw new Error('Forbidden: Account has been deactivated');
      }

      req.token = token;
      next();
    } catch (error) {
      const status = res.statusCode === 403 ? 403 : 401;
      res.status(status);
      throw new Error(error.message || 'Not authorized, token failed');
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

// Institute middleware (roles: 'institute', 'admin')
const institute = (req, res, next) => {
  if (req.user && (req.user.role === 'institute' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Forbidden: institute access required');
  }
};

// Admin or Self middleware (for /api/users/:id)
const adminOrSelf = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || String(req.user.id) === String(req.params.id))) {
    next();
  } else {
    res.status(403);
    throw new Error('Forbidden: admin or account owner access required');
  }
};

// Generic role authorization middleware factory
const authorize = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403);
    throw new Error(`Forbidden: requires one of [${roles.join(', ')}] role`);
  }
};

module.exports = {
  protect,
  admin,
  seller,
  institute,
  adminOrSelf,
  authorize,
  revokeToken,
  isTokenRevoked
};