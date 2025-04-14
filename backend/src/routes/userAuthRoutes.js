import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/userController.js';
import { validateJOI, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../middleware/validateJOI.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   POST /users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateJOI(registerSchema), register);

/**
 * @route   POST /users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateJOI(loginSchema), login);

/**
 * @route   GET /auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateJOI(updateProfileSchema), updateProfile);

/**
 * @route   PUT /users/change-password
 * @desc    Change user password
 * @access  Public
 */
router.put('/change-password', validateJOI(changePasswordSchema), changePassword);

/**
 * @route   DELETE /auth/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/delete-account', authenticate, deleteAccount);

export default router; 