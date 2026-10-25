const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshToken
} = require('../controllers/authController');
const {
  registerUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/userValidator');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Reusable Joi validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map((d) => d.message)
    });
  }
  next();
};

// Apply rate limiter to auth endpoints (5 req/min)
router.use(authRateLimiter({ windowMs: 60 * 1000, max: 5 }));

// Public routes
router.post('/register', validate(registerUserSchema), registerUser);
router.post('/login', validate(loginUserSchema), loginUser);
// Dedicated validation for email verification supporting both POST (body) and GET (query)
const validateVerifyEmail = (req, res, next) => {
  const data = {
    token: req.body?.token || req.query?.token,
    email: req.body?.email || req.query?.email
  };
  const { error } = verifyEmailSchema.validate(data, { abortEarly: false });
  if (error) {
    if (req.method === 'GET') {
      const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      return res.redirect(`${baseUrl}/verify-email?status=error&message=${encodeURIComponent('Invalid verification token')}`);
    }
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map((d) => d.message)
    });
  }
  next();
};

router.route('/verify-email')
  .post(validateVerifyEmail, verifyEmail)
  .get(validateVerifyEmail, verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerificationEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', protect, logoutUser);
router.post('/refresh', protect, refreshToken);

module.exports = router;