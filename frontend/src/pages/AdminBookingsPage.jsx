import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { BookingContext } from '../context/BookingContext';
import { EventContext } from '../context/EventContext';
import { ServiceContext } from '../context/ServiceContext';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const AdminBookingsPage = () => {
  const { user, isAdmin } = useContext(UserContext);
  const { bookings, loading: bookingsLoading, error: bookingsError, updateBookingStatus } = useContext(BookingContext);
  const { events, loading: eventsLoading, error: eventsError } = useContext(EventContext);
  const { services, loading: servicesLoading, error: servicesError } = useContext(ServiceContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    eventId: 'all',
    serviceId: 'all',
    date: ''
  });

  // Helper function to get booking title
  const getBookingTitle = (booking) => {
    const type = booking.bookingType || (booking.serviceId ? 'service' : booking.eventId ? 'event' : 'unknown');
    
    switch (type) {
      case 'service':
        return booking.service?.title || 'Service Title Not Available';
      case 'event':
        return booking.event?.title || 'Event Title Not Available';
      default:
        return 'Unknown Booking Type';
    }
  };

  // Helper function to get booking details
  const getBookingDetails = (booking) => {
    const type = booking.bookingType || (booking.service ? 'service' : booking.event ? 'event' : 'unknown');
    
    switch (type) {
      case 'service':
        return {
          description: booking.service?.description || 'No description available',
          price: booking.service?.price ? `$${booking.service.price}` : 'Price not available',
          duration: booking.service?.duration ? `${booking.service.duration} mins` : 'Duration not available'
        };
      case 'event':
        return {
          description: booking.event?.description || 'No description available',
          location: booking.event?.location || 'Location not available',
          capacity: booking.event?.capacity || 'Capacity not available'
        };
      default:
        return {
          description: 'No details available',
          price: 'N/A',
          duration: 'N/A'
        };
    }
  };

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, 'PPP');
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }

    // Set loading state based on all contexts
    setLoading(bookingsLoading || eventsLoading || servicesLoading);
    
    // Set error if any context has an error
    if (bookingsError || eventsError || servicesError) {
      setError(bookingsError || eventsError || servicesError);
    }
  }, [user, isAdmin, bookingsLoading, eventsLoading, servicesLoading, bookingsError, eventsError, servicesError, navigate]);

  useEffect(() => {
    if (!bookings) return;

    let result = [...bookings];

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(booking => booking.status === filters.status);
    }

    // Apply event filter
    if (filters.eventId !== 'all') {
      result = result.filter(booking => booking.eventId === filters.eventId);
    }

    // Apply service filter
    if (filters.serviceId !== 'all') {
      result = result.filter(booking => booking.serviceId === filters.serviceId);
    }

    // Apply date filter
    if (filters.date) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === filters.date;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => {
        const userName = `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.toLowerCase();
        const userEmail = booking.user?.email?.toLowerCase() || '';
        return userName.includes(query) || userEmail.includes(query);
      });
    }

    setFilteredBookings(result);
  }, [bookings, filters, searchQuery]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Refresh bookings after status update
      // Note: This assumes your BookingContext handles the refresh
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user || !isAdmin()) {
    return null; // Or a redirect component
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Bookings</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          name="eventId"
          value={filters.eventId}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="all">All Events</option>
          {events?.map(event => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>

        <select
          name="serviceId"
          value={filters.serviceId}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="all">All Services</option>
          {services?.map(service => (
            <option key={service._id} value={service._id}>
              {service.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">User</th>
              <th className="py-2 px-4 border-b">Booking</th>
              <th className="py-2 px-4 border-b">Details</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Time</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => {
              const details = getBookingDetails(booking);
              
              return (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</span>
                      <span className="text-sm text-gray-500">{booking.user?.email}</span>
                      <span className="text-xs text-gray-400">ID: {booking.userId}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-col">
                      <span className="font-medium">{getBookingTitle(booking)}</span>
                      <span className="text-sm text-gray-500">{details.description}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-col">
                      {details.price && <span className="text-sm text-gray-500">{details.price}</span>}
                      {details.duration && <span className="text-sm text-gray-500">{details.duration}</span>}
                      {details.location && <span className="text-sm text-gray-500">{details.location}</span>}
                      {details.capacity && <span className="text-sm text-gray-500">Capacity: {details.capacity}</span>}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(booking.date)}
                  </td>
                  <td className="py-2 px-4 border-b">{booking.time}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage; 