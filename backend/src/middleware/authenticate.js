import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import Event from '../models/Event.js';

/**
 * Middleware to authenticate users based on JWT token
 * Adds the authenticated user to the request object
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      // eslint-disable-next-line no-undef
      const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
      const decoded = jwt.verify(token, secret);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // Add user to request object
      req.user = user;
      next();
    } catch {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after authenticate middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * Must be used after authenticate middleware
 */
export const selfAccess = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // Check if user is accessing their own resource
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access this resource', 403)
    );
  }

  next();
};

/**
 * Middleware to check if user is authenticated
 * This allows any authenticated user to manage events
 * Must be used after authenticate middleware
 */
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  next();
}; 