import Workshop from '../models/Workshop.js';
import Joi from 'joi';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the base uploads directory
const BASE_UPLOADS_DIR = path.join(__dirname, '../uploads');
const WORKSHOPS_UPLOADS_DIR = path.join(BASE_UPLOADS_DIR, 'workshops');

// Create uploads directories if they don't exist
if (!fs.existsSync(BASE_UPLOADS_DIR)) {
  fs.mkdirSync(BASE_UPLOADS_DIR, { recursive: true });
  console.log('Created base uploads directory:', BASE_UPLOADS_DIR);
}

if (!fs.existsSync(WORKSHOPS_UPLOADS_DIR)) {
  fs.mkdirSync(WORKSHOPS_UPLOADS_DIR, { recursive: true });
  console.log('Created workshops uploads directory:', WORKSHOPS_UPLOADS_DIR);
}

// Helper function to get correct file path
const getFilePath = (relativePath) => {
  if (!relativePath) return null;
  // Remove any duplicate 'uploads' in the path
  const cleanPath = relativePath.replace(/uploads\/uploads/g, 'uploads');
  return path.join(__dirname, '../../', cleanPath);
};

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

// Helper function to process image
const processImage = (file) => {
  if (!file) return null;
  
  return {
    filename: file.filename,
    path: `workshops/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size
  };
};

// Helper function to delete image
const deleteImage = async (image) => {
  if (!image) return;
  
  const filePath = path.join(BASE_UPLOADS_DIR, image.path);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};

// Validation schemas
const workshopValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  date: Joi.date().required().messages({
    'date.base': 'Valid date is required',
    'any.required': 'Date is required'
  }),
  time: Joi.string().required().messages({
    'string.empty': 'Time is required',
    'any.required': 'Time is required'
  }),
  duration: Joi.string().required().messages({
    'string.empty': 'Duration is required',
    'any.required': 'Duration is required'
  }),
  maxParticipants: Joi.number().min(1).required().messages({
    'number.min': 'Maximum participants must be at least 1',
    'any.required': 'Maximum participants is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  level: Joi.string().valid('beginner', 'intermediate', 'expert').default('beginner'),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null).messages({
    'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
  }),
  requirements: Joi.array().items(Joi.string()),
  learningOutcomes: Joi.array().items(Joi.string()),
  location: Joi.string(),
  equipment: Joi.array().items(Joi.string()),
  materials: Joi.array().items(Joi.string()),
  image: Joi.object({
    filename: Joi.string().required(),
    path: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required()
  }).allow(null)
});

// Separate validation schema for updates where fields are optional
const workshopUpdateValidationSchema = Joi.object({
  title: Joi.string().allow('').optional().messages({
    'string.empty': 'Title cannot be empty if provided'
  }),
  description: Joi.string().allow('').optional().messages({
    'string.empty': 'Description cannot be empty if provided'
  }),
  date: Joi.date().optional().messages({
    'date.base': 'Valid date is required if provided'
  }),
  time: Joi.string().allow('').optional().messages({
    'string.empty': 'Time cannot be empty if provided'
  }),
  duration: Joi.string().allow('').optional().messages({
    'string.empty': 'Duration cannot be empty if provided'
  }),
  maxParticipants: Joi.number().min(1).optional().messages({
    'number.min': 'Maximum participants must be at least 1'
  }),
  price: Joi.number().min(0).optional().messages({
    'number.min': 'Price cannot be negative'
  }),
  level: Joi.string().valid('beginner', 'intermediate', 'expert').optional(),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
  }),
  requirements: Joi.array().items(Joi.string()).optional(),
  learningOutcomes: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().allow('').optional(),
  equipment: Joi.array().items(Joi.string()).optional(),
  materials: Joi.array().items(Joi.string()).optional(),
  image: Joi.object({
    filename: Joi.string().required(),
    path: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required()
  }).allow(null).optional()
});

// Get all workshops with optional category filter
export const getAllWorkshops = async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = req.query;
    
    // Build query
    const query = {};
    if (categoryId) {
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        query.categoryId = categoryId;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID format'
        });
      }
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const workshops = await Workshop.find(query)
      .populate('instructor', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Workshop.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workshops.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: workshops
    });
  } catch (err) {
    console.error('Error fetching workshops:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get upcoming workshops
export const getUpcomingWorkshops = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const workshops = await Workshop.find({
      date: { $gte: currentDate },
      status: 'upcoming'
    })
      .populate('instructor', 'firstName lastName')
      .populate('categoryId', 'name')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: workshops.length,
      data: workshops
    });
  } catch (err) {
    console.error('Error fetching upcoming workshops:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get workshops hosted by instructor
export const getHostedWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find({ instructor: req.user.id })
      .populate('instructor', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .populate('categoryId', 'name')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: workshops.length,
      data: workshops
    });
  } catch (err) {
    console.error('Error fetching hosted workshops:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single workshop
export const getWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .populate('categoryId', 'name');
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error fetching workshop:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new workshop
export const createWorkshop = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      duration, 
      maxParticipants, 
      price, 
      categoryId, 
      location, 
      requirements, 
      isActive 
    } = req.body;
    
    // Log directory info before processing files
    logDirectoryInfo(WORKSHOPS_UPLOADS_DIR);
    
    // Log each uploaded file
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => logFileInfo(file, 'Upload'));
    }
    
    // Create workshop with attachments
    const workshop = new Workshop({
      title,
      description,
      date,
      time,
      duration,
      maxParticipants,
      price,
      categoryId,
      location,
      requirements,
      isActive,
      instructor: req.user._id,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: `workshops/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      })) || []
    });

    await workshop.save();
    
    // Log the created workshop
    console.log('\n=== Created Workshop ===');
    console.log('Workshop ID:', workshop._id);
    console.log('Attachments:', workshop.attachments);
    
    res.status(201).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error creating workshop:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a workshop
