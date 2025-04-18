import { useState, useEffect } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaTrash, FaGraduationCap, FaEye, FaFilter, FaSort, FaTimes, FaEdit, FaTools, FaHistory } from "react-icons/fa";
import { useUser } from '../context/useUser';
import { useBookings } from '../context/BookingContext';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import BookingCard from '../components/BookingCard';

const MyBookingPage = () => {
  const { user } = useUser();
  const { bookings, loading, getUserBookings, cancelBooking, deleteBooking, updateBooking } = useBookings();
  const [processing, setProcessing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    numberOfParticipants: 1,
    notes: ''
  });
  const [filter, setFilter] = useState('all'); // 'all', 'event', 'service', 'workshop'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'status', 'title'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 6;
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    if (user?._id) {
      getUserBookings();
    }
  }, [user?._id, getUserBookings]);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    // Format based on whether the date is today, tomorrow, or another day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return format(date, 'PPP');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessing(true);
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete booking');
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to get booking title
  const getBookingTitle = (booking) => {
    // If bookingType is missing, try to infer it from the data
    const type = booking.bookingType || (booking.service ? 'service' : booking.event ? 'event' : booking.workshop ? 'workshop' : 'unknown');
    
    switch (type) {
      case 'service':
        return booking.service?.title || 'Service Title Not Available';
      case 'event':
        return booking.event?.title || 'Event Title Not Available';
      case 'workshop':
        return booking.workshop?.title || 'Workshop Title Not Available';
      default:
        return 'Unknown Booking Type';
    }
  };

  // Helper function to get booking details
  const getBookingDetails = (booking) => {
    // If bookingType is missing, try to infer it from the data
    const type = booking.bookingType || (booking.service ? 'service' : booking.event ? 'event' : booking.workshop ? 'workshop' : 'unknown');
    let eventDate, eventLocation, eventDescription, workshopDate, workshopLocation, workshopDescription;
    
    // Helper function to safely format dates
    const safeFormatDate = (dateString) => {
      if (!dateString) return 'Date not available';
      try {
        const date = new Date(dateString);
        return isValid(date) ? format(date, 'PPP') : 'Invalid date';
      } catch {
        return 'Invalid date';
      }
    };
    
    switch (type) {
      case 'service':
        return {
          description: booking.service?.description || 'No description available',
          price: booking.service?.price || 'Price not available',
          duration: booking.service?.duration || 'Duration not available',
          date: safeFormatDate(booking.date),
          participants: booking.numberOfParticipants || 1
        };
      case 'event':
        eventDate = safeFormatDate(booking.event?.date);
        eventLocation = booking.event?.location || 'Location not available';
        eventDescription = booking.event?.description || 'No description available';
        return {
          description: `${eventDate} at ${eventLocation}`,
          location: eventLocation,
          capacity: booking.event?.capacity || 'Capacity not available',
          date: eventDate,
          participants: booking.numberOfParticipants || 1,
          fullDescription: eventDescription
        };
      case 'workshop':
        workshopDate = safeFormatDate(booking.workshop?.date);
        workshopLocation = booking.workshop?.location || 'Location not available';
        workshopDescription = booking.workshop?.description || 'No description available';
        return {
          description: `${workshopDate} at ${workshopLocation}`,
          location: workshopLocation,
          capacity: booking.workshop?.capacity || 'Capacity not available',
          date: workshopDate,
          participants: booking.numberOfParticipants || 1,
          fullDescription: workshopDescription,
          level: booking.workshop?.level || 'Level not specified',
          instructor: booking.workshop?.instructor || 'Instructor not specified'
        };
      default:
        return {
          description: 'No details available',
          price: 'N/A',
          duration: 'N/A',
          date: 'Date not available',
          participants: 0
        };
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to check if a booking is in the past
  const isPastBooking = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    return bookingDate < now;
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      // First filter by type
      if (filter !== 'all') {
        const type = booking.bookingType || (booking.service ? 'service' : booking.event ? 'event' : booking.workshop ? 'workshop' : 'unknown');
        if (type !== filter) return false;
      }

      // Then filter by time
      if (timeFilter === 'upcoming') {
        return !isPastBooking(booking);
      } else if (timeFilter === 'past') {
        return isPastBooking(booking);
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      if (sortBy === 'status') {
        return sortOrder === 'desc' 
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      
      return 0;
    });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const paginatedBookings = filteredAndSortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredAndSortedBookings.length / bookingsPerPage);

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      date: format(new Date(booking.date), 'yyyy-MM-dd'),
      time: booking.time || '',
      numberOfParticipants: booking.numberOfParticipants || 1,
      notes: booking.notes || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      setProcessing(true);
      await updateBooking(editingBooking._id, editForm);
      toast.success('Booking updated successfully');
      setEditingBooking(null);
      getUserBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <div className="flex flex-wrap gap-2">
            <div className="join">
              <button 
                className={`join-item btn btn-sm ${timeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </button>
              <button 
                className={`join-item btn btn-sm ${timeFilter === 'upcoming' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeFilter('upcoming')}
              >
                <FaCalendarAlt className="mr-1" /> Upcoming
              </button>
              <button 
                className={`join-item btn btn-sm ${timeFilter === 'past' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeFilter('past')}
              >
                <FaHistory className="mr-1" /> Past
              </button>
            </div>
            <div className="join">
              <button 
                className={`join-item btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`join-item btn btn-sm ${filter === 'event' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter('event')}
              >
                <FaTicketAlt className="mr-1" /> Events
              </button>
              <button 
                className={`join-item btn btn-sm ${filter === 'workshop' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter('workshop')}
              >
                <FaGraduationCap className="mr-1" /> Workshops
              </button>
              <button 
                className={`join-item btn btn-sm ${filter === 'service' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter('service')}
              >
                <FaTools className="mr-1" /> Services
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : paginatedBookings.length === 0 ? (
          <div className="text-center py-12">
            <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onView={() => setSelectedBooking(booking)}
                onCancel={() => handleCancelBooking(booking._id)}
                onDelete={() => handleDeleteBooking(booking._id)}
                onEdit={() => handleEditClick(booking)}
                processing={processing}
                getTitle={getBookingTitle}
                getDetails={getBookingDetails}
                getStatusColor={getStatusBadgeColor}
                isPast={isPastBooking(booking)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Booking Details</h3>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="btn btn-ghost btn-sm hover:bg-gray-100 rounded-full p-2"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Booking Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">
                      {getBookingTitle(selectedBooking)}
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="break-words">
                          {formatDate(selectedBooking.date)} at {selectedBooking.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedBooking.bookingType === 'event' ? (
                          <FaMapMarkerAlt className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : selectedBooking.bookingType === 'workshop' ? (
                          <FaGraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <FaGraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <span className="break-words">{getBookingDetails(selectedBooking).description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FaTicketAlt className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{selectedBooking.numberOfParticipants || 0} participant(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">Customer Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span>{selectedBooking.customerDetails?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span>{selectedBooking.customerDetails?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span>{selectedBooking.customerDetails?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Payment and Additional Information */}
                <div className="space-y-6">
                  {/* Payment Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">Payment Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Total Price:</span>
                        <span>${selectedBooking.totalPrice || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Payment Method:</span>
                        <span className="capitalize">{selectedBooking.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Payment Status:</span>
                        <span className={`capitalize ${
                          selectedBooking.paymentStatus === 'paid' ? 'text-green-600' :
                          selectedBooking.paymentStatus === 'pending' ? 'text-yellow-600' :
                          selectedBooking.paymentStatus === 'failed' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {selectedBooking.paymentStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {selectedBooking.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-lg text-gray-900 mb-3">Additional Notes</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedBooking.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedBooking.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleEditClick(selectedBooking)}
                          className="btn btn-outline btn-primary flex-1 min-w-[120px]"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleCancelBooking(selectedBooking._id)}
                          disabled={processing}
                          className="btn btn-outline btn-error flex-1 min-w-[120px]"
                        >
                          {processing ? 'Canceling...' : 'Cancel Booking'}
                        </button>
                      </>
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <button
                        onClick={() => handleDeleteBooking(selectedBooking._id)}
                        className="btn btn-outline btn-error flex-1 min-w-[120px]"
                      >
                        <FaTrash className="mr-2" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Edit Booking</h3>
                <button 
                  onClick={() => setEditingBooking(null)}
                  className="btn btn-ghost btn-sm"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Participants</label>
                  <input
                    type="number"
                    name="numberOfParticipants"
                    value={editForm.numberOfParticipants}
                    onChange={handleEditChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn btn-primary"
                  >
                    {processing ? 'Updating...' : 'Update Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingPage; 