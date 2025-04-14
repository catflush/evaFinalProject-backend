import express from 'express';
import {
  getAllWorkshops,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getUpcomingWorkshops,
  getHostedWorkshops,
  registerForWorkshop,
  cancelRegistration
} from '../controllers/workshopController.js';
import { authenticate, isAuthenticated } from '../middleware/authenticate.js';
import upload from '../utils/multerConfig.js';

const router = express.Router();

/**
 * @route   GET /workshops
 * @desc    Get all workshops, optionally filtered by category
 * @access  Public
 */
router.get('/', getAllWorkshops);

/**
 * @route   GET /workshops/upcoming
 * @desc    Get upcoming workshops
 * @access  Public
 */
router.get('/upcoming', getUpcomingWorkshops);

/**
 * @route   GET /workshops/hosted
 * @desc    Get workshops hosted by the current user
 * @access  Private
 */
router.get('/hosted', authenticate, getHostedWorkshops);

/**
 * @route   GET /workshops/:id
 * @desc    Get a specific workshop
 * @access  Public
 */
router.get('/:id', getWorkshop);

/**
 * @route   POST /workshops
 * @desc    Create a new workshop
 * @access  Private (Admin only)
 */
router.post('/', authenticate, isAuthenticated, upload.array('attachments', 5), createWorkshop);

/**
 * @route   PUT /workshops/:id
 * @desc    Update a specific workshop
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, isAuthenticated, upload.array('attachments', 5), updateWorkshop);

/**
 * @route   DELETE /workshops/:id
 * @desc    Delete a specific workshop
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, isAuthenticated, deleteWorkshop);

/**
 * @route   POST /workshops/:id/register
 * @desc    Register for a workshop
 * @access  Private
 */
router.post('/:id/register', authenticate, registerForWorkshop);

/**
 * @route   DELETE /workshops/:id/register
 * @desc    Cancel workshop registration
 * @access  Private
 */
router.delete('/:id/register', authenticate, cancelRegistration);

export default router; 