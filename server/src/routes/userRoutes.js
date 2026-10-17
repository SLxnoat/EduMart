const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserById,
  updateUserProfile,
  changePassword,
  getUserSessions,
  revokeOtherSessions,
  exportUserData,
  deleteUserAccount
} = require('../controllers/authController');
const { protect, adminOrSelf } = require('../middleware/authMiddleware');
const {
  updateUserProfileSchema,
  changePasswordSchema
} = require('../validators/userValidator');

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

// User Profile routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validate(updateUserProfileSchema), updateUserProfile)
  .delete(protect, deleteUserAccount);

// Session Management routes
router
  .route('/sessions')
  .get(protect, getUserSessions)
  .delete(protect, revokeOtherSessions);

// GDPR Data Export route
router.get('/export-data', protect, exportUserData);

// PUT  /api/users/change-password — Private
router.put(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  changePassword
);

// GET  /api/users/:id — Private (Admin or Self)
router.get('/:id', protect, adminOrSelf, getUserById);

module.exports = router;

