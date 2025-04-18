import React from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt, FaEdit, FaTrash, FaTimes, FaGraduationCap, FaUserTie, FaTicketAlt, FaTools, FaCheck, FaHistory } from 'react-icons/fa';

const BookingCard = ({ 
  booking, 
  onView, 
  onEdit, 
  onCancel, 
  onDelete, 
  processing,
  getTitle,
  getDetails,
  getStatusColor,
  isPast
}) => {
  const details = getDetails(booking);
  const statusColor = getStatusColor(booking.status);
  
  // Get booking type badge color and icon
  const getBookingTypeBadge = (type) => {
    switch (type) {
      case 'event':
        return {
          color: 'badge-primary',
          icon: <FaTicketAlt className="w-3 h-3" />,
          text: 'Event'
        };
      case 'workshop':
        return {
          color: 'badge-secondary',
          icon: <FaGraduationCap className="w-3 h-3" />,
          text: 'Workshop'
        };
      case 'service':
        return {
          color: 'badge-accent',
          icon: <FaTools className="w-3 h-3" />,
          text: 'Service'
        };
      default:
        return {
          color: 'badge-ghost',
          icon: null,
          text: 'Unknown'
        };
    }
  };

  // Get status badge color and icon
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'badge-success',
          icon: <FaCheck className="w-3 h-3" />,
          text: 'Confirmed'
        };
      case 'pending':
        return {
          color: 'badge-warning',
          icon: <FaClock className="w-3 h-3" />,
          text: 'Pending'
        };
      case 'cancelled':
        return {
          color: 'badge-error',
          icon: <FaTimes className="w-3 h-3" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'badge-ghost',
          icon: null,
          text: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const bookingType = getBookingTypeBadge(booking.bookingType);
  const statusBadge = getStatusBadge(booking.status);
  
  return (
    <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group ${isPast ? 'opacity-75' : ''}`}>
      <div className="card-body p-6">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="card-title text-lg font-bold group-hover:text-primary transition-colors duration-300">
              {getTitle(booking)}
            </h3>
            <div className="flex gap-2 mt-2">
              <div className={`badge ${bookingType.color} gap-1`}>
                {bookingType.icon}
                {bookingType.text}
              </div>
              <div className={`badge ${statusBadge.color} gap-1 text-white`}>
                {statusBadge.icon}
                {statusBadge.text}
              </div>
              {isPast && (
                <div className="badge badge-ghost gap-1">
                  <FaHistory className="w-3 h-3" />
                  Past
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="divider my-3"></div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            <span>{details.date}</span>
          </div>
          
          {booking.bookingType === 'service' && (
            <>
              <div className="flex items-center gap-2">
                <FaClock className="text-primary" />
                <span>{details.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Price:</span>
                <span>{details.price}</span>
              </div>
            </>
          )}
          
          {(booking.bookingType === 'event' || booking.bookingType === 'workshop') && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" />
              <span>{details.location}</span>
            </div>
          )}
          
          {booking.bookingType === 'workshop' && (
            <>
              <div className="flex items-center gap-2">
                <FaUserTie className="text-primary" />
                <span>Instructor: {details.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-primary" />
                <span>Level: {details.level}</span>
              </div>
            </>
          )}
          
          <div className="flex items-center gap-2">
            <FaUsers className="text-primary" />
            <span>{details.participants} {details.participants === 1 ? 'Participant' : 'Participants'}</span>
          </div>
        </div>
        
        <div className="card-actions justify-end mt-6">
          <button 
            onClick={() => onView(booking)} 
            className="btn btn-sm btn-primary"
          >
            View Details
          </button>
          
          {!isPast && booking.status !== 'cancelled' && (
            <>
              <button 
                onClick={() => onEdit(booking)} 
                className="btn btn-sm btn-outline btn-info"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => onCancel(booking._id)} 
                disabled={processing}
                className="btn btn-sm btn-outline btn-error"
              >
                {processing ? 'Canceling...' : 'Cancel'}
              </button>
            </>
          )}
          
          {booking.status === 'cancelled' && (
            <button 
              onClick={() => onDelete(booking._id)} 
              className="btn btn-sm btn-outline btn-error"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard; 