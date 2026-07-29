const Joi = require('joi');

// Validation for user registration
const registerUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  phone: Joi.string().pattern(/^[0-9\+\(\)\s\-]{10,20}$/).optional(),
  role: Joi.string().valid('student', 'tutor', 'institute', 'admin').default('student')
});

// Validation for user login
const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required()
});

// Validation for profile update
const updateUserProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9\+\(\)\s\-]{10,20}$/).optional()
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserProfileSchema
};