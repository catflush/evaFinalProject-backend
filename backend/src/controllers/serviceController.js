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
const uploadsDir = path.join(__dirname, '../../uploads/services');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('categoryId', 'name');
    
    // Log attachment paths for each service
    services.forEach(service => {
      console.log(`\n=== Service ${service._id} Attachments ===`);
      service.attachments.forEach(attachment => {
        console.log('Attachment path:', attachment.path);
        console.log('Full path:', getFilePath(attachment.path));
      });
    });
    
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
    
    // Log directory info before processing files
    logDirectoryInfo(uploadsDir);
    
    // Log each uploaded file
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => logFileInfo(file, 'Upload'));
    }
    
    // Create service with attachments
    const service = new Service({
      title,
      description,
      price,
      duration,
      level,
      categoryId,
      isActive,
      attachments: req.files?.map(file => {
        const attachment = {
          filename: file.originalname,
          path: `services/${file.filename}`, // Store relative path without 'uploads' prefix
          mimetype: file.mimetype,
          size: file.size
        };
        console.log('Created attachment:', attachment);
        return attachment;
      }) || []
    });

    await service.save();
    
    // Log the created service
    console.log('\n=== Created Service ===');
    console.log('Service ID:', service._id);
    console.log('Attachments:', service.attachments);
    
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
    
    // Log existing attachments
    console.log('\n=== Existing Attachments ===');
    service.attachments.forEach(attachment => {
      console.log('Attachment path:', attachment.path);
      console.log('Full path:', getFilePath(attachment.path));
    });
    
    // Handle file uploads
    const attachments = [...service.attachments];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        logFileInfo(file, 'Update');
        const filePath = `services/${file.filename}`; // Store relative path without 'uploads' prefix
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
    
    // Log updated service
    console.log('\n=== Updated Service ===');
    console.log('Service ID:', service._id);
    console.log('Attachments:', service.attachments);
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
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
    
    // Log attachments to be deleted
    console.log('\n=== Deleting Service Attachments ===');
    service.attachments.forEach(attachment => {
      const filePath = getFilePath(attachment.path);
      console.log('Deleting file:', filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted successfully');
      } else {
        console.log('File not found');
      }
    });
    
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

// Delete attachment from service
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
    
    // Delete file from filesystem
    const filePath = getFilePath(attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove attachment from service
    attachment.remove();
    await service.save();
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 