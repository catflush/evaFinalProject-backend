import Joi from 'joi';
import ErrorResponse from '../utils/errorResponse.js';

// User registration schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]{6,20}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 30 characters',
      'any.required': 'Password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Password confirmation is required'
    }),

  firstName: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'First name cannot exceed 50 characters'
    }),

  lastName: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    
  username: Joi.string()
    .trim()
    .max(30)
    .allow('', null)
    .messages({
      'string.max': 'Username cannot exceed 30 characters'
    })
});

// User login schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Update profile schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .messages({
      'string.max': 'First name cannot exceed 50 characters'
    }),

  lastName: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .messages({
      'string.max': 'Last name cannot exceed 50 characters'
    }),

  email: Joi.string()
    .email()
    .allow('', null)
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]{6,20}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

// Change password schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(30)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 30 characters',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Password confirmation is required'
    })
});

// Validation middleware
const validateJOI = schema => (req, res, next) => {
  const { error } = schema.validate(req.body);
  return error ? next(new ErrorResponse(error.message, 400)) : next();
};

export {
  validateJOI,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};
