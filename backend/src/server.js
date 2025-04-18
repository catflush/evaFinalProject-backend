import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './db/index.js';
import userAuthRoutes from './routes/userAuthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userEventRoutes from './routes/userEventRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import postRoutes from './routes/postRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

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

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://eva-project-frontend.onrender.com'  // Add your frontend URL here
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    // Cache control headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  },
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', userAuthRoutes);
app.use('/users', userRoutes);
app.use('/users', userEventRoutes);
app.use('/events', eventRoutes);
app.use('/categories', categoryRoutes);
app.use('/bookings', bookingRoutes);
app.use('/services', serviceRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/posts', postRoutes);
app.use('/workshops', workshopRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Uploads directory:', uploadsDir);
  console.log('Posts directory:', postsDir);
  console.log('Events directory:', eventsUploadDir);
  console.log('Workshops directory:', workshopsUploadDir);
  console.log('Services directory:', servicesUploadDir);
});