import express from 'express';
import {
  getPosts,
  createPost,
  likePost,
  addComment,
  updatePost,
  deletePost
} from '../controllers/postController.js';
import { authenticate } from '../middleware/authenticate.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Public
 */
router.get('/', getPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', authenticate, upload.single('image'), createPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/:id', authenticate, upload.single('image'), updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id', authenticate, deletePost);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like a post
 * @access  Private
 */
router.post('/:id/like', authenticate, likePost);

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/:id/comments', authenticate, addComment);

export default router; 