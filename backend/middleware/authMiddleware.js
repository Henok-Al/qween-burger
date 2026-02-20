const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');

/**
 * @description Protect routes with JWT authentication
 * @route * /api/*
 * @access Private
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer scheme
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from decoded token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new ErrorHandler('User not found', 401));
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return next(new ErrorHandler('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new ErrorHandler('Not authorized, no token', 401));
  }
});

/**
 * @description Check if user has specific role(s)
 * @route * /api/*
 * @access Private
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * @description Validate request body
 * @route * /api/*
 * @access Public
 */
exports.validateRequestBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    next();
  };
};

/**
 * @description Validate request parameters
 * @route * /api/*
 * @access Public
 */
exports.validateRequestParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    next();
  };
};

/**
 * @description Validate request query
 * @route * /api/*
 * @access Public
 */
exports.validateRequestQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    next();
  };
};
