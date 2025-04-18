import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/UI/NavBar";
import Footer from "../components/UI/Footer";

function MainLayout() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-primary shadow-lg">
        <NavBar />
      </div>

      {/* Main content */}
      <main className={`flex-grow ${isDashboardRoute ? '' : 'container mx-auto px-4 py-8'}`}>
        {isDashboardRoute ? (
          <Outlet />
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="bg-base-100 rounded-lg shadow-lg p-6">
              <Outlet />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>

      {/* Toast Notifications - Single instance */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </div>
  );
}

export default MainLayout;
