import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   GET /bookings
 * @desc    Get all bookings
 * @access  Private
 */
router.get('/', authenticate, getBookings);

/**
 * @route   GET /bookings/:id
 * @desc    Get a specific booking
 * @access  Private
 */
router.get('/:id', authenticate, getBooking);

/**
 * @route   POST /bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', authenticate, createBooking);

/**
 * @route   PUT /bookings/:id
 * @desc    Update a specific booking
 * @access  Private
 */
router.put('/:id', authenticate, updateBooking);

/**
 * @route   DELETE /bookings/:id
 * @desc    Delete a specific booking
 * @access  Private
 */
router.delete('/:id', authenticate, deleteBooking);

export default router; 