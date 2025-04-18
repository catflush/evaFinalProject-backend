import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkshops } from '../context/WorkshopContext';
import { useUser } from '../context/useUser';
import { useBookings } from '../context/BookingContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTicketAlt, FaClock, FaArrowLeft, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WorkshopDetailPage = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { getWorkshop, deleteWorkshop } = useWorkshops();
  const { user, isAdmin } = useUser();
  const { createBooking, getUserBookings } = useBookings();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        const workshopData = await getWorkshop(workshopId);
        if (!workshopData) {
          throw new Error('Workshop not found');
        }
        setWorkshop(workshopData);
      } catch (error) {
        console.error('Error loading workshop:', error);
        toast.error(error.message || 'Failed to load workshop details');
        navigate('/workshops');
      } finally {
        setLoading(false);
      }
    };

    loadWorkshop();
  }, [workshopId, getWorkshop, navigate]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (user) {
        try {
          const bookings = await getUserBookings();
          const isRegisteredForWorkshop = bookings.some(
            booking => 
              booking.workshop?._id === workshopId && 
              ['pending', 'confirmed'].includes(booking.status)
          );
          setIsRegistered(isRegisteredForWorkshop);
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      }
    };

    checkRegistration();
  }, [user, workshopId, getUserBookings]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        await deleteWorkshop(workshopId);
        toast.success('Workshop deleted successfully');
        navigate('/workshops');
      } catch (error) {
        toast.error(error.message || 'Failed to delete workshop');
      }
    }
  };

  const handleBook = async () => {
    if (!user) {
      toast.error('Please login to book this workshop');
      navigate('/login');
      return;
    }

    if (!workshop) {
      toast.error('Workshop details not available');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        bookingType: 'workshop',
        workshopId: workshop._id,
        date: workshop.date,
        time: workshop.time,
        numberOfParticipants: 1,
        paymentMethod: 'credit_card',
        notes: `Booking for workshop: ${workshop.title}`,
        customerDetails: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || ''
        }
      };

      await createBooking(bookingData);
      toast.success('Workshop booked successfully!');
      navigate('/dashboard/my-bookings');
    } catch (error) {
      console.error('Error booking workshop:', error);
      toast.error(error.message || 'Failed to book workshop. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Workshop not found</h2>
          <button
            onClick={() => navigate('/workshops')}
            className="mt-4 btn btn-primary"
          >
            Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/workshops')}
          className="btn btn-ghost gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Workshops
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Workshop Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workshop.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-gray-600">
                <span className="badge badge-primary">{workshop.category}</span>
              </div>
            </div>
            {isAdmin() && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/workshops/${workshopId}/edit`)}
                  className="btn btn-ghost btn-sm"
                  title="Edit Workshop"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost btn-sm text-error"
                  title="Delete Workshop"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workshop Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-gray-600">
                    {workshop.date && isValid(new Date(workshop.date)) 
                      ? format(new Date(workshop.date), 'PPP')
                      : 'Date not available'} at {workshop.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{workshop.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaUsers className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Capacity</h3>
                  <p className="text-gray-600">{workshop.capacity} participants</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaTicketAlt className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Price</h3>
                  <p className="text-gray-600">${workshop.price}</p>
                </div>
              </div>
            </div>

            <div>
              {workshop.image && (
                <img
                  src={`${API_URL}/uploads/workshops/${workshop.image}`}
                  alt={workshop.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{workshop.description}</p>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            {user && !isAdmin() && (
              <>
                {isRegistered ? (
                  <div className="flex items-center gap-2 text-success">
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Already Registered</span>
                  </div>
                ) : (
                  <button
                    onClick={handleBook}
                    className="btn btn-primary"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      'Book Workshop'
                    )}
                  </button>
                )}
              </>
            )}
            {isAdmin() && (
              <>
                <button
                  onClick={() => navigate(`/workshops/${workshopId}/edit`)}
                  className="btn btn-primary"
                >
                  Edit Workshop
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-error"
                >
                  Delete Workshop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetailPage; 