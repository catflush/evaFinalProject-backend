import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  bookings: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    byService: [{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      title: String,
      revenue: { type: Number, default: 0 }
    }]
  },
  services: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    byCategory: [{
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      name: String,
      count: { type: Number, default: 0 }
    }]
  },
  events: {
    total: { type: Number, default: 0 },
    upcoming: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a compound index for efficient querying
analyticsSchema.index({ lastUpdated: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics; 