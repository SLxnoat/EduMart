const Joi = require('joi');

// Validation for user registration
const registerUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(30).required(),
  phone: Joi.string().pattern(/^[0-9\+\(\)\s\-]{10,20}$/).optional().allow('', null),
  institution: Joi.string().trim().max(150).optional().allow('', null),
  role: Joi.string().valid('student', 'tutor', 'institute', 'admin').default('student')
});

// Validation for user login
const loginUserSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(30).required(),
  rememberMe: Joi.boolean().optional()
});

// Validation for email verification
const verifyEmailSchema = Joi.object({
  token: Joi.string().min(16).max(255).required(),
  email: Joi.string().trim().email().optional()
});

// Validation for resending verification email
const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

// Validation for forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

// Validation for reset password
const resetPasswordSchema = Joi.object({
  token: Joi.string().min(16).max(255).required(),
  newPassword: Joi.string().min(8).max(30).required()
});

// Validation for changing password
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(30).required()
});

// Validation for profile update
const updateUserProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9\+\(\)\s\-]{10,20}$/).optional().allow('', null),
  institution: Joi.string().trim().max(150).optional().allow('', null)
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserProfileSchema
};
