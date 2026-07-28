import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FiBriefcase, FiMapPin, FiClock, FiExternalLink, FiBarChart2, FiSearch } from "react-icons/fi";
import { BiBuildingHouse } from "react-icons/bi";
import SkillGapAnalyzer from "../components/SkillGapAnalyzer";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzingJobId, setAnalyzingJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("Full Stack Developer");

  const suggestionPills = [
    "Full Stack Developer",
    "Data Scientist",
    "ML Engineer",
    "Backend Developer",
    "Frontend Developer"
  ];

  useEffect(() => {
    fetchJobs(activeQuery);
  }, []);

  const fetchJobs = async (query) => {
    setLoading(true);
    setError("");
    setActiveQuery(query);
    try {
      const res = await api.get(`/jobBoard?search=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setJobs(res.data.data);
      } else if (res.data.message === "API_KEY_MISSING") {
        setError("API_KEY_MISSING");
      } else {
        setError(res.data.message || "Failed to load jobs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching off-campus jobs. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchJobs(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-paper p-6 md:p-10 font-sans animate-fade-in">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink md:text-5xl flex items-center justify-center gap-3 font-display">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber-deep">
              <FiBriefcase className="h-7 w-7" />
            </div>
            Job <span className="text-amber-deep">Search</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted font-body">
            Find live job opportunities matching your career path.
          </p>
        </div>

        {/* Search Bar & Pills */}
        <div className="mb-12 flex flex-col items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl flex gap-3 mb-6">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <FiSearch className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search job role... (e.g., Full Stack Developer)"
                className="h-16 w-full rounded-2xl border-2 border-slate-200 bg-white pl-14 pr-4 text-lg text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:shadow-indigo-300"
            >
              Search
            </button>
          </form>

          {/* Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mr-2">Popular:</span>
            {suggestionPills.map((pill) => (
              <button
                key={pill}
                onClick={() => {
                  setSearchTerm(pill);
                  fetchJobs(pill);
                }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeQuery === pill
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Showing results for <span className="text-indigo-600">"{activeQuery}"</span></h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{jobs.length} jobs found</span>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live from Remotive
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-lg font-medium text-slate-600">Searching live jobs in India...</p>
          </div>
        ) : error === "API_KEY_MISSING" ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <FiBriefcase className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">RapidAPI Key Required</h3>
            <p className="text-slate-700 mb-6">
              To fetch authentic Indian jobs with company logos, we've upgraded to the premium <strong>JSearch API</strong> on RapidAPI.
            </p>
            <div className="text-left bg-white p-4 rounded-xl border border-amber-100 text-sm text-slate-600 mb-6">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Go to <a href="https://rapidapi.com/letscrape-6bRBa3Q3OEd/api/jsearch" target="_blank" className="text-indigo-600 font-bold hover:underline">JSearch on RapidAPI</a></li>
                <li>Sign up / Log in and subscribe to the Basic (Free) plan.</li>
                <li>Copy your <strong>X-RapidAPI-Key</strong>.</li>
                <li>Open <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500">server/.env</code> and set <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">RAPIDAPI_KEY="your_key"</code>.</li>
                <li>Restart the server.</li>
              </ol>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
                <FiBriefcase className="mb-4 h-16 w-16 text-slate-300" />
                <p className="text-xl font-medium text-slate-500">No jobs found matching "{activeQuery}"</p>
              </div>
            ) : (
              jobs.map((job, idx) => {
                let domain = "";
                try {
                  if (job.url) {
                    const urlObj = new URL(job.url);
                    domain = urlObj.hostname.replace('www.', '');
                  }
                } catch(e) {}

                return (
                  <div 
                    key={idx} 
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 shadow-sm overflow-hidden p-1">
                          {job.company_logo ? (
                            <img src={job.company_logo} alt={job.company_name} className="h-full w-full object-contain" />
                          ) : domain ? (
                            <img 
                              src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`} 
                              alt={`${job.company_name} logo`} 
                              className="h-10 w-10 object-contain"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = `https://ui-avatars.com/api/?name=${job.company_name}&background=e0e7ff&color=4f46e5&rounded=true`;
                              }}
                            />
                          ) : (
                            <BiBuildingHouse className="h-8 w-8 text-slate-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-md font-medium text-slate-700">
                            {job.company_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
                          <FiMapPin className="text-indigo-500" /> 
                          <span className="line-clamp-1 max-w-[200px]">{job.location || 'Remote'}</span>
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium capitalize">
                          <FiClock className="text-violet-500" /> 
                          {job.job_types?.[0]?.replace('_', ' ') || 'Full Time'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      {/* Skill Gap Analyzer Injection */}
                      {analyzingJobId === idx && (
                        <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 animate-in slide-in-from-top-4 duration-300">
                          <SkillGapAnalyzer 
                            requiredSkills={["React", "Node.js", "MongoDB", "Express", "TypeScript"]} 
                            userSkills={["React", "HTML", "CSS", "JavaScript"]}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setAnalyzingJobId(analyzingJobId === idx ? null : idx)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                            analyzingJobId === idx 
                              ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                              : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <FiBarChart2 className="h-4 w-4" /> 
                          {analyzingJobId === idx ? 'Close' : 'Analyze Skills'}
                        </button>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-indigo-200"
                        >
                          Apply Now <FiExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
