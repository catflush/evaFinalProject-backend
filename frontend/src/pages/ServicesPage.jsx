import { useEffect, useState } from 'react';
import { useServices } from '../context/ServiceContext';
import { FaGraduationCap, FaTools, FaPaintBrush, FaCut, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const { services, loading, error, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
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
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      {/* Hero Section */}
      <div className="hero min-h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        <div className="hero-content text-center relative z-10 py-20">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-lg">Our Services</h1>
            <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto">
              Transform your creative ideas into extraordinary consumer products with our cutting-edge services!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="stat-figure text-white">
                  <FaTools className="text-4xl mb-4" />
                </div>
                <div className="stat-title text-white font-semibold text-lg">Send your design</div>
                <div className="stat-desc text-white/80">Upload your creative vision</div>
              </div>
              <div className="stat bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="stat-figure text-white">
                  <FaPaintBrush className="text-4xl mb-4" />
                </div>
                <div className="stat-title text-white font-semibold text-lg">Customization</div>
                <div className="stat-desc text-white/80">Our team brings it to life</div>
              </div>
              <div className="stat bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
                <div className="stat-figure text-white">
                  <FaCut className="text-4xl mb-4" />
                </div>
                <div className="stat-title text-white font-semibold text-lg">Delivery</div>
                <div className="stat-desc text-white/80">Your product arrives ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Available Services
          </h2>
          <p className="text-base-content/70 max-w-3xl mx-auto text-lg leading-relaxed">
            We provide exceptional services for the creation of remarkable consumer products through advanced technology and precision engineering. Our expertise includes 3D laser cutting, textile customization, and vinyl cutting, ensuring the highest standards of quality and innovation.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="alert alert-info max-w-md mx-auto">
              <FaGraduationCap className="text-2xl" />
              <span>No services available at the moment.</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
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

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'expert':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
      {service.attachments && service.attachments.length > 0 && !imageError ? (
        <div className="relative h-64 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div>
            </div>
          )}
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${service.attachments[0].path}`}
            alt={service.title}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${imageLoading ? 'hidden' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      )}
      <div className="card-body p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="card-title text-xl font-bold group-hover:text-primary transition-colors duration-300">
            {service.title}
          </h2>
          <div className={`badge ${getLevelBadgeColor(service.level)} badge-lg`}>
            {service.level}
          </div>
        </div>
        <p className="text-base-content/70 line-clamp-3 mb-6">{service.description}</p>
        <div className="card-actions justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ${service.price}
            </span>
            <span className="text-sm text-base-content/50">per session</span>
          </div>
          <Link 
            to={`/dashboard/book-service/${service._id}`} 
            className="btn btn-primary btn-sm group-hover:btn-secondary transition-all duration-300"
          >
            Book Now
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 