import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkshops } from '../context/WorkshopContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function WorkshopEditPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { getWorkshop, updateWorkshop } = useWorkshops();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    price: '',
    category: '',
    image: null,
    currentImage: ''
  });

  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        const workshopData = await getWorkshop(workshopId);
        if (!workshopData) {
          throw new Error('Workshop not found');
        }
        setFormData({
          title: workshopData.title,
          description: workshopData.description,
          date: format(new Date(workshopData.date), 'yyyy-MM-dd'),
          time: workshopData.time || '',
          location: workshopData.location,
          capacity: workshopData.capacity,
          price: workshopData.price,
          category: workshopData.category,
          image: null,
          currentImage: workshopData.image
        });
      } catch (error) {
        console.error('Error loading workshop:', error);
        toast.error(error.message || 'Failed to load workshop details');
        navigate('/workshops');
      } finally {
        setLoading(false);
      }
    };

    loadWorkshop();
  }, [workshopId, getWorkshop, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcessing(true);
      
      // Create FormData object
      const workshopData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          workshopData.append(key, formData[key]);
        }
      });

      await updateWorkshop(workshopId, workshopData);
      toast.success('Workshop updated successfully');
      navigate(`/workshops/${workshopId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update workshop');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Workshop</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Time</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Capacity</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="input input-bordered"
                min="1"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Price ($)</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input input-bordered"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="art">Art</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Current Image</span>
            </label>
            {formData.currentImage && (
              <img
                src={formData.currentImage}
                alt="Current workshop"
                className="w-64 h-64 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">New Image</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/workshops/${workshopId}`)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={processing}
            >
              {processing ? 'Updating...' : 'Update Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 