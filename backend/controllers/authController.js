const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { verifyIdToken } = require('../config/firebase');

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, address, phone } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler('User already exists', 400));
  }

  try {
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      address,
      phone
    });

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }

  try {
    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    return next(new ErrorHandler('Invalid credentials', 401));
  }
});

/**
 * @description Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    return next(new ErrorHandler('User not found', 404));
  }
});

/**
 * @description Update user profile
 * @route PUT /api/auth/me
 * @access Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, address, phone } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, address, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Update user password
 * @route PUT /api/auth/update-password
 * @access Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new ErrorHandler('Password must be at least 6 characters', 400));
  }

  try {
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return next(new ErrorHandler('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Password updated successfully'
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Forgot password - generate reset token
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Please provide an email address', 400));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler('User not found with this email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email
    try {
      await emailService.sendPasswordReset(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler('Could not send password reset email', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetUrl 
      })
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler('Could not generate reset token', 500));
  }
});

/**
 * @description Reset password using token
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password) {
    return next(new ErrorHandler('Please provide a new password', 400));
  }

  if (password.length < 6) {
    return next(new ErrorHandler('Password must be at least 6 characters', 400));
  }

  // Hash token to compare with database
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorHandler('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token for auto login
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: userWithoutPassword,
      token: jwtToken
    });
  } catch (error) {
    return next(new ErrorHandler('Failed to reset password', 500));
  }
});

/**
 * @description Google Sign-In
 * @route POST /api/auth/google
 * @access Public
 */
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  // Validate input
  if (!idToken) {
    return next(new ErrorHandler('No ID token provided', 400));
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const { email, name, picture, uid: googleId } = decodedToken;

    if (!email) {
      return next(new ErrorHandler('Email not provided by Google', 400));
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture) user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user from Google account
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        authProvider: 'google',
        profilePicture: picture,
        // No password for Google OAuth users
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response (if any)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: userResponse,
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    return next(new ErrorHandler(error.message || 'Failed to authenticate with Google', 401));
  }
});
