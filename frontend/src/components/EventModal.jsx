import { useEffect } from 'react';
import EventForm from './EventForm';
import { TiTimes } from 'react-icons/ti';

const EventModal = ({ isOpen, onClose, event = null, onSuccess }) => {
  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-circle hover:bg-error hover:text-error-content"
              aria-label="Close modal"
            >
              <TiTimes className="h-6 w-6" />
            </button>
          </div>
          
          <EventForm 
            event={event} 
            onSuccess={handleSuccess} 
          />
        </div>
      </div>
    </div>
  );
};

export default EventModal; 