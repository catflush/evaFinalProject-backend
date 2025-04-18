import { useEffect } from 'react';
import { useUser } from "../context/useUser";
import { useAnalytics } from '../context/AnalyticsContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const { user } = useUser();
  const { analytics, loading, error, fetchAnalytics } = useAnalytics();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user, navigate, fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <div className="stat-title">Total Bookings</div>
            <div className="stat-value">{analytics.bookings.total}</div>
            <div className="stat-desc">All time bookings</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FaMoneyBillWave className="text-3xl" />
            </div>
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">${analytics.revenue.total}</div>
            <div className="stat-desc">All time revenue</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <FaUsers className="text-3xl" />
            </div>
            <div className="stat-title">Active Services</div>
            <div className="stat-value">{analytics.services.active}</div>
            <div className="stat-desc">Out of {analytics.services.total} total</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <FaChartLine className="text-3xl" />
            </div>
            <div className="stat-title">Monthly Revenue</div>
            <div className="stat-value">${analytics.revenue.monthly}</div>
            <div className="stat-desc">Current month</div>
          </div>
        </div>
      </div>

      {/* Bookings Status */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Bookings Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{analytics.bookings.pending}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Confirmed</div>
              <div className="stat-value text-success">{analytics.bookings.confirmed}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Cancelled</div>
              <div className="stat-value text-error">{analytics.bookings.cancelled}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Completed</div>
              <div className="stat-value text-info">{analytics.bookings.completed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services by Category */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Services by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.services.byCategory.map(category => (
              <div key={category.categoryId} className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title">{category.name}</div>
                <div className="stat-value">{category.count}</div>
                <div className="stat-desc">services</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Revenue by Service</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.revenue.byService.map(service => (
                  <tr key={service.serviceId}>
                    <td>{service.title}</td>
                    <td>${service.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 