import { Link, NavLink, useNavigate } from "react-router-dom";
import { WiAlien } from "react-icons/wi";
import { useUser } from "../../context/useUser";
import { FaUser, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";

const NavBar = () => {
  const { user, logout, } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="navbar-start">
        <Link to={user ? "/dashboard" : "/"} className="btn btn-ghost text-xl">
          <WiAlien className="h-6 w-6" />
          <span className="font-bold">Maker.io</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
        
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-content font-bold">
                  {user.firstName ? user.firstName.charAt(0) : 'U'}
                </span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-neutral rounded-box w-52">
              <li className="text-neutral-content font-medium px-4 py-2">
                {user.firstName} {user.lastName}
              </li>
              <li>
                <Link to="/dashboard/profile" className="text-neutral-content gap-2">
                  <FaUser className="h-4 w-4" />
                  Profile
                </Link>
              </li>
              <li><button onClick={handleLogout} className="text-neutral-content gap-2">
                <FaSignOutAlt className="h-4 w-4" />
                Logout
              </button></li>
            </ul>
          </div>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">Log In</NavLink>
            <NavLink to="/register" className="btn btn-accent text-accent-content">Sign up</NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
