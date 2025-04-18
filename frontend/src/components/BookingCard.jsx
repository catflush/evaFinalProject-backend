import React from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const BookingCard = ({ 
  booking, 
  onViewDetails, 
  onEdit, 
  onCancel, 
  onDelete, 
  processing,
  getBookingTitle,
  getBookingDetails,
  getStatusBadgeColor
}) => {
  const details = getBookingDetails(booking);
  const statusColor = getStatusBadgeColor(booking.status);
  
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-lg font-bold">{getBookingTitle(booking)}</h3>
          </div>
          <div className={`badge ${statusColor} text-white`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </div>
        
        <div className="divider my-2"></div>
        
        <div className="space-y-2">
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
          
          {booking.bookingType === 'event' && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" />
              <span>{details.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <FaUsers className="text-primary" />
            <span>{details.participants} {details.participants === 1 ? 'Participant' : 'Participants'}</span>
          </div>
        </div>
        
        <div className="card-actions justify-end mt-4">
          <button 
            onClick={() => onViewDetails(booking)} 
            className="btn btn-sm btn-primary"
          >
            View Details
          </button>
          
          {booking.status !== 'cancelled' && (
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