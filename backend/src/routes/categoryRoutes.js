import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   GET /categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /categories/:id
 * @desc    Get a specific category
 * @access  Public
 */
router.get('/:id', getCategory);

/**
 * @route   POST /categories
 * @desc    Create a new category
 * @access  Private (Authenticated Users)
 */
router.post('/', authenticate, createCategory);

/**
 * @route   PUT /categories/:id
 * @desc    Update a specific category
 * @access  Private/Admin
 */
router.put('/:id', authenticate, authorize('admin'), updateCategory);

/**
 * @route   DELETE /categories/:id
 * @desc    Delete a specific category
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router; 