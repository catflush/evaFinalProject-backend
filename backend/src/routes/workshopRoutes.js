import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getAllWorkshops,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getUpcomingWorkshops,
  getHostedWorkshops,
  registerForWorkshop,
  cancelRegistration,
  deleteAttachment
} from '../controllers/workshopController.js';
import { authenticate, isAuthenticated } from '../middleware/authenticate.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const WORKSHOPS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'workshops');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
if (!fs.existsSync(WORKSHOPS_UPLOADS_DIR)) {
  fs.mkdirSync(WORKSHOPS_UPLOADS_DIR);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, WORKSHOPS_UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

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
router.post('/', authenticate, upload.array('attachments', 5), createWorkshop);

/**
 * @route   PUT /workshops/:id
 * @desc    Update a specific workshop
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, upload.array('attachments', 5), updateWorkshop);

/**
 * @route   DELETE /workshops/:id
 * @desc    Delete a specific workshop
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, deleteWorkshop);

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

router.delete('/:id/attachments/:attachmentId', authenticate, deleteAttachment);

export default router; 