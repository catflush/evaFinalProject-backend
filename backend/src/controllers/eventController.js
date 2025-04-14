import Event from '../models/Event.js';
import Joi from 'joi';
import fs from 'fs';
import mongoose from 'mongoose';

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
  })
});

// Get all events with optional category filter
export const getEvents = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    // Build query
    const query = {};
    if (categoryId) {
      // Check if categoryId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        query.categoryId = categoryId;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID format'
        });
      }
    }

    const events = await Event.find(query)
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
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

    res.status(200).json({
      success: true,
      data: event
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
    // Validate request body
    const { error, value } = eventValidationSchema.validate(req.body);
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

    // Create event with attachments
    const event = await Event.create({
      ...value,
      attachments
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error creating event:', err);
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

// Update event
export const updateEvent = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = eventValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Find the existing event
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Handle file uploads if present
    let updateData = { ...value };
    if (req.files && req.files.length > 0) {
      // Delete old attachments if they exist
      if (existingEvent.attachments && existingEvent.attachments.length > 0) {
        existingEvent.attachments.forEach(attachment => {
          const filePath = attachment.path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      // Add new attachments
      updateData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error updating event:', err);
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

    // Delete associated files
    if (event.attachments && event.attachments.length > 0) {
      event.attachments.forEach(attachment => {
        const filePath = attachment.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
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