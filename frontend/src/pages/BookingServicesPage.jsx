import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import { useBookings } from '../context/BookingContext';
import { useUser } from '../context/useUser';
import { FaGraduationCap, FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookingServicesPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { services, loading: servicesLoading, fetchServices } = useServices();
  const { createBooking, loading: bookingLoading } = useBookings();
  
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: '',
    time: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // Reset form when selecting a new service
    setFormData({
      name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
      date: '',
      time: '',
      notes: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast.error('Please select a service first');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      const bookingData = {
        bookingType: 'service',
        serviceId: selectedService._id,
        date: formData.date,
        time: formData.time,
        numberOfParticipants: 1,
        paymentMethod: 'credit_card',
        notes: formData.notes
      };

      await createBooking(bookingData);
      navigate('/dashboard/my-bookings');
    } catch (error) {
      console.error('Booking creation failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <FaGraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Book a Service</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Selection */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Available Services</h2>
              {servicesLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service._id} 
                      className={`card bg-base-200 cursor-pointer transition-all ${
                        selectedService?._id === service._id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="card-body p-4">
                        <h3 className="card-title text-lg">
                          {service.title}
                          <div className={`badge ${
                            service.level === 'beginner' ? 'badge-success' :
                            service.level === 'intermediate' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {service.level}
                          </div>
                        </h3>
                        <p className="text-base-content/70 line-clamp-2">{service.description}</p>
                        <div className="card-actions justify-between items-center mt-2">
                          <span className="text-xl font-bold text-primary">
                            ${service.price}
                          </span>
                          <button 
                            className={`btn btn-sm ${
                              selectedService?._id === service._id ? 'btn-primary' : 'btn-ghost'
                            }`}
                          >
                            {selectedService?._id === service._id ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No services available</h3>
                  <p className="mt-1 text-sm text-gray-500">Check back later for new services!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Booking Details</h2>
              
              {selectedService ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Summary */}
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Selected Service</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedService.title}</p>
                        <p className="text-sm text-base-content/70">{selectedService.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">${selectedService.price}</p>
                        <div className={`badge ${
                          selectedService.level === 'beginner' ? 'badge-success' :
                          selectedService.level === 'intermediate' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {selectedService.level}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaUser className="text-primary" />
                          Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`input input-bordered ${formErrors.name ? 'input-error' : ''}`}
                        placeholder="Your full name"
                      />
                      {formErrors.name && <p className="text-error text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaEnvelope className="text-primary" />
                          Email
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`input input-bordered ${formErrors.email ? 'input-error' : ''}`}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && <p className="text-error text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaPhone className="text-primary" />
                          Phone
                        </span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number (optional)"
                        pattern="[\d\s\+\-\(\)]{6,20}"
                        title="Please enter a valid phone number (6-20 characters, can include numbers, spaces, +, -, (, ))"
                      />
                    </div>
                  </div>
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaCalendarAlt className="text-primary" />
                          Date
                        </span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`input input-bordered ${formErrors.date ? 'input-error' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.date && <p className="text-error text-sm mt-1">{formErrors.date}</p>}
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaClock className="text-primary" />
                          Time
                        </span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className={`input input-bordered ${formErrors.time ? 'input-error' : ''}`}
                      />
                      {formErrors.time && <p className="text-error text-sm mt-1">{formErrors.time}</p>}
                    </div>
                  </div>
                  
                  {/* Additional Notes */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Additional Notes</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered h-24"
                      placeholder="Any special requirements or questions?"
                    ></textarea>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="card-actions justify-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Booking...
                        </>
                      ) : (
                        'Book Service'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No service selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Please select a service from the list to continue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingServicesPage; 