import { useEffect, useState } from 'react';
import { useServices } from '../context/ServiceContext';
import { FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const { services, loading, error, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <p>{error}</p>
          <button className="btn btn-sm" onClick={fetchServices}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <FaGraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Available Services</h1>
        <div className="badge badge-primary">{services.length}</div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-base-content/70">No services available at the moment.</p>
          <p className="text-base-content/50 mt-2">Check back later for new services!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = (e) => {
    console.error('Error loading image:', e);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      {service.attachments && service.attachments.length > 0 && !imageError ? (
        <div className="relative h-48">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div>
            </div>
          )}
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${service.attachments[0].path}`}
            alt={service.title}
            className={`w-full h-full object-cover ${imageLoading ? 'hidden' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      )}
      <div className="card-body">
        <h2 className="card-title">
          {service.title}
          <div className={`badge ${
            service.level === 'beginner' ? 'badge-success' :
            service.level === 'intermediate' ? 'badge-warning' :
            'badge-error'
          }`}>
            {service.level}
          </div>
        </h2>
        <p className="text-base-content/70">{service.description}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-xl font-bold text-primary">
            ${service.price}
          </span>
          <Link to="/dashboard/book-service" className="btn btn-primary">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 