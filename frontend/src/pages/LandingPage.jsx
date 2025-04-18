import { Link } from 'react-router-dom';
import MapSection from '../components/MapSection';
import { useServices } from '../context/ServiceContext';
import { useEffect } from 'react';
import { FaGraduationCap, FaTools, FaChalkboardTeacher } from 'react-icons/fa';

function LandingPage() {
  const { services, loading, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-neutral text-neutral-content relative">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}></div>
        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Maker.io</h1>
            <p className="py-6">Where Creativity Meets Innovation!

Unleash your imagination and bring your ideas to life in our state-of-the-art makerspace fablab! Whether you're an artist, inventor, student, or entrepreneur, our space is designed to empower creators of all levels to explore, design, and fabricate.
            </p>
            <Link to="/register" className="btn btn-accent text-accent-content">Get Started</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">Why Choose Maker.io?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-neutral text-neutral-content shadow-xl overflow-hidden">
              <figure className="h-48">
                <img src="/images/community.jpg" alt="Community" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <h3 className="card-title">Community</h3>
                <p>Our platform gives you everything you need in one place. No extra tools required. Designed for community leaders, it's your go-to platform for coaching, courses, and connection.</p>
              </div>
            </div>
            <div className="card bg-neutral text-neutral-content shadow-xl overflow-hidden">
              <figure className="h-48">
                <img src="/images/courses.jpg" alt="Real-time Courses" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <h3 className="card-title">Workshops & Events</h3>
                <p>Learn new skills and stay ahead of the curve with our hands-on workshops and inspiring community events.</p>
              </div>
            </div>
            <div className="card bg-neutral text-neutral-content shadow-xl overflow-hidden">
              <figure className="h-48">
                <img src="/images/monetization.jpg" alt="Monetize Your Skills" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <h3 className="card-title">Monetize Your Skills</h3>
                <p>Make data-driven decisions with our comprehensive analytics and reporting tools.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-neutral text-neutral-content">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <p className="text-center mb-12">From 3D printers and laser cutters to CNC machines and electronics workstations – we have everything you need to bring your projects to life.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card bg-base-100 text-base-content shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <figure className="h-48">
                <img src="/images/learning-paths.jpg" alt="Learning Paths" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body items-center text-center">
                <FaGraduationCap className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">Learning Paths</h3>
                <p>Structured courses and learning paths to help you master new skills at your own pace.</p>
              </div>
            </div>
            <div className="card bg-base-100 text-base-content shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <figure className="h-48">
                <img src="/images/workshops.jpg" alt="Hands-on Workshops" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body items-center text-center">
                <FaTools className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">Hands-on Workshops</h3>
                <p>Interactive workshops where you can learn by doing and get real-time feedback.</p>
              </div>
            </div>
            <div className="card bg-base-100 text-base-content shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <figure className="h-48">
                <img src="/images/mentoring.jpg" alt="Expert Mentoring" className="w-full h-full object-cover" />
              </figure>
              <div className="card-body items-center text-center">
                <FaChalkboardTeacher className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">Expert Mentoring</h3>
                <p>One-on-one mentoring sessions with industry experts to accelerate your growth.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link 
              to="/services" 
              className="btn btn-primary btn-lg gap-2"
            >
              View All Services
              {loading && <span className="loading loading-spinner loading-sm"></span>}
              {!loading && <span className="badge badge-accent">{services.length}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <MapSection />
    </div>
  );
}

export default LandingPage;
