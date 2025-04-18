import Analytics from '../models/Analytics.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Event from '../models/Event.js';
import Workshop from '../models/Workshop.js';
import Category from '../models/Category.js';

// Helper function to calculate analytics
const calculateAnalytics = async () => {
  try {
    console.log('Starting analytics calculation...');
    
    // Get all bookings
    const bookings = await Booking.find();
    console.log(`Found ${bookings.length} bookings`);
    
    // Get all services
    const services = await Service.find();
    console.log(`Found ${services.length} services`);
    
    // Get all events
    const events = await Event.find();
    console.log(`Found ${events.length} events`);
    
    // Get all workshops
    const workshops = await Workshop.find();
    console.log(`Found ${workshops.length} workshops`);
    
    // Get all categories
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories`);

    // Calculate booking statistics
    const bookingStats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length
    };
    console.log('Calculated booking stats:', bookingStats);

    // Calculate revenue statistics
    const revenueStats = {
      total: bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0),
      monthly: bookings
        .filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, booking) => sum + (booking.amount || 0), 0),
      byService: await Promise.all(services.map(async (service) => {
        const serviceBookings = bookings.filter(b => b.serviceId?.toString() === service._id.toString());
        return {
          serviceId: service._id,
          title: service.title,
          revenue: serviceBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0)
        };
      }))
    };
    console.log('Calculated revenue stats:', revenueStats);

    // Calculate service statistics
    const serviceStats = {
      total: services.length,
      active: services.filter(s => s.isActive).length,
      byCategory: await Promise.all(categories.map(async (category) => {
        const categoryServices = services.filter(s => s.categoryId?.toString() === category._id.toString());
        return {
          categoryId: category._id,
          name: category.name,
          count: categoryServices.length
        };
      }))
    };
    console.log('Calculated service stats:', serviceStats);

    // Calculate event statistics
    const eventStats = {
      total: events.length,
      upcoming: events.filter(e => new Date(e.date) > new Date()).length,
      completed: events.filter(e => new Date(e.date) < new Date()).length
    };
    console.log('Calculated event stats:', eventStats);

    // Calculate workshop statistics
    const workshopStats = {
      total: workshops.length,
      upcoming: workshops.filter(w => new Date(w.date) > new Date() && w.status === 'upcoming').length,
      ongoing: workshops.filter(w => w.status === 'ongoing').length,
      completed: workshops.filter(w => w.status === 'completed').length,
      cancelled: workshops.filter(w => w.status === 'cancelled').length,
      byLevel: {
        beginner: workshops.filter(w => w.level === 'beginner').length,
        intermediate: workshops.filter(w => w.level === 'intermediate').length,
        expert: workshops.filter(w => w.level === 'expert').length
      },
      byCategory: await Promise.all(categories.map(async (category) => {
        const categoryWorkshops = workshops.filter(w => w.categoryId?.toString() === category._id.toString());
        return {
          categoryId: category._id,
          name: category.name,
          count: categoryWorkshops.length
        };
      })),
      totalParticipants: workshops.reduce((sum, workshop) => sum + workshop.participants.length, 0),
      averageParticipants: workshops.length > 0 
        ? workshops.reduce((sum, workshop) => sum + workshop.participants.length, 0) / workshops.length 
        : 0,
      revenue: workshops.reduce((sum, workshop) => sum + (workshop.price * workshop.participants.length), 0)
    };
    console.log('Calculated workshop stats:', workshopStats);

    // Create or update analytics document
    const analytics = await Analytics.findOneAndUpdate(
      {},
      {
        bookings: bookingStats,
        revenue: revenueStats,
        services: serviceStats,
        events: eventStats,
        workshops: workshopStats,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    console.log('Analytics document updated successfully');

    return analytics;
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw new Error(`Failed to calculate analytics: ${error.message}`);
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    console.log('Received analytics request from user:', req.user._id);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Access denied: User is not admin');
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Calculate and return analytics
    const analytics = await calculateAnalytics();
    console.log('Sending analytics response');
    res.json({ data: analytics });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics data',
      details: error.message 
    });
  }
}; 