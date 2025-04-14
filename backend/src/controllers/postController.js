import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to log file paths
const logFileInfo = (file, operation) => {
  console.log(`\n=== ${operation} File Info ===`);
  console.log('Original filename:', file.originalname);
  console.log('Generated filename:', file.filename);
  console.log('Mimetype:', file.mimetype);
  console.log('Size:', file.size, 'bytes');
  console.log('Path:', file.path);
  console.log('Destination:', file.destination);
  console.log('=====================\n');
};

// Helper function to log directory info
const logDirectoryInfo = (dirPath) => {
  console.log(`\n=== Directory Info ===`);
  console.log('Directory path:', dirPath);
  console.log('Directory exists:', fs.existsSync(dirPath));
  if (fs.existsSync(dirPath)) {
    console.log('Directory contents:', fs.readdirSync(dirPath));
  }
  console.log('=====================\n');
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to get correct file path
const getFilePath = (relativePath) => {
  if (!relativePath) return null;
  // Remove any duplicate 'uploads' in the path
  const cleanPath = relativePath.replace(/uploads\/uploads/g, 'uploads');
  return path.join(__dirname, '../../', cleanPath);
};

// Helper function to log image path
const logImagePath = (postId, imagePath) => {
  if (!imagePath) return;
  
  console.log(`\n=== Post ${postId} Image ===`);
  console.log('Relative path:', imagePath);
  const fullPath = getFilePath(imagePath);
  console.log('Full path:', fullPath);
  console.log('File exists:', fs.existsSync(fullPath));
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log('File size:', stats.size, 'bytes');
    console.log('Last modified:', stats.mtime);
  }
  console.log('=====================\n');
};

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
    
    // Log image paths for each post
    posts.forEach(post => {
      if (post.image) {
        console.log(`\n=== Post ${post._id} Image ===`);
        console.log('Image path:', post.image);
        console.log('Full path:', path.join(__dirname, '../../uploads', post.image));
      }
    });
    
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
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Log directory info before processing files
    logDirectoryInfo(uploadsDir);
    
    // Log uploaded file if exists
    if (req.file) {
      logFileInfo(req.file, 'Upload');
    }

    const postData = {
      content: req.body.content,
      author: req.user._id,
    };

    if (req.file) {
      // Store the relative path to the uploads directory
      postData.image = `/uploads/posts/${req.file.filename}`;
    }

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName');

    // Log the created post with image path
    logImagePath(post._id, post.image);

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

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Log existing image
    if (post.image) {
      logImagePath(post._id, post.image);
    }
    
    // Log new file if uploaded
    if (req.file) {
      logFileInfo(req.file, 'Update');
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Handle image update if a new image is uploaded
    let image = post.image;
    if (req.file) {
      // Delete old image if it exists
      if (post.image) {
        const oldImagePath = getFilePath(post.image);
        if (fs.existsSync(oldImagePath)) {
          await fs.promises.unlink(oldImagePath);
          console.log('Old image deleted successfully');
        }
      }
      image = `/uploads/posts/${req.file.filename}`;
    }

    // Update post
    post.content = content;
    post.image = image;
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

    // Log updated post with image path
    logImagePath(post._id, post.image);

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
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

    // Log and delete image
    if (post.image) {
      const filePath = getFilePath(post.image);
      console.log('\n=== Deleting Post Image ===');
      console.log('Image path:', post.image);
      console.log('Full path:', filePath);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log('Image deleted successfully');
      } else {
        console.log('Image file not found');
      }
    }

    // Use deleteOne() instead of remove()
    await Post.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
}; 