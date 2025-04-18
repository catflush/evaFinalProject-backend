import Event from '../models/Event.js';
import Joi from 'joi';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directories
const uploadsDir = path.join(__dirname, '../../uploads');
const eventsUploadDir = path.join(uploadsDir, 'events');

// Ensure upload directories exist
const ensureUploadsDirectory = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
  if (!fs.existsSync(eventsUploadDir)) {
    fs.mkdirSync(eventsUploadDir, { recursive: true });
    console.log('Created events directory:', eventsUploadDir);
  }
  return eventsUploadDir;
};

// Validation schemas
const eventValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  host: Joi.string().required(),
  type: Joi.string().valid('workshop', 'talks', 'networking').default('workshop'),
  level: Joi.string().valid('beginner', 'intermediate', 'expert').default('beginner'),
  price: Joi.number().min(0).default(0),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null).messages({
    'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
  }),
  image: Joi.any().optional() // Allow image field but don't validate it
});

// Helper function to generate image URL
const generateImageUrl = (filePath) => {
  if (!filePath) return null;
  try {
    // Get the relative path from the uploads directory
    const relativePath = path.relative(uploadsDir, filePath);
    // Convert backslashes to forward slashes for URLs
    const urlPath = relativePath.replace(/\\/g, '/');
    // Remove any leading slashes to avoid double slashes
    const cleanPath = urlPath.replace(/^\/+/, '');
    console.log('Generated URL path:', cleanPath);
    // Return the full URL path
    return `/uploads/${cleanPath}`;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

// Transform event data to include image URL
const transformEventData = (event) => {
  if (!event) return null;
  
  const eventData = event.toObject ? event.toObject() : event;
  return {
    ...eventData,
    imageUrl: eventData.image ? generateImageUrl(eventData.image) : null,
    // Handle any nested image fields if they exist
    ...(eventData.images && {
      images: eventData.images.map(img => ({
        ...img,
        url: generateImageUrl(img.path || img.url)
      }))
    })
  };
};

// Get all events with optional category filter
export const getEvents = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
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

    const events = await Event.find(query).sort({ date: 1 });
    const transformedEvents = events.map(transformEventData);

    res.status(200).json({
      success: true,
      count: events.length,
      data: transformedEvents
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const events = await Event.find({
      date: { $gte: currentDate }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const transformedEvent = transformEventData(event);

    res.status(200).json({
      success: true,
      data: transformedEvent
    });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  try {
    // Ensure uploads directory exists
    const eventsDir = ensureUploadsDirectory();
    console.log('Using events directory:', eventsDir);

    // Log request details for debugging
    console.log('Request details:', {
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file uploaded',
      headers: req.headers
    });

    // Extract the body data excluding the image
    const { image, ...bodyData } = req.body;

    // Set host to the logged-in user's full name
    const host = `${req.user.firstName} ${req.user.lastName}`.trim();
    bodyData.host = host;

    // Validate request body
    const { error, value } = eventValidationSchema.validate(bodyData);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      // If there's a file uploaded, delete it before returning error
      if (req.file) {
        console.log('Deleting uploaded file due to validation error:', req.file.path);
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Handle image upload if present
    if (req.file) {
      // Store relative path like posts do
      bodyData.image = `events/${req.file.filename}`;
      console.log('Image uploaded successfully:', {
        originalPath: req.file.path,
        relativePath: bodyData.image
      });
    }

    const event = await Event.create(bodyData);
    const transformedEvent = transformEventData(event);

    res.status(201).json({
      success: true,
      data: transformedEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
    // If there's a file uploaded and an error occurs, delete it
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Deleted uploaded file due to error:', req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Extract the body data excluding the image
    const { image, ...bodyData } = req.body;

    // Handle image upload if present
    if (req.file) {
      // Delete old image if it exists
      if (event.image) {
        try {
          const oldImagePath = path.join(uploadsDir, event.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      // Store relative path
      bodyData.image = path.relative(uploadsDir, req.file.path);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      bodyData,
      { new: true, runValidators: true }
    );

    const transformedEvent = transformEventData(updatedEvent);

    res.status(200).json({
      success: true,
      data: transformedEvent
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Delete associated image if it exists
    if (event.image && fs.existsSync(event.image)) {
      fs.unlinkSync(event.image);
    }

    // Delete the event from database
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete attachment from event
export const deleteAttachment = async (req, res) => {
  try {
    const { eventId, attachmentId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Find the attachment
    const attachment = event.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found'
      });
    }

    // Delete the file from filesystem
    const filePath = attachment.path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the attachment from the event
    attachment.remove();
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get hosted events for the current user
export const getHostedEvents = async (req, res) => {
  try {
    // Get the current user's full name
    const userFullName = `${req.user.firstName} ${req.user.lastName}`.trim();
    
    // Find events where the host matches the user's full name
    const events = await Event.find({ host: userFullName })
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('Error fetching hosted events:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 