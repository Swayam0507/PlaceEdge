import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiTarget, FiUploadCloud, FiCpu, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { BiBuildingHouse } from "react-icons/bi";

const Onboarding = () => {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [track, setTrack] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to dashboard if onboarding is already complete
  React.useEffect(() => {
    if (user?.isOnboardingComplete) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleComplete = async () => {
    if (track === "company" && !targetCompany.trim()) {
      setError("Please enter a target company name.");
      return;
    }
    
    setLoading(true);
    setError("");
    setStep(3); // Loading step

    try {
      const formData = new FormData();
      formData.append("track", track);
      if (targetCompany) formData.append("targetCompany", targetCompany);
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await api.post("/profile/onboarding", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        updateUserContext(res.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Failed to complete onboarding.");
        setStep(2); // Go back if failed
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during onboarding.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 relative">
        
        {/* Loading Overlay State */}
        {step === 3 && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
              <FiCpu size={32} className="animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-black font-display text-slate-800 mb-2">Crafting your roadmap...</h2>
            <p className="text-slate-500 font-medium text-center max-w-sm">
              Our AI is analyzing {targetCompany}'s hiring patterns and cross-referencing your resume. This might take a few seconds.
            </p>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight mb-3">
            Welcome to PlaceEdge
          </h1>
          <p className="text-slate-500 font-medium">
            Let's personalize your placement journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Step 1: Track Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">What is your primary goal?</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setTrack("general")}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  track === "general" ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-100 hover:border-blue-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  track === "general" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <FiTarget size={24} />
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">General Placement</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  I want to master Data Structures, Algorithms, and Aptitude for any generic IT role.
                </p>
              </div>

              <div 
                onClick={() => setTrack("company")}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  track === "company" ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-100 hover:border-blue-200"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  track === "company" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <BiBuildingHouse size={24} />
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">Target a Company</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  I have a dream company in mind. Give me a custom roadmap to crack their specific interview.
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button 
                onClick={() => track === "company" ? setStep(2) : handleComplete()}
                disabled={!track}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {track === "general" ? "Complete Setup" : "Next Step"} <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Company Details */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Customize your roadmap</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Company</label>
                <input 
                  type="text" 
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google, Zomato, TCS" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Resume (Highly Recommended)</label>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Our AI will analyze your current skills and build a 30-day plan focusing on your missing skills for {targetCompany || "this company"}.
                </p>
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".pdf,.docx" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  {resumeFile ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                        <FiCheckCircle size={24} />
                      </div>
                      <p className="font-bold text-slate-800">{resumeFile.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Ready for AI analysis</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FiUploadCloud size={24} />
                      </div>
                      <p className="font-bold text-slate-700">Click or drag file here</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">PDF or DOCX up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-between items-center">
              <button 
                onClick={() => setStep(1)}
                className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={!targetCompany.trim()}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
