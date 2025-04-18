import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Configure storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, POSTS_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Get current date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    // Create filename with format: post-YYYY-MM-DD-HH-MM-SS-random.ext
    const uniqueSuffix = Math.round(Math.random() * 1E9);
    const filename = `post-${date}-${time}-${uniqueSuffix}${path.extname(file.originalname)}`;
    
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload; 