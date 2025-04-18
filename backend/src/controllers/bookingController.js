import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Service from '../models/Service.js';
import Workshop from '../models/Workshop.js';
import ErrorResponse from '../utils/errorResponse.js';

// Get all bookings
export const getBookings = async (req, res) => {
  try {
    // If user is admin, return all bookings
    // If user is not admin, return only their bookings
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('event', 'title date location capacity')
      .populate('service', 'title description level price duration')
      .populate('workshop', 'title date time location duration maxParticipants price level instructor')
      .sort({ bookingDate: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('event', 'title date location capacity')
      .populate('service', 'title description level price duration')
      .populate('workshop', 'title date time duration maxParticipants price');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { 
      bookingType,
      serviceId,
      eventId,
      workshopId,
      date,
      time,
      numberOfParticipants,
      paymentMethod,
      customerDetails,
      notes 
    } = req.body;
    
    let bookingEntity;
    let totalPrice;
    let duration;
    
    if (bookingType === 'service') {
      // Check if service exists
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }
      bookingEntity = service;
      totalPrice = service.price;
      duration = service.duration;
    } else if (bookingType === 'event') {
      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }
      
      // Check if event has available capacity
      const currentBookings = await Booking.countDocuments({ 
        event: eventId, 
        status: { $in: ['pending', 'confirmed'] } 
      });
      
      if (currentBookings + (numberOfParticipants || 1) > event.capacity) {
        return res.status(400).json({
          success: false,
          error: 'Event is fully booked'
        });
      }
      
      bookingEntity = event;
      totalPrice = event.price * (numberOfParticipants || 1);
    } else if (bookingType === 'workshop') {
      // Check if workshop exists
      const workshop = await Workshop.findById(workshopId);
      if (!workshop) {
        return res.status(404).json({
          success: false,
          error: 'Workshop not found'
        });
      }
      
      // Check if user is already registered for this workshop
      const existingBooking = await Booking.findOne({ 
        workshop: workshopId,
        user: req.user._id,
        status: { $in: ['pending', 'confirmed'] }
      });
      
      if (existingBooking) {
        return res.status(400).json({
          success: false,
          error: 'Already registered for this workshop'
        });
      }
      
      // Check if workshop has available capacity
      const currentBookings = await Booking.countDocuments({ 
        workshop: workshopId, 
        status: { $in: ['pending', 'confirmed'] } 
      });
      
      if (currentBookings + (numberOfParticipants || 1) > workshop.maxParticipants) {
        return res.status(400).json({
          success: false,
          error: 'Workshop is fully booked'
        });
      }
      
      bookingEntity = workshop;
      totalPrice = workshop.price * (numberOfParticipants || 1);
      duration = workshop.duration;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking type'
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      bookingType,
      [bookingType]: bookingEntity._id,
      date,
      time,
      numberOfParticipants,
      totalPrice,
      paymentMethod,
      customerDetails,
      notes,
      duration
    });
    
    // Populate the booking with user and entity details
    await booking.populate('user', 'firstName lastName email');
    if (bookingType === 'event') {
      await booking.populate('event', 'title date location capacity');
    } else if (bookingType === 'service') {
      await booking.populate('service', 'title description level price duration');
    } else if (bookingType === 'workshop') {
      await booking.populate('workshop', 'title date time location duration maxParticipants price level instructor');
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { status, paymentStatus, notes, numberOfParticipants } = req.body;
    
    // Find booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user is authorized to update this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }
    
    // For event bookings, check capacity if updating number of participants
    if (booking.bookingType === 'event' && numberOfParticipants) {
      const event = await Event.findById(booking.event);
      const currentBookings = await Booking.countDocuments({ 
        event: booking.event, 
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: booking._id }
      });
      
      if (currentBookings + numberOfParticipants > event.capacity) {
        return res.status(400).json({
          success: false,
          error: 'Event is fully booked'
        });
      }
    }
    
    // Update fields
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (notes !== undefined) booking.notes = notes;
    if (numberOfParticipants) booking.numberOfParticipants = numberOfParticipants;
    
    // Recalculate total price if number of participants changed for event booking
    if (booking.bookingType === 'event' && numberOfParticipants) {
      const event = await Event.findById(booking.event);
      booking.totalPrice = event.price * numberOfParticipants;
    }
    
    // Save booking
    await booking.save();
    
    // Populate the booking with user and entity details
    await booking.populate('user', 'firstName lastName email');
    if (booking.bookingType === 'event') {
      await booking.populate('event', 'title date location capacity');
    } else if (booking.bookingType === 'service') {
      await booking.populate('service', 'title description level price duration');
    } else {
      await booking.populate('workshop', 'title date time duration maxParticipants price');
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user is authorized to delete this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this booking'
      });
    }

    // If it's a workshop booking, remove the user from workshop participants
    if (booking.bookingType === 'workshop' && booking.workshop) {
      try {
        await Workshop.findByIdAndUpdate(
          booking.workshop,
          { $pull: { participants: booking.user } }
        );
      } catch (workshopError) {
        console.error('Error removing user from workshop participants:', workshopError);
        // Continue with booking deletion even if workshop update fails
      }
    }
    
    // Delete the booking
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: deletedBooking._id }
    });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
}; 