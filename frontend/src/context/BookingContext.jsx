import { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { useUser } from './useUser';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("API URL is required, are you missing a .env file?");
}

export const BookingContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const { user } = useUser();

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Create a new booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get customer details from user context
      const customerDetails = {
        name: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}`
          : bookingData.customerDetails?.name || 'Unknown User',
        email: user?.email || bookingData.customerDetails?.email || '',
        phone: user?.phone || bookingData.customerDetails?.phone || ''
      };

      // Prepare the request body based on booking type
      const requestBody = {
        bookingType: bookingData.bookingType,
        date: bookingData.date,
        time: bookingData.time,
        numberOfParticipants: bookingData.numberOfParticipants || 1,
        paymentMethod: bookingData.paymentMethod || 'credit_card',
        customerDetails,
        notes: bookingData.notes
      };

      // Add the appropriate ID field based on booking type
      if (bookingData.bookingType === 'event') {
        requestBody.eventId = bookingData.eventId;
      } else if (bookingData.bookingType === 'workshop') {
        requestBody.workshopId = bookingData.workshopId;
      } else if (bookingData.bookingType === 'service') {
        requestBody.serviceId = bookingData.serviceId;
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const data = await response.json();
      setBookings(prev => [...prev, data.data]);
      
      showNotification('Booking confirmed successfully!', 'success');
      return data.data;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to create booking', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get all bookings for a user
  const getUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Process the bookings to ensure workshop data is properly handled
      const processedBookings = data.data.map(booking => {
        if (booking.bookingType === 'workshop' && booking.workshop) {
          return {
            ...booking,
            workshop: {
              ...booking.workshop,
              title: booking.workshop.title || 'Workshop Title Not Available',
              date: booking.workshop.date || booking.date,
              location: booking.workshop.location || 'Location Not Available',
              capacity: booking.workshop.maxParticipants || 'Capacity Not Available',
              level: booking.workshop.level || 'Level Not Specified',
              instructor: booking.workshop.instructor || 'Instructor Not Specified',
              duration: booking.workshop.duration || 'Duration Not Available',
              price: booking.workshop.price || 'Price Not Available'
            }
          };
        }
        return booking;
      });

      setBookings(processedBookings);
      return processedBookings;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to fetch bookings', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get a specific booking
  const getBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to fetch booking', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update a booking
  const updateBooking = useCallback(async (bookingId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      const data = await response.json();
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId ? data.data : booking
        )
      );
      
      showNotification('Booking updated successfully', 'success');
      return data.data;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to update booking', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const data = await response.json();
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId ? data.data : booking
        )
      );
      
      showNotification(`Booking ${newStatus} successfully`, 'success');
      return data.data;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to update booking status', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      const data = await response.json();
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId ? data.data : booking
        )
      );
      
      showNotification('Booking cancelled successfully', 'success');
      return data.data;
    } catch (error) {
      setError(error.message);
      showNotification(error.message || 'Failed to cancel booking', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a booking
  const deleteBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      const data = await response.json();
      setBookings(prev => prev.filter(booking => booking._id !== bookingId));
      
      showNotification('Booking deleted successfully', 'success');
      return data.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError(error.message);
      showNotification(error.message || 'Failed to delete booking', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load user's bookings on mount and when user changes
  useEffect(() => {
    if (user) {
      getUserBookings();
    }
  }, [user, getUserBookings]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    bookings,
    loading,
    error,
    notification,
    createBooking,
    getUserBookings,
    getBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    deleteBooking
  }), [
    bookings,
    loading,
    error,
    notification,
    createBooking,
    getUserBookings,
    getBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    deleteBooking
  ]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
      {/* Notification Component */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
    </BookingContext.Provider>
  );
}; 