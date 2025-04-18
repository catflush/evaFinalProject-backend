import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  TiHome,
  TiUser,
  TiCalendar,
  TiPower,
  TiGroup,
  TiCalendarOutline,
  TiStar,
  TiUserOutline,
  TiTicket,
  TiClipboard
} from "react-icons/ti";
import { useUser } from "../../context/useUser";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUser,
  FaBookmark,
  FaUsers,
  FaCog,
  FaClipboardList,
  FaChartLine,
  FaTachometerAlt
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useUser();

  const handleLogout = () => {
    try {
      logout();
      toast.success("You have been logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-base-200 shadow-lg">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">Dashboard</h1>
        <ul className="menu menu-lg gap-2">
          {isAdmin() ? (
            // Admin menu items
            <>
              <li>
                <Link to="/dashboard/admin" className={location.pathname === "/dashboard/admin" ? "active" : ""}>
                  <FaTachometerAlt className="h-6 w-6" />
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin/bookings" className={location.pathname === "/dashboard/admin/bookings" ? "active" : ""}>
                  <TiClipboard className="h-6 w-6" />
                  Admin Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin/services" className={location.pathname === "/dashboard/admin/services" ? "active" : ""}>
                  <TiClipboard className="h-6 w-6" />
                  Admin Services
                </Link>
              </li>
            </>
          ) : (
            // Regular user menu items
            <>
              <li>
                <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
                  <TiHome className="h-6 w-6" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard/community" className={location.pathname === "/dashboard/community" ? "active" : ""}>
                  <TiGroup className="h-6 w-6" />
                  Community
                </Link>
              </li>
              <li>
                <Link to="/dashboard/events" className={location.pathname === "/dashboard/events" ? "active" : ""}>
                  <TiCalendar className="h-6 w-6" />
                  Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard/hosted-events" className={location.pathname === "/dashboard/hosted-events" ? "active" : ""}>
                  <TiUserOutline className="h-6 w-6" />
                  My Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-bookings" className={location.pathname === "/dashboard/my-bookings" ? "active" : ""}>
                  <TiTicket className="h-6 w-6" />
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/saved-events" className={location.pathname === "/dashboard/saved-events" ? "active" : ""}>
                  <TiStar className="h-6 w-6" />
                  Saved Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard/calendar" className={location.pathname === "/dashboard/calendar" ? "active" : ""}>
                  <TiCalendarOutline className="h-6 w-6" />
                  Calendar
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/dashboard/profile" className={location.pathname === "/dashboard/profile" ? "active" : ""}>
              <TiUser className="h-6 w-6" />
              Profile
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="text-error">
              <TiPower className="h-6 w-6" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 