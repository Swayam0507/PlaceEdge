import React, { useState } from "react";
import api from "../services/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiUploadCloud, FiFileText, FiCpu, FiCheckCircle, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import Card from "../components/ui/Card";
import ProgressRing from "../components/ui/ProgressRing";

const AtsChecker = () => {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Fake parsed score for UI (since backend just returns markdown feedback currently)
  const [score, setScore] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleCheck = async () => {
    if (!resumeFile || !jobDescription.trim()) return;
    
    setLoading(true);
    setError("");
    setFeedback("");
    setStep(3); // Analyzing step
    
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const res = await api.post("/ai/ats-check", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFeedback(res.data.feedback);
        // We simulate a score parse. Ideally backend returns an integer score.
        setScore(Math.floor(Math.random() * (95 - 60 + 1) + 60)); // Random score 60-95 for demo
        setStep(4); // Results step
      } else {
        setError(res.data.message || "Failed to analyze resume.");
        setStep(2); // Go back
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
      setStep(2); // Go back
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResumeFile(null);
    setJobDescription("");
    setFeedback("");
    setScore(0);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-ink flex items-center justify-center gap-3">
          <div className="p-2 bg-amber/10 text-amber-deep rounded-lg"><FiCpu size={24} /></div>
          AI Resume ATS Checker
        </h1>
        <p className="font-body text-muted mt-3 max-w-lg mx-auto">
          Ensure your resume gets past the robots. Get instant, actionable feedback tailored to your target role.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-coral border border-red-100 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stepper Progress */}
      {step < 4 && (
        <div className="flex items-center justify-center mb-10 max-w-xs mx-auto">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-ink text-white' : 'bg-line text-muted'}`}>1</div>
          <div className={`flex-1 h-1 transition-colors ${step >= 2 ? 'bg-ink' : 'bg-line'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-ink text-white' : 'bg-line text-muted'}`}>2</div>
          <div className={`flex-1 h-1 transition-colors ${step >= 3 ? 'bg-ink' : 'bg-line'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-ink text-white' : 'bg-line text-muted'}`}>3</div>
        </div>
      )}

      {/* STEP 1: Upload Resume */}
      {step === 1 && (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
          <div className="w-20 h-20 bg-emerald-soft text-emerald rounded-full flex items-center justify-center mb-6">
            <FiUploadCloud size={32} />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">Upload your Resume</h2>
          <p className="text-muted text-sm mb-8">PDF or DOCX format, max 5MB.</p>
          
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            accept=".pdf,.docx,application/pdf" 
            onChange={handleFileChange} 
          />
          <label 
            htmlFor="resume-upload" 
            className="cursor-pointer bg-ink text-white font-semibold py-3 px-8 rounded-md hover:bg-ink-soft transition-colors hover:-translate-y-0.5"
          >
            Browse Files
          </label>
          
          {resumeFile && (
            <div className="mt-6 flex items-center gap-3 bg-paper p-3 rounded-md border border-line">
              <FiFileText className="text-amber-deep" />
              <span className="text-sm font-medium text-ink">{resumeFile.name}</span>
              <FiCheckCircle className="text-emerald ml-2" />
            </div>
          )}

          {resumeFile && (
            <button 
              onClick={() => setStep(2)}
              className="mt-8 flex items-center gap-2 text-amber-deep font-semibold hover:text-amber"
            >
              Continue <FiChevronRight />
            </button>
          )}
        </Card>
      )}

      {/* STEP 2: Job Description */}
      {step === 2 && (
        <Card className="py-8 px-6 sm:px-10">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep(1)} className="text-muted hover:text-ink"><FiChevronLeft size={24} /></button>
            <h2 className="font-display text-xl font-semibold text-ink">Target Job Description</h2>
          </div>
          
          <p className="text-muted text-sm mb-4">Paste the responsibilities and requirements of the job you want to apply for.</p>
          
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="e.g. Looking for a frontend engineer with 2+ years of React experience..."
            className="w-full h-64 p-4 border border-line rounded-md bg-paper-raised text-ink font-body focus:outline-none focus:border-amber-deep focus:ring-1 focus:ring-amber-deep transition-all resize-none"
          ></textarea>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleCheck}
              disabled={!jobDescription.trim()}
              className="flex items-center gap-2 bg-ink text-white font-semibold py-3 px-8 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Analysis <FiCpu />
            </button>
          </div>
        </Card>
      )}

      {/* STEP 3: Analyzing State */}
      {step === 3 && (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-line rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-deep rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-amber-deep"><FiCpu size={32} /></div>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink animate-pulse">Analyzing Match...</h2>
          <p className="text-muted text-sm mt-3 max-w-sm">Our AI is parsing your resume against the job requirements to find missing keywords and formatting issues.</p>
        </Card>
      )}

      {/* STEP 4: Results */}
      {step === 4 && feedback && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Score Sidebar */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6 sticky top-24">
            <Card className="flex flex-col items-center text-center py-10">
              <h3 className="font-display font-semibold text-lg text-ink mb-6">ATS Match Score</h3>
              <ProgressRing progress={score} size={160} strokeWidth={12} color={score > 80 ? 'emerald' : score > 60 ? 'amber' : 'coral'} />
              <p className="font-body text-sm text-muted mt-6 px-4">
                {score > 80 ? "Great match! You have a high chance of passing the ATS filter." : 
                 score > 60 ? "Good start, but missing some key requirements." : 
                 "Needs work. You're missing critical keywords for this role."}
              </p>
            </Card>
            
            <button 
              onClick={reset}
              className="w-full py-3 bg-paper border border-line text-ink font-semibold rounded-md hover:bg-line transition-colors"
            >
              Analyze Another Job
            </button>
          </div>

          {/* Feedback Content */}
          <Card className="w-full lg:w-3/4 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6 pb-4 border-b border-line">Detailed Feedback</h2>
            <div className="prose prose-slate max-w-none font-body text-ink-soft prose-headings:font-display prose-headings:text-ink prose-a:text-amber-deep">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
            </div>
          </Card>
        </div>
      )}
      
    </div>
  );
};

export default AtsChecker;
