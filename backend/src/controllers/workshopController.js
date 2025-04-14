import Workshop from '../models/Workshop.js';
import Joi from 'joi';
import fs from 'fs';
import mongoose from 'mongoose';

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
  materials: Joi.array().items(Joi.string())
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
      .populate('instructor', 'name email')
      .populate('participants', 'name email')
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
      .populate('instructor', 'name email')
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
      .populate('instructor', 'name email')
      .populate('participants', 'name email')
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
      .populate('instructor', 'name email')
      .populate('participants', 'name email')
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

// Create new workshop
export const createWorkshop = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = workshopValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Handle file uploads if present
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    // Create workshop with attachments
    const workshop = await Workshop.create({
      ...value,
      attachments,
      instructor: req.user.id // Set the instructor to the authenticated user
    });

    res.status(201).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error creating workshop:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update workshop
export const updateWorkshop = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = workshopValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Find the existing workshop
    const existingWorkshop = await Workshop.findById(req.params.id);
    if (!existingWorkshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Check if user is the instructor
    if (existingWorkshop.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this workshop'
      });
    }

    // Handle file uploads if present
    let attachments = [...existingWorkshop.attachments];
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      attachments = [...attachments, ...newAttachments];
    }

    // Update workshop with new attachments
    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id, 
      { ...value, attachments },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: workshop
    });
  } catch (err) {
    console.error('Error updating workshop:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete workshop
export const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Check if user is the instructor
    if (workshop.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this workshop'
      });
    }

    // Delete associated files
    if (workshop.attachments && workshop.attachments.length > 0) {
      workshop.attachments.forEach(attachment => {
        const filePath = attachment.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete the workshop from database
    await Workshop.findByIdAndDelete(req.params.id);

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