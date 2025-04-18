import { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from './useUser';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

// Export the context directly
export const ServiceContext = createContext();

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

export const ServiceProvider = ({ children }) => {
  const { user } = useUser();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get single service
  const getService = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/services/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch service');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create new service
  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Append service data
      Object.keys(serviceData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, serviceData[key]);
        }
      });

      // Append files if they exist
      if (serviceData.attachments && serviceData.attachments.length > 0) {
        serviceData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create service');
      }

      const data = await response.json();
      setServices(prev => [...prev, data.data]);
      toast.success('Service created successfully');
      return data.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update service
  const updateService = useCallback(async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Append service data
      Object.keys(serviceData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, serviceData[key]);
        }
      });

      // Append files if they exist
      if (serviceData.attachments && serviceData.attachments.length > 0) {
        serviceData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }

      const data = await response.json();
      setServices(prev => prev.map(service => 
        service._id === id ? data.data : service
      ));
      toast.success('Service updated successfully');
      return data.data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete service
  const deleteService = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }

      setServices(prev => prev.filter(service => service._id !== id));
      toast.success('Service deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete attachment from service
  const deleteAttachment = useCallback(async (serviceId, attachmentId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/services/${serviceId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete attachment');
      }

      const data = await response.json();
      setServices(prev => prev.map(service => 
        service._id === serviceId ? data.data : service
      ));
      toast.success('Attachment deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = {
    services,
    loading,
    error,
    fetchServices,
    getService,
    createService,
    updateService,
    deleteService,
    deleteAttachment
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}; 