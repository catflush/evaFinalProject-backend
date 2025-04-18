import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { WiAlien } from "react-icons/wi";
import { useUser } from "../context/useUser";

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useUser();
  const [{ firstName, lastName, email, password, confirmPassword, phone }, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: ""
    });
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Move navigation logic to useEffect
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!firstName || !lastName || !email || !password || !confirmPassword)
        throw new Error("All fields are required");
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");
      if (!agreeToTerms)
        throw new Error("You must agree to the Terms and Privacy Policy");
        
      setLoading(true);
      
      // Use the register function from UserContext
      const userData = await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone: phone || null
      });
      
      // Show success message
      toast.success("Registration successful! Redirecting to dashboard...");
      
      // Redirect to dashboard with user data
      navigate("/dashboard", { 
        state: { 
          user: userData,
          fromRegister: true 
        } 
      });
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-2">
              <WiAlien className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Maker.io</span>
            </div>
            <h2 className="text-3xl font-bold text-center">Create Your Account</h2>
            <h3 className="text-center text-base-content/70 mt-2"> Whether your passion is baking, DIY, or coding, Maker.io has the tools to turn your individual expertise into engaging courses. From live sessions and Q&As to personalized coaching, everything you need is right at your fingertips - no matter your niche. Join our community of makers and creators</h3>
            <p className="text-center text-base-content/70 mt-2">
            Connect with like-minded creators, share knowledge, and collaborate on exciting projects in a vibrant and inclusive community.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="John"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  name="email"
                  value={email}
                  onChange={handleChange}
                  type="email"
                  className="grow"
                  placeholder="your@email.com"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                  <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 6.38 2H3.5ZM4 3.5a.5.5 0 0 1 .5-.5h2.878a1.5 1.5 0 0 1 1.06.44l6.5 6.5a1.5 1.5 0 0 1 0 2.12l-2.878 2.878a1.5 1.5 0 0 1-2.12 0l-6.5-6.5A1.5 1.5 0 0 1 4 6.38V3.5Z" />
                </svg>
                <input
                  name="phone"
                  value={phone}
                  onChange={handleChange}
                  type="tel"
                  className="grow"
                  placeholder="Enter your phone number"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                  <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                </svg>
                <input
                  name="password"
                  value={password}
                  onChange={handleChange}
                  type="password"
                  className="grow"
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                  <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                </svg>
                <input
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  type="password"
                  className="grow"
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">I agree to the <Link to="/terms" className="link link-primary">Terms</Link> and <Link to="/privacy" className="link link-primary">Privacy Policy</Link></span>
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary checkbox-sm" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
              </label>
            </div>

            <div className="form-control mt-6">
              <button 
                className="btn btn-primary w-full" 
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
          
          <div className="divider">OR</div>
          
          <div className="text-center mt-2">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
