const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { updateUserProfileSchema } = require('../validators/userValidator');

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

// GET  /api/users/profile  — Private
// PUT  /api/users/profile  — Private
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validate(updateUserProfileSchema), updateUserProfile);

module.exports = router;