export const updateWorkshop = async (req, res) => {
  try {
    let workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }
    
    // Check if user is authorized to update this workshop
    if (req.user.role !== 'admin' && workshop.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this workshop'
      });
    }
    
    // Handle file uploads
    const attachments = [...workshop.attachments];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          path: `workshops/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }
    
    // Update workshop with new attachments
    workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        attachments
      },
      { new: true, runValidators: true }
    )
    .populate('instructor', 'firstName lastName email')
    .populate('categoryId', 'name')
    .populate('participants', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error updating workshop:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a workshop
export const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }
    
    // Check if user is authorized to delete this workshop
    if (req.user.role !== 'admin' && workshop.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this workshop'
      });
    }
    
    // Delete attachments
    if (workshop.attachments && workshop.attachments.length > 0) {
      workshop.attachments.forEach(attachment => {
        const filePath = getFilePath(attachment.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    await workshop.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting workshop:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Register for workshop
export const registerForWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Check if workshop is full
    if (workshop.participants.length >= workshop.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'Workshop is full'
      });
    }

    // Check if user is already registered
    if (workshop.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Already registered for this workshop'
      });
    }

    // Check if workshop is upcoming
    if (workshop.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        error: 'Cannot register for a workshop that is not upcoming'
      });
    }

    workshop.participants.push(req.user.id);
    await workshop.save();

    res.status(200).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error registering for workshop:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Cancel workshop registration
export const cancelRegistration = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Check if user is registered
    if (!workshop.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Not registered for this workshop'
      });
    }

    // Check if workshop is upcoming
    if (workshop.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel registration for a workshop that is not upcoming'
      });
    }

    workshop.participants = workshop.participants.filter(
      participant => participant.toString() !== req.user.id
    );
    await workshop.save();

    res.status(200).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error canceling workshop registration:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }
    
    // Check if user is authorized to delete this attachment
    if (req.user.role !== 'admin' && workshop.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this attachment'
      });
    }
    
    const attachment = workshop.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found'
      });
    }
    
    // Delete the file
    const filePath = getFilePath(attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove the attachment from the workshop
    attachment.remove();
    await workshop.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 