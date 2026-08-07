import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setSubmitting(false);
    if (result?.success) {
      // Redirect based on role: admin → admin panel, student → student dashboard
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-paper animate-fade-in">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12 text-paper relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-emerald/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="font-display font-bold text-5xl leading-tight mb-4 mt-8">Welcome Back</h1>
          <p className="text-white/70 text-lg max-w-md">
            Continue your placement preparation journey. Your progress is waiting for you.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-10 border-t border-white/10 pt-8 mt-12">
          <div>
            <span className="block font-display font-bold text-3xl mb-1">10K+</span>
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Students</span>
          </div>
          <div>
            <span className="block font-display font-bold text-3xl mb-1">500+</span>
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Companies</span>
          </div>
          <div>
            <span className="block font-display font-bold text-3xl text-emerald mb-1">95%</span>
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">Success Rate</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-display font-bold text-3xl text-ink mb-2">Sign In</h2>
            <p className="text-muted">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-coral/10 border border-coral text-coral px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-ink mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="aarav.sharma@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-ink mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                />
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-sm font-semibold text-emerald hover:text-emerald-deep transition-colors">Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-bold shadow-sm hover:bg-ink-soft transition-colors disabled:opacity-70 mt-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-ink hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
