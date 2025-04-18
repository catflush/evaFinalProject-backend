import { useState, useEffect } from 'react';
import { useWorkshops } from '../context/WorkshopContext';
import { useUser } from '../context/useUser';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch, FaFilter, FaBook } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WorkshopsPage = () => {
  const { 
    workshops, 
    loading, 
    error, 
    getWorkshops, 
    getUpcomingWorkshops,
    deleteWorkshop,
    registerForWorkshop
  } = useWorkshops();
  
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        if (showUpcoming) {
          await getUpcomingWorkshops();
        } else {
          await getWorkshops({
            search: searchTerm,
            categoryId: categoryFilter
          });
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
      }
    };

    fetchWorkshops();
  }, [searchTerm, categoryFilter, showUpcoming, getWorkshops, getUpcomingWorkshops]);

  const handleDelete = async (workshopId) => {
    if (!window.confirm('Are you sure you want to delete this workshop? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await deleteWorkshop(workshopId);
      toast.success('Workshop deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete workshop');
    } finally {
      setProcessing(false);
    }
  };

  const handleBookWorkshop = async (workshopId) => {
    if (!user) {
      toast.error('Please login to book a workshop');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);
      await registerForWorkshop(workshopId);
      toast.success('Successfully booked the workshop');
    } catch (error) {
      toast.error(error.message || 'Failed to book workshop');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
        {user?.isAdmin && (
          <Link to="/workshops/create" className="btn btn-primary">
            Create Workshop
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select select-bordered"
            >
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="art">Art</option>
              <option value="science">Science</option>
            </select>
            <button
              onClick={() => setShowUpcoming(!showUpcoming)}
              className={`btn ${showUpcoming ? 'btn-primary' : 'btn-outline'}`}
            >
              <FaFilter className="mr-2" />
              {showUpcoming ? 'Show All' : 'Show Upcoming'}
            </button>
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop) => (
          <div key={workshop._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {workshop.image && (
              <img
                src={`${API_URL}/uploads/workshops/${workshop.image}`}
                alt={workshop.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{workshop.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    {workshop.date && isValid(new Date(workshop.date))
                      ? format(new Date(workshop.date), 'PPP')
                      : 'Date not set'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{workshop.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  <span>{workshop.capacity || 0} participants</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  to={`/workshops/${workshop._id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
                <div className="flex gap-2">
                  {user?.isAdmin ? (
                    <>
                      <Link
                        to={`/workshops/${workshop._id}/edit`}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(workshop._id)}
                        disabled={processing}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    </>
                  ) : user ? (
                    <button
                      onClick={() => handleBookWorkshop(workshop._id)}
                      disabled={processing}
                      className="btn btn-primary btn-sm"
                    >
                      <FaBook className="mr-2" />
                      Book Now
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="btn btn-primary btn-sm"
                    >
                      Login to Book
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workshops.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-xl font-medium text-gray-900">No workshops found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopsPage; 