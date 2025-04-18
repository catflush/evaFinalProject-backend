import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  host: {
    type: String,
    required: [true, 'Please add a host'],
    trim: true
  },
  type: {
    type: String,
    enum: ['workshop', 'talks', 'networking'],
    default: 'workshop'
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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  image: {
    type: String,
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

const Event = mongoose.model('Event', eventSchema);

export default Event; 