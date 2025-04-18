import { useState, useEffect } from "react";
import { FaUserTie, FaPlus } from "react-icons/fa";
import { useEvents } from "../context/EventContext";
import EventCard from "../components/EventCard";
import { toast } from "react-toastify";
import EventModal from "../components/EventModal";
import { useNavigate } from "react-router-dom";

const HostedEventsPage = () => {
  const { getHostedEvents, loading, deleteEvent } = useEvents();
  const [hostedEvents, setHostedEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHostedEvents = async () => {
      const events = await getHostedEvents();
      setHostedEvents(events);
    };

    fetchHostedEvents();
  }, [getHostedEvents]);

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        setHostedEvents(hostedEvents.filter(event => event._id !== eventId));
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
        console.error("Delete error:", error);
      }
    }
  };

  const handleEventClick = (event) => {
    navigate(`/dashboard/hosted-events/${event._id}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleModalSuccess = async () => {
    const events = await getHostedEvents();
    setHostedEvents(events);
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaUserTie className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">My Events</h1>
          <div className="badge badge-primary">{hostedEvents.length}</div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <FaPlus className="h-5 w-5 mr-1" />
          Create Event
        </button>
      </div>

      {hostedEvents.length === 0 ? (
        <div className="text-center py-12">
          <FaUserTie className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hosted events</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first event to see it here!</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={openCreateModal}
          >
            <FaPlus className="h-4 w-4 mr-1" />
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostedEvents.map((event) => (
            <div key={event._id} onClick={() => handleEventClick(event)}>
              <EventCard 
                event={event} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                showHostActions={true}
                showSaveButton={false}
                showBookButton={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default HostedEventsPage; 