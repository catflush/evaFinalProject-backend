import User from '../models/User.js';
import Event from '../models/Event.js';

// Add event to user's list
export const addEventToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is already in user's list
    if (user.events.includes(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Event already in user\'s list'
      });
    }

    // Add event to user's list
    user.events.push(eventId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error adding event to user:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update event in user's list
export const updateEventInUserList = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const updates = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if event is in user's list
    if (!user.events.includes(eventId)) {
      return res.status(404).json({
        success: false,
        error: 'Event not found in user\'s list'
      });
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      eventId,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('Error updating event in user list:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete event from user's list
export const deleteEventFromUserList = async (req, res) => {
  try {
    const { id, eventId } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if event is in user's list
    if (!user.events.includes(eventId)) {
      return res.status(404).json({
        success: false,
        error: 'Event not found in user\'s list'
      });
    }

    // Remove event from user's list
    user.events = user.events.filter(event => event.toString() !== eventId);
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting event from user list:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 