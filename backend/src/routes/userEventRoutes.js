import express from 'express';
import {
  addEventToUser,
  updateEventInUserList,
  deleteEventFromUserList
} from '../controllers/userEventController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * @route   POST /users/:id/events
 * @desc    Add an event to user's list
 * @access  Private
 */
router.post('/:id/events', authenticate, addEventToUser);

/**
 * @route   PUT /users/:id/events/:eventId
 * @desc    Update an event in user's list
 * @access  Private
 */
router.put('/:id/events/:eventId', authenticate, updateEventInUserList);

/**
 * @route   DELETE /users/:id/events/:eventId
 * @desc    Delete an event from user's list
 * @access  Private
 */
router.delete('/:id/events/:eventId', authenticate, deleteEventFromUserList);

export default router; 