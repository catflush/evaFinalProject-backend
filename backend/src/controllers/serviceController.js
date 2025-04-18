import Service from '../models/Service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get correct file path
const getFilePath = (relativePath) => {
  if (!relativePath) return null;
  // Remove any duplicate 'uploads' in the path
  const cleanPath = relativePath.replace(/uploads\/uploads/g, 'uploads');
  return path.join(__dirname, '../../', cleanPath);
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/services');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single service
export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('categoryId', 'name');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new service
export const createService = async (req, res) => {
  try {
    const { title, description, price, duration, level, categoryId, isActive } = req.body;
    
    // Create service with attachments
    const service = new Service({
      title,
      description,
      price,
      duration,
      level,
      categoryId,
      isActive,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: `services/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      })) || []
    });

    await service.save();
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Handle file uploads
    const attachments = [...service.attachments];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = `services/${file.filename}`;
        attachments.push({
          filename: file.originalname,
          path: filePath,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }
    
    // Update service with new attachments
    service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        attachments
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Delete attachments
    if (service.attachments && service.attachments.length > 0) {
      service.attachments.forEach(attachment => {
        const filePath = getFilePath(attachment.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    await service.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    const attachment = service.attachments.id(req.params.attachmentId);
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
    
    // Remove the attachment from the service
    attachment.remove();
    await service.save();
    
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