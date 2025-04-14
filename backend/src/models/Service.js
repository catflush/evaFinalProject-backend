import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: [true, 'Please specify the level of expertise'],
    default: 'beginner'
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration'],
    default: '1 hour'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
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
  }]
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service; 