import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../context/useUser";
import Sidebar from "../components/UI/Sidebar";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      // No user data found, redirect to login
      toast.error("Please log in to access the dashboard");
      navigate("/login");
    }
    
    setLoading(false);
  }, [location, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Main content area */}
          <div className="bg-base-100 rounded-box shadow-lg p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 