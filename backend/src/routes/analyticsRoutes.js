import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { admin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /analytics
 * @desc    Get analytics data
 * @access  Private (Admin only)
 */
router.get('/', authenticate, admin, getAnalytics);

export default router; 