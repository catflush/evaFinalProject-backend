import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   GET /users
 * @desc    Get all users with their events
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize('admin'), getUsers);

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Private/Admin
 */
router.post('/', authenticate, authorize('admin'), createUser);

/**
 * @route   GET /users/:id
 * @desc    Get a specific user by ID with their events
 * @access  Private
 */
router.get('/:id', authenticate, getUser);

/**
 * @route   PUT /users/:id
 * @desc    Update a specific user
 * @access  Private
 */
router.put('/:id', authenticate, updateUser);

/**
 * @route   DELETE /users/:id
 * @desc    Delete a specific user
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router; 