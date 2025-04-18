import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEvents } from "../context/EventContext";
import { useBookings } from "../context/BookingContext";
import { isSameDay, format } from "date-fns";
import { FaCalendarAlt, FaTimes, FaMapMarkerAlt, FaClock, FaTicketAlt } from "react-icons/fa";

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events } = useEvents();
  const { getUserBookings } = useBookings();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await getUserBookings();
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [getUserBookings]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    showDateDetails(date);
  };

  const showDateDetails = (date) => {
    const dateEvents = getEventsForDate(date);
    const dateBookings = getBookingsForDate(date);
    
    if (dateEvents.length > 0 || dateBookings.length > 0) {
      setSelectedDateDetails({
        date,
        events: dateEvents,
        bookings: dateBookings
      });
      setShowDetailsModal(true);
    }
  };

  // Get events and bookings for the selected date
  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => isSameDay(new Date(booking.eventDate), date));
  };

  // Custom tile content for the calendar
  const tileContent = ({ date }) => {
    const dateEvents = getEventsForDate(date);
    const dateBookings = getBookingsForDate(date);
    
    if (dateEvents.length === 0 && dateBookings.length === 0) {
      return null;
    }

    return (
      <div className="absolute bottom-0 left-0 right-0 p-1 text-xs">
        {dateEvents.map((event) => (
          <div 
            key={event._id} 
            className="truncate bg-primary/10 text-primary rounded px-1 mb-1 hover:bg-primary/20 transition-colors cursor-pointer"
            title={event.title}
            onClick={(e) => {
              e.stopPropagation();
              showDateDetails(date);
            }}
          >
            {event.title}
          </div>
        ))}
        {dateBookings.map((booking) => (
          <div 
            key={booking._id} 
            className="truncate bg-accent/10 text-accent rounded px-1 hover:bg-accent/20 transition-colors cursor-pointer"
            title={booking.eventName}
            onClick={(e) => {
              e.stopPropagation();
              showDateDetails(date);
            }}
          >
            {booking.eventName}
          </div>
        ))}
      </div>
    );
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <FaCalendarAlt className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-base-content/70">View and manage your events and bookings</p>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <style>
          {`
            .react-calendar {
              width: 100%;
              border: none;
              background: transparent;
            }
            .react-calendar__tile {
              padding: 1.5em 0.5em;
              position: relative;
              transition: all 0.2s;
            }
            .react-calendar__tile:hover {
              background-color: hsl(var(--b2));
            }
            .react-calendar__tile--active {
              background-color: hsl(var(--p)) !important;
              color: hsl(var(--pc)) !important;
            }
            .react-calendar__tile--now {
              background-color: hsl(var(--a) / 0.2);
            }
            .react-calendar__navigation button {
              padding: 0.5rem;
              border-radius: 0.5rem;
              font-size: 1.125rem;
              transition: all 0.2s;
            }
            .react-calendar__navigation button:hover {
              background-color: hsl(var(--b2));
            }
            .react-calendar__month-view__weekdays {
              color: hsl(var(--bc) / 0.7);
            }
            .react-calendar__month-view__weekdays__weekday {
              padding: 0.5rem;
            }
            .react-calendar__month-view__days__day--weekend {
              color: hsl(var(--er));
            }
            .has-events {
              min-height: 80px;
              transition: all 0.2s;
            }
            .has-events:hover {
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
          `}
        </style>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="w-full"
          tileClassName={({ date }) => {
            const hasEvents = getEventsForDate(date).length > 0;
            const hasBookings = getBookingsForDate(date).length > 0;
            return hasEvents || hasBookings ? 'has-events' : '';
          }}
          tileContent={tileContent}
          onClickTile={(date) => showDateDetails(date)}
        />
      </div>

      {/* Date Details Modal */}
      {showDetailsModal && selectedDateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{formatDateDisplay(selectedDateDetails.date)}</h2>
                <button 
                  className="btn btn-circle btn-ghost btn-sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Events Section */}
              {selectedDateDetails.events.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Events</h3>
                  <div className="space-y-4">
                    {selectedDateDetails.events.map(event => (
                      <div key={event._id} className="card bg-base-200 shadow-sm">
                        <div className="card-body p-4">
                          <h4 className="card-title text-lg">{event.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-primary" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClock className="text-primary" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaTicketAlt className="text-primary" />
                              <span>${event.price} per ticket</span>
                            </div>
                          </div>
                          <div className="card-actions justify-end mt-2">
                            <button className="btn btn-sm btn-primary">View Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Section */}
              {selectedDateDetails.bookings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Bookings</h3>
                  <div className="space-y-4">
                    {selectedDateDetails.bookings.map(booking => (
                      <div key={booking._id} className="card bg-base-200 shadow-sm">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <h4 className="card-title text-lg">{booking.eventName}</h4>
                            <div className={`badge ${
                              booking.status === 'confirmed' ? 'badge-success' :
                              booking.status === 'pending' ? 'badge-warning' :
                              booking.status === 'cancelled' ? 'badge-error' :
                              'badge-info'
                            }`}>
                              {booking.status || 'Unknown'}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-accent" />
                              <span>{booking.eventLocation || 'Location not available'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaTicketAlt className="text-accent" />
                              <span>{booking.numberOfParticipants || 0} participant(s)</span>
                            </div>
                          </div>
                          <div className="card-actions justify-end mt-2">
                            <button className="btn btn-sm btn-accent">View Booking</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Events or Bookings */}
              {selectedDateDetails.events.length === 0 && selectedDateDetails.bookings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-base-content/70">No events or bookings for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
