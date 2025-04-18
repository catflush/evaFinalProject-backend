import { useState, useRef } from 'react';
import { useEvents } from '../context/EventContext';
import { toast } from 'react-toastify';
import { TiUpload, TiTrash } from 'react-icons/ti';

const EventForm = ({ event = null, onSuccess }) => {
  const { createEvent, updateEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
    time: event?.time || '',
    type: event?.type || 'workshop',
    level: event?.level || 'beginner',
    price: event?.price || 0
  });
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState(event?.attachments || []);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attachmentId) => {
    setExistingAttachments(prev => prev.filter(att => att._id !== attachmentId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.title || !formData.description || !formData.date || !formData.time) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Create event data object
      const eventData = {
        ...formData,
        date: new Date(formData.date)
      };
      
      let result;
      
      if (event) {
        // Update existing event
        result = await updateEvent(event._id, eventData, files);
        toast.success('Event updated successfully');
      } else {
        // Create new event
        result = await createEvent(eventData, files);
        toast.success('Event created successfully');
      }
      
      // Reset form
      if (!event) {
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          type: 'workshop',
          level: 'beginner',
          price: 0
        });
        setFiles([]);
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title *</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Event title"
          required
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Description *</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
          placeholder="Event description"
          required
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Date *</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Time *</span>
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Event Type</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="workshop">Workshop</option>
            <option value="talks">Talks</option>
            <option value="networking">Networking</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Level of Expertise *</span>
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Price *</span>
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Attachments</span>
        </label>
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <p className="text-xs text-gray-500">
            Accepted formats: Images, PDF, Word, Excel, PowerPoint (max 10MB each, up to 5 files)
          </p>
        </div>
      </div>
      
      {/* Display selected files */}
      {files.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-base-200 p-2 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <TiTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Display existing attachments */}
      {existingAttachments.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-medium mb-2">Existing Attachments:</h3>
          <ul className="space-y-1">
            {existingAttachments.map((attachment) => (
              <li key={attachment._id} className="flex items-center justify-between bg-base-200 p-2 rounded">
                <a 
                  href={`${import.meta.env.VITE_API_URL}/${attachment.path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm truncate hover:underline"
                >
                  {attachment.filename}
                </a>
                <button
                  type="button"
                  onClick={() => removeExistingAttachment(attachment._id)}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <TiTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="form-control mt-6">
        <button 
          type="submit" 
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm; 