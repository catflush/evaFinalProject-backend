import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { TiDownload, TiArrowBack } from 'react-icons/ti';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEvent, error } = useEvents();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await getEvent(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast.error(error.message || 'Failed to load event details');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    } else {
      toast.error('Invalid event ID');
      navigate('/events');
    }
  }, [id, getEvent, navigate]);

  const isImageFile = (mimetype) => {
    return mimetype && mimetype.startsWith('image/');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <p>{error || 'Event not found'}</p>
          <button className="btn btn-sm" onClick={() => navigate('/events')}>Back to Events</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <button 
        className="btn btn-ghost mb-4 md:mb-6"
        onClick={() => navigate('/events')}
      >
        <TiArrowBack className="h-5 w-5 mr-1" />
        Back to Events
      </button>

      {/* Event Card */}
      <div className="mb-6 md:mb-8">
        <EventCard 
          event={event} 
          showHostActions={false}
          showSaveButton={true}
          showBookButton={true}
        />
      </div>

      {/* Image Gallery Section */}
      {event.attachments && event.attachments.filter(att => isImageFile(att.mimetype)).length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6 md:mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl md:text-2xl mb-4">Event Gallery</h2>
            <div className="carousel w-full rounded-box">
              {event.attachments
                .filter(att => isImageFile(att.mimetype))
                .map((attachment, index) => (
                  <div key={attachment._id} id={`slide${index}`} className="carousel-item relative w-full">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/${attachment.path}`}
                      alt={attachment.filename}
                      className="w-full h-64 md:h-96 object-cover rounded-box"
                    />
                    <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                      <a href={`#slide${index === 0 ? event.attachments.filter(att => isImageFile(att.mimetype)).length - 1 : index - 1}`} className="btn btn-circle">❮</a> 
                      <a href={`#slide${index === event.attachments.filter(att => isImageFile(att.mimetype)).length - 1 ? 0 : index + 1}`} className="btn btn-circle">❯</a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Non-Image Attachments */}
      {event.attachments && event.attachments.filter(att => !isImageFile(att.mimetype)).length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl md:text-2xl mb-4">Attachments</h2>
            <div className="flex flex-wrap gap-2">
              {event.attachments
                .filter(att => !isImageFile(att.mimetype))
                .map((attachment) => (
                  <a
                    key={attachment._id}
                    href={`${import.meta.env.VITE_API_URL}/${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline gap-2"
                  >
                    <TiDownload className="h-4 w-4" />
                    {attachment.filename}
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage; 