import { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useEvents } from "../context/EventContext";
import EventCard from "../components/EventCard";

const SavedEventsPage = () => {
  const { getSavedEvents, loading, unsaveEvent } = useEvents();
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    const fetchSavedEvents = async () => {
      const events = await getSavedEvents();
      setSavedEvents(events);
    };

    fetchSavedEvents();
  }, [getSavedEvents]);

  const handleUnsaveEvent = async (eventId) => {
    try {
      await unsaveEvent(eventId);
      // Remove the unsaved event from the local state
      setSavedEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error unsaving event:', error);
    }
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
      <div className="flex items-center gap-2 mb-6">
        <FaCalendarAlt className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Saved Events</h1>
        <div className="badge badge-primary">{savedEvents.length}</div>
      </div>

      {savedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-base-content/70">You haven't saved any events yet.</p>
          <p className="text-base-content/50 mt-2">Browse events and save your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              showHostActions={false}
              showSaveButton={true}
              showBookButton={true}
              onUnsave={() => handleUnsaveEvent(event._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedEventsPage; 