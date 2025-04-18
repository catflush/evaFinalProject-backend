import { TiPencil, TiTrash, TiCalendar, TiTime, TiUser, TiStar, TiTicket } from 'react-icons/ti';
import { format, isValid, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useUser } from '../context/useUser';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaHeart, FaRegHeart, FaImage, FaImages } from 'react-icons/fa';

const EventCard = ({ event, onEdit, onDelete, onUnsave, showHostActions = false, showSaveButton = true, showBookButton = true }) => {
  const navigate = useNavigate();
  const { saveEvent, unsaveEvent, isEventSaved, loading } = useEvents();
  const { user } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Check if the current user is the host of this event
  const isHost = user && `${user.firstName} ${user.lastName}`.trim() === event.host;

  useEffect(() => {
    // Reset image states when event changes
    setImageLoaded(false);
    setImageError(false);
    // Update saved status
    setIsSaved(isEventSaved(event._id));
  }, [event, isEventSaved]);

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on action buttons or image gallery
    if (e.target.closest('.card-actions') || 
        e.target.closest('.booking-btn') || 
        e.target.closest('.save-btn') ||
        e.target.closest('.image-gallery')) {
      return;
    }
    // Check if event ID exists before navigation
    if (event._id) {
      navigate(`/events/${event._id}`);
    } else {
      console.error('Event ID is undefined');
    }
  };

  const handleBooking = (e) => {
    e.stopPropagation();
    navigate(`/booking/${event._id}`);
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (loading) return; // Prevent multiple clicks while loading
    
    try {
      if (isSaved) {
        await unsaveEvent(event._id);
        setIsSaved(false);
        if (onUnsave) {
          onUnsave();
        }
      } else {
        await saveEvent(event._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle save status:', error);
    }
  };

  const handleDelete = async () => {
    if (loading || isDeleting) return; // Prevent multiple clicks while loading
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setIsDeleting(true);
        await onDelete(event._id);
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const isImageFile = (mimetype) => {
    return mimetype && mimetype.startsWith('image/');
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'expert':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'PPP') : 'Date not available';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  // Get all image attachments
  const getImageAttachments = () => {
    if (!event.attachments || event.attachments.length === 0) {
      // If no attachments, check for imageUrl field
      if (event.imageUrl) {
        return [{
          path: event.imageUrl,
          filename: 'Event Image',
          mimetype: 'image/jpeg'
        }];
      }
      return [];
    }
    return event.attachments.filter(att => isImageFile(att.mimetype));
  };

  const imageAttachments = getImageAttachments();
  const hasMultipleImages = imageAttachments.length > 1;

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL or starts with /uploads, return it as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/uploads')) return imagePath;
    // Otherwise, construct the URL using the API base URL
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const handleImageClick = (e, index) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const handleLightboxClose = (e) => {
    e.stopPropagation();
    setShowLightbox(false);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageAttachments.length) % imageAttachments.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageAttachments.length);
  };

  return (
    <div 
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        {imageAttachments.length > 0 && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}
            <div className="relative w-full h-full">
              <img 
                src={getImageUrl(imageAttachments[0].path)} 
                alt={imageAttachments[0].filename} 
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={(e) => handleImageClick(e, 0)}
              />
              {hasMultipleImages && (
                <div className="absolute bottom-2 right-2 bg-base-100/80 rounded-full p-2">
                  <FaImages className="h-4 w-4" />
                  <span className="ml-1 text-xs">{imageAttachments.length}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-base-200 flex items-center justify-center">
            <FaImage className="h-12 w-12 text-base-content/30" />
          </div>
        )}
        {showSaveButton && (
          <button 
            className={`absolute top-2 right-2 p-2 rounded-full bg-base-100/80 hover:bg-base-100 transition-colors save-btn ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSaveToggle}
            disabled={loading}
          >
            {isSaved ? <FaHeart className="h-5 w-5 text-red-500" /> : <FaRegHeart className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="card-body flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-lg md:text-xl line-clamp-1">{event.title}</h2>
          <div className="text-lg font-bold text-primary whitespace-nowrap ml-2">
            ${typeof event.price === 'number' ? event.price.toFixed(2) : '0.00'}
          </div>
        </div>
        
        <p className="text-base-content/70 line-clamp-2 text-sm md:text-base">{event.description}</p>
        
        <div className="space-y-1 md:space-y-2 mt-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <TiCalendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="truncate">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TiTime className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="truncate">{event.time || 'Time not specified'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TiUser className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="truncate">{event.host || 'Host not specified'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className={`badge badge-sm md:badge-md ${
            event.type === 'workshop' ? 'badge-primary' : 
            event.type === 'talks' ? 'badge-secondary' : 'badge-accent'
          }`}>
            {event.type || 'Type not specified'}
          </div>
          
          <div className={`badge badge-sm md:badge-md ${getLevelBadgeColor(event.level)} gap-1`}>
            <TiStar className="h-3 w-3" />
            {event.level || 'Level not specified'}
          </div>
        </div>

        {/* Card Actions */}
        <div className="card-actions justify-end mt-4">
          {showBookButton && (
            <button 
              className="btn btn-primary btn-sm booking-btn"
              onClick={handleBooking}
            >
              <TiTicket className="h-4 w-4 mr-1" />
              Book Now
            </button>
          )}
          
          {showHostActions && isHost && (
            <>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
              >
                <FaEdit className="h-4 w-4" />
              </button>
              <button 
                className={`btn btn-ghost btn-sm ${isDeleting ? 'loading' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {!isDeleting && <FaTrash className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={handleLightboxClose}
        >
          <div className="relative max-w-4xl w-full mx-4">
            <img 
              src={getImageUrl(imageAttachments[currentImageIndex].path)}
              alt={imageAttachments[currentImageIndex].filename}
              className="max-h-[80vh] w-full object-contain"
            />
            {hasMultipleImages && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-base-100/80 p-2 rounded-full"
                  onClick={handlePrevImage}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-base-100/80 p-2 rounded-full"
                  onClick={handleNextImage}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard; 