import { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useUser } from "../context/useUser";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('API_URL is not defined in environment variables');
}

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      const response = await fetch(`${API_URL}/analytics`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const value = useMemo(() => ({
    analytics,
    loading,
    error,
    fetchAnalytics,
    refreshAnalytics,
  }), [analytics, loading, error, fetchAnalytics, refreshAnalytics]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext; 