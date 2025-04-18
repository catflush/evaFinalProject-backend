// src/router/AppRouter.jsx
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import LandingPage from "../pages/LandingPage";
import ContactPage from "../pages/ContactPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import DashboardHome from "../pages/DashboardHome";
import DashboardProfile from "../pages/MyBookingPage";
import UserProfilePage from "../pages/UserProfilePage";
import EventsPage from "../pages/EventsPage";
import EventDetailPage from "../pages/EventDetailPage";
import BookingPage from "../pages/BookingPage";
import SavedEventsPage from "../pages/SavedEventsPage";
import HostedEventsPage from "../pages/HostedEventsPage";
import BookingCalendar from "../pages/BookingCalendar";
import ServicesPage from "../pages/ServicesPage";
import BookingServicesPage from "../pages/BookingServicesPage";
import AdminBookingsPage from "../pages/AdminBookingsPage";
import AdminServicesPage from '../pages/AdminServicesPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import CommunityPage from '../pages/CommunityPage';
import { UserProvider } from "../context/UserContext";
import { EventProvider } from "../context/EventContext";
import { BookingProvider } from "../context/BookingContext";
import { ServiceProvider } from "../context/ServiceContext";
import { CategoryProvider } from "../context/CategoryContext";
import { AnalyticsProvider } from "../context/AnalyticsContext";
import { PostProvider } from "../context/PostContext";
import { WorkshopProvider } from "../context/WorkshopContext";
import HostedEventDetails from '../pages/HostedEventDetails';
import WorkshopsPage from "../pages/WorkshopsPage";
import WorkshopCreatePage from "../pages/WorkshopCreatePage";
import WorkshopDetailPage from "../pages/WorkshopDetailPage";
import WorkshopEditPage from "../pages/WorkshopEditPage";

function AppRouter() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="booking/:id" element={<BookingPage />} />
        
        {/* Workshop Routes */}
        <Route path="workshops" element={<WorkshopsPage />} />
        <Route path="workshops/create" element={<WorkshopCreatePage />} />
        <Route path="workshops/:workshopId" element={<WorkshopDetailPage />} />
        <Route path="workshops/:workshopId/edit" element={<WorkshopEditPage />} />
        
        {/* Dashboard Routes */}
        <Route path="dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardHome />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="my-bookings" element={<DashboardProfile />} />
          <Route path="saved-events" element={<SavedEventsPage />} />
          <Route path="hosted-events" element={<HostedEventsPage />} />
          <Route path="hosted-events/:eventId" element={<HostedEventDetails />} />
          <Route path="calendar" element={<BookingCalendar />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="book-service" element={<BookingServicesPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/bookings" element={<AdminBookingsPage />} />
          <Route path="admin/services" element={<AdminServicesPage />} />
          
          {/* Workshop Routes in Dashboard */}
          <Route path="workshops" element={<WorkshopsPage />} />
          <Route path="workshops/create" element={<WorkshopCreatePage />} />
          <Route path="workshops/:workshopId" element={<WorkshopDetailPage />} />
          <Route path="workshops/:workshopId/edit" element={<WorkshopEditPage />} />
        </Route>
      </Route>
    )
  );
  
  return (
    <UserProvider>
      <EventProvider>
        <BookingProvider>
          <ServiceProvider>
            <CategoryProvider>
              <AnalyticsProvider>
                <PostProvider>
                  <WorkshopProvider>
                    <RouterProvider router={router} />
                  </WorkshopProvider>
                </PostProvider>
              </AnalyticsProvider>
            </CategoryProvider>
          </ServiceProvider>
        </BookingProvider>
      </EventProvider>
    </UserProvider>
  );
}

export default AppRouter;
