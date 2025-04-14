import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  bookingType: {
    type: String,
    enum: ['event', 'service', 'workshop'],
    required: [true, 'Booking type is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    validate: {
      validator: function(v) {
        return this.bookingType !== 'event' || v != null;
      },
      message: 'Event ID is required for event bookings'
    }
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    validate: {
      validator: function(v) {
        return this.bookingType !== 'service' || v != null;
      },
      message: 'Service ID is required for service bookings'
    }
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    validate: {
      validator: function(v) {
        return this.bookingType !== 'workshop' || v != null;
      },
      message: 'Workshop ID is required for workshop bookings'
    }
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  time: {
    type: String,
    required: [true, 'Booking time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  numberOfParticipants: {
    type: Number,
    min: [1, 'At least one participant is required'],
    default: 1,
    validate: {
      validator: function(v) {
        return this.bookingType !== 'event' || v >= 1;
      },
      message: 'Number of participants must be at least 1 for event bookings'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  customerDetails: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\+\-\(\)]{6,20}$/, 'Please add a valid phone number']
    }
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  duration: {
    type: String,
    required: function() {
      return this.bookingType === 'service' || this.bookingType === 'workshop';
    }
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
bookingSchema.index({ user: 1, bookingType: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ workshop: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Add validation to ensure the correct entity is provided based on bookingType
bookingSchema.pre('save', function(next) {
  if (this.bookingType === 'event' && !this.event) {
    next(new Error('Event ID is required for event bookings'));
  } else if (this.bookingType === 'service' && !this.service) {
    next(new Error('Service ID is required for service bookings'));
  } else if (this.bookingType === 'workshop' && !this.workshop) {
    next(new Error('Workshop ID is required for workshop bookings'));
  } else {
    next();
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 