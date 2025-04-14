import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify an instructor']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  duration: {
    type: String,
    required: [true, 'Please specify the duration']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: [true, 'Please specify the level of expertise'],
    default: 'beginner'
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Please specify maximum participants'],
    min: [1, 'Maximum participants must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  equipment: [{
    type: String,
    trim: true
  }],
  materials: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  location: {
    type: String,
    required: false
  },
  requirements: {
    type: String,
    trim: true
  },
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
workshopSchema.index({ date: 1 });
workshopSchema.index({ status: 1 });
workshopSchema.index({ categoryId: 1 });

// Virtual for checking if workshop is full
workshopSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.maxParticipants;
});

// Virtual for checking if workshop is upcoming
workshopSchema.virtual('isUpcoming').get(function() {
  return this.status === 'upcoming' && new Date(this.date) > new Date();
});

// Method to check if a user is registered
workshopSchema.methods.isUserRegistered = function(userId) {
  return this.participants.includes(userId);
};

// Method to register a user
workshopSchema.methods.registerUser = async function(userId) {
  if (this.isFull) {
    throw new Error('Workshop is full');
  }
  if (this.isUserRegistered(userId)) {
    throw new Error('User is already registered');
  }
  this.participants.push(userId);
  return this.save();
};

// Method to cancel registration
workshopSchema.methods.cancelRegistration = async function(userId) {
  if (!this.isUserRegistered(userId)) {
    throw new Error('User is not registered for this workshop');
  }
  this.participants = this.participants.filter(id => id.toString() !== userId.toString());
  return this.save();
};

const Workshop = mongoose.model('Workshop', workshopSchema);

export default Workshop; 