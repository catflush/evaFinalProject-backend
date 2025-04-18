import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the base uploads directory
const BASE_UPLOADS_DIR = path.join(__dirname, '../../uploads');
const POSTS_UPLOADS_DIR = path.join(BASE_UPLOADS_DIR, 'posts');

// Create uploads directories if they don't exist
if (!fs.existsSync(BASE_UPLOADS_DIR)) {
  fs.mkdirSync(BASE_UPLOADS_DIR, { recursive: true });
  console.log('Created base uploads directory:', BASE_UPLOADS_DIR);
}

if (!fs.existsSync(POSTS_UPLOADS_DIR)) {
  fs.mkdirSync(POSTS_UPLOADS_DIR, { recursive: true });
  console.log('Created posts uploads directory:', POSTS_UPLOADS_DIR);
}

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName')
      .populate('comments.author', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

/**
 * @desc    Create a new post
 * @route   POST /posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const postData = {
      content: req.body.content,
      author: req.user._id,
    };

    if (req.file) {
      postData.image = `posts/${req.file.filename}`;
    }

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

/**
 * @desc    Like a post
 * @route   POST /posts/:id/like
 * @access  Private
 */
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /posts/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName')
      .populate('comments.author', 'firstName lastName');

    res.json(populatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Handle image update if a new image is uploaded
    if (req.file) {
      // Delete old image if it exists
      if (post.image) {
        const oldImagePath = path.join(BASE_UPLOADS_DIR, post.image);
        if (fs.existsSync(oldImagePath)) {
          await fs.promises.unlink(oldImagePath);
        }
      }
      post.image = `posts/${req.file.filename}`;
    }

    post.content = content;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName')
      .populate('likes', 'firstName lastName')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName'
        }
      });

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete image if exists
    if (post.image) {
      const filePath = path.join(BASE_UPLOADS_DIR, post.image);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await Post.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
}; 