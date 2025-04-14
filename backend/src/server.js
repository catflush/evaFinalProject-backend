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

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/uploads/posts', express.static(path.join(__dirname, '../../uploads/posts')));
app.use('/uploads/services', express.static(path.join(__dirname, '../../uploads/services')));

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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}`));