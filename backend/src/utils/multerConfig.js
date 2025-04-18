import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Create posts directory if it doesn't exist
const postsDir = path.join(uploadsDir, 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
  console.log('Created posts directory:', postsDir);
}

// Create events directory if it doesn't exist
const eventsUploadDir = path.join(uploadsDir, 'events');
if (!fs.existsSync(eventsUploadDir)) {
  fs.mkdirSync(eventsUploadDir, { recursive: true });
  console.log('Created events directory:', eventsUploadDir);
}

// Create workshop directory if it doesn't exist
const workshopsUploadDir = path.join(uploadsDir, 'workshops');
if (!fs.existsSync(workshopsUploadDir)) {
  fs.mkdirSync(workshopsUploadDir, { recursive: true });
  console.log('Created workshops directory:', workshopsUploadDir);
}

// Create services directory if it doesn't exist
const servicesUploadDir = path.join(uploadsDir, 'services');
if (!fs.existsSync(servicesUploadDir)) {
  fs.mkdirSync(servicesUploadDir, { recursive: true });
  console.log('Created services directory:', servicesUploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Log the request details
      console.log('Upload request details:', {
        originalUrl: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body
      });

      // Determine the destination based on the route
      let destination = uploadsDir; // Use uploadsDir as default
      if (req.originalUrl.includes('/events')) {
        destination = eventsUploadDir;
      } else if (req.originalUrl.includes('/workshops')) {
        destination = workshopsUploadDir;
      } else if (req.originalUrl.includes('/services')) {
        destination = servicesUploadDir;
      } else if (req.originalUrl.includes('/posts')) {
        destination = postsDir;
      }
      
      // Ensure the destination directory exists
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
        console.log('Created destination directory:', destination);
      }
      
      console.log('Upload destination:', destination);
      cb(null, destination);
    } catch (error) {
      console.error('Error setting upload destination:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Log file details
      console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Create a unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      console.log('Generated filename:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error);
    }
  }
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  try {
    // Log file details for debugging
    console.log('File filter details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      console.log('Rejected file type:', file.mimetype);
      cb(new Error('Only image files are allowed!'), false);
      return;
    }

    console.log('Accepted file type:', file.mimetype);
    cb(null, true);
  } catch (error) {
    console.error('Error in file filter:', error);
    cb(error);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export default upload; 