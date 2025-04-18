import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTicketAlt, FaClock, FaEdit, FaTrash, FaArrowLeft, FaTimes, FaImage } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { useEvents } from '../context/EventContext';
import { useBookings } from '../context/BookingContext';

const HostedEventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEvent, updateEvent, deleteEvent } = useEvents();
  const { getUserBookings } = useBookings();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eventBookings, setEventBookings] = useState([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    price: '',
    category: '',
    image: '',
    currentImage: ''
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await getEvent(eventId);
        if (!eventData) {
          throw new Error('Event not found');
        }
        setEvent(eventData);
        setEditForm({
          title: eventData.title,
          description: eventData.description,
          date: format(new Date(eventData.date), 'yyyy-MM-dd'),
          time: eventData.time || '',
          location: eventData.location,
          capacity: eventData.capacity,
          price: eventData.price,
          category: eventData.category,
          image: eventData.image,
          currentImage: eventData.image
        });

        // Fetch bookings for this event
        const eventBookingsData = await getUserBookings(eventId);
        setEventBookings(eventBookingsData);
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error(error.message || 'Failed to load event details');
        navigate('/dashboard/hosted-events');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, getEvent, getUserBookings, navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      
      // Create a copy of the form data without image-related fields
      const { image, ...eventData } = editForm;
      
      // Add the image if a new one was selected
      if (image) {
        eventData.image = image;
      }

      await updateEvent(eventId, eventData);
      toast.success('Event updated successfully');
      setEditing(false);
      const updatedEvent = await getEvent(eventId);
      setEvent(updatedEvent);
    } catch (error) {
      toast.error(error.message || 'Failed to update event');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await deleteEvent(eventId);
      toast.success('Event deleted successfully');
      navigate('/dashboard/hosted-events');
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setEditForm(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Calculate total participants
  const totalParticipants = eventBookings.reduce((total, booking) => 
    total + (booking.numberOfParticipants || 0), 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
          <button
            onClick={() => navigate('/dashboard/hosted-events')}
            className="mt-4 btn btn-primary"
          >
            Back to Hosted Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/hosted-events')}
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Hosted Events
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-gray-600">
                <span className="badge badge-primary">{event.category}</span>
                <span className="badge badge-secondary">{event.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="btn btn-outline btn-primary"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit Event
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="btn btn-outline btn-error"
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Delete Event
              </button>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-gray-600">
                    {event.date && isValid(new Date(event.date)) 
                      ? format(new Date(event.date), 'PPP')
                      : 'Date not available'} at {event.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaUsers className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Capacity</h3>
                  <p className="text-gray-600">
                    {totalParticipants} / {event.capacity} participants
                  </p>
                  <p className="text-sm text-gray-500">
                    {eventBookings.length} bookings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaTicketAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Price</h3>
                  <p className="text-gray-600">${event.price}</p>
                </div>
              </div>

              {event.imageUrl ? (
                <div className="mt-4">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="mt-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <FaImage className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings</h2>
          {eventBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Participants</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {eventBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div>
                          <div className="font-medium">{booking.customerDetails?.name}</div>
                          <div className="text-sm text-gray-500">{booking.customerDetails?.email}</div>
                        </div>
                      </td>
                      <td>{format(new Date(booking.date), 'PPP')}</td>
                      <td>{booking.numberOfParticipants}</td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'confirmed' ? 'badge-success' :
                          booking.status === 'pending' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="font-bold">Total Participants</td>
                    <td className="font-bold">{totalParticipants}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                When people book this event, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Edit Event</h3>
                <button
                  onClick={() => setEditing(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

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
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={editForm.capacity}
                      onChange={handleEditChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Image</label>
                  <div className="mt-1 flex items-center">
                    <label className="flex flex-col items-center px-4 py-2 bg-white rounded-lg shadow-sm tracking-wide border border-gray-300 cursor-pointer hover:bg-gray-50">
                      <FaImage className="w-6 h-6 text-gray-600" />
                      <span className="mt-2 text-sm text-gray-600">
                        {editForm.image ? editForm.image.name : 'Choose image'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  {editForm.image ? (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(editForm.image)}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    </div>
                  ) : event.imageUrl ? (
                    <div className="mt-2">
                      <img
                        src={event.imageUrl}
                        alt="Current"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <FaImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn btn-primary"
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
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

export default HostedEventDetails; 