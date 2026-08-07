import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BRANCHES, SEMESTERS } from "../utils/helpers";

const Register = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
    semester: 1,
    cgpa: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (e) => {
    clearError();
    setLocalError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.name.trim().length < 2) return "Name must be at least 2 characters";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.password)) return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setLocalError(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError("");

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      branch: formData.branch,
      semester: Number(formData.semester),
      cgpa: formData.cgpa ? Number(formData.cgpa) : 0,
    });

    setSubmitting(false);
    if (result?.success) {
      navigate("/dashboard");
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-paper animate-fade-in">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12 text-paper relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-emerald/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="font-display font-bold text-5xl leading-tight mb-4 mt-8">Join PlaceEdge</h1>
          <p className="text-white/70 text-lg max-w-md">
            Start your journey towards your dream placement. Track progress, practice skills, and get AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 relative z-10 pt-8 mt-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">📊</div>
            <span className="font-semibold text-lg">AI-Powered Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🎯</div>
            <span className="font-semibold text-lg">Personalized Roadmap</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">📚</div>
            <span className="font-semibold text-lg">Curated Resources</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-display font-bold text-3xl text-ink mb-2">Create Account</h2>
            <p className="text-muted">Fill in your details to get started</p>
          </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex flex-col items-center gap-2 ${step >= 1 ? "text-ink" : "text-muted"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-ink text-paper" : "bg-gray-200 text-muted"}`}>1</div>
                <span className="text-xs font-semibold uppercase tracking-wider">Account</span>
              </div>
              <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 2 ? "bg-ink" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center gap-2 ${step >= 2 ? "text-ink" : "text-muted"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-ink text-paper" : "bg-gray-200 text-muted"}`}>2</div>
                <span className="text-xs font-semibold uppercase tracking-wider">Academic</span>
              </div>
            </div>

            {displayError && (
              <div className="bg-coral/10 border border-coral text-coral px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="font-medium text-sm">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-ink mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g. Aarav Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                      />
                    </div>
                  </div>

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
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-ink mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="w-full flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-bold shadow-sm hover:bg-ink-soft transition-colors mt-6"
                    onClick={handleNext}
                  >
                    Continue
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label htmlFor="branch" className="block text-sm font-bold text-ink mb-2">Branch / Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                      </div>
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none"
                      >
                        <option value="">Select your branch</option>
                        {BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="semester" className="block text-sm font-bold text-ink mb-2">Semester</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <select
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none"
                        >
                          {SEMESTERS.map((s) => (
                            <option key={s} value={s}>
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cgpa" className="block text-sm font-bold text-ink mb-2">CGPA</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          id="cgpa"
                          name="cgpa"
                          placeholder="0.0 - 10.0"
                          value={formData.cgpa}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          max="10"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <button
                      type="button"
                      className="w-1/3 flex justify-center items-center gap-2 bg-gray-100 text-ink py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-bold shadow-sm hover:bg-ink-soft transition-colors disabled:opacity-70"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 text-center text-sm text-muted">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-ink hover:underline">
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
