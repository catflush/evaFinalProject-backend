import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getHostedEvents
} from '../controllers/eventController.js';
import { authenticate, isAuthenticated } from '../middleware/authenticate.js';
import upload from '../utils/multerConfig.js';

const router = express.Router();

/**
 * @route   GET /events
 * @desc    Get all events, optionally filtered by category
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /events/hosted
 * @desc    Get events hosted by the current user
 * @access  Private
 */
router.get('/hosted', authenticate, getHostedEvents);

/**
 * @route   GET /events/:id
 * @desc    Get a specific event
 * @access  Public
 */
router.get('/:id', getEvent);

/**
 * @route   POST /events
 * @desc    Create a new event
 * @access  Private (Admin only)
 */
router.post('/', authenticate, isAuthenticated, upload.single('image'), createEvent);

/**
 * @route   PUT /events/:id
 * @desc    Update a specific event
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, isAuthenticated, upload.single('image'), updateEvent);

/**
 * @route   DELETE /events/:id
 * @desc    Delete a specific event
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, isAuthenticated, deleteEvent);

export default router; 