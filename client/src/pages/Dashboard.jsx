import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardAnalytics } from "../services/api";
import { 
  CheckSquare, FileText, MessageSquare, Cpu, Award, 
  AlertCircle, MessageCircle, Target, Building2, ChevronRight, X, Trophy,
  ArrowRight, Sparkles, TrendingUp
} from "lucide-react";
import JourneyMap from "../components/ui/JourneyMap";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeStatModal, setActiveStatModal] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await getDashboardAnalytics();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      // Analytics may fail if no data yet
    } finally {
      setLoading(false);
    }
  };

  const overview = analytics?.overview || {};
  const hasData = analytics && overview.totalTests > 0;
  
  // Calculate weakest topic
  let weakestArea = analytics?.weakAreas?.[0]?.category || "General Aptitude";
  if (weakestArea) {
    const rawCategory = weakestArea.toLowerCase();
    weakestArea = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
    if (rawCategory === 'mixed') weakestArea = 'Mixed Tests';
  }
  const atsScore = overview.latestResume?.atsScore || 0;
  const globalRank = overview.globalRank || 0;
  const totalUsersCount = overview.totalUsers || 0;

  // Journey data from backend
  const journeyData = analytics?.journeyStages || null;
  const journeyProgress = journeyData?.overallProgress || 0;
  const currentStage = journeyData?.stages?.[journeyData?.currentStageIndex] || null;

  // Time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  };

  const getFocusContent = () => {
    if (!currentStage) return { title: "Start your journey", description: "Take your first aptitude test to begin.", cta: "Practice Now", route: "/practice" };
    
    const dynamicDesc = overview.focusRecommendation || "Continue your placement preparation.";
    
    if (analytics?.weakAreas?.length > 0) {
      const rawCategory = analytics.weakAreas[0].category.toLowerCase();
      let displayCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      
      if (rawCategory === 'mixed') displayCategory = 'Mixed Mock Tests';
      else if (rawCategory === 'technical') displayCategory = 'Technical Skills';
      else if (rawCategory === 'quantitative') displayCategory = 'Quantitative Aptitude';
      else if (rawCategory === 'logical') displayCategory = 'Logical Reasoning';
      else if (rawCategory === 'verbal') displayCategory = 'Verbal Ability';

      return { 
        title: `Work on your ${displayCategory}`, 
        description: "Focus on practicing this area to improve your overall readiness score.", 
        cta: "Start Practice", 
        route: "/practice" 
      };
    }
    
    switch (currentStage.key) {
      case "aptitude": return { title: "Sharpen your aptitude skills", description: dynamicDesc, cta: "Take a Test", route: "/practice" };
      case "coding": return { title: "Level up your coding", description: dynamicDesc, cta: "Practice Coding", route: "/practice" };
      case "resume": return { title: "Your Resume needs a tune-up", description: dynamicDesc, cta: "Update Resume", route: "/career/resume" };
      case "interview": return { title: "Ace the mock interview", description: dynamicDesc, cta: "Start Prep", route: "/practice/interview" };
      case "placed": return { title: "You're almost there! 🎉", description: dynamicDesc, cta: "View Jobs", route: "/career/jobs" };
      default: return { title: "Keep going!", description: dynamicDesc, cta: "Dashboard", route: "/dashboard" };
    }
  };

  const focusContent = getFocusContent();

  const renderRing = (val, color) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((val || 0) / 100) * circumference;

    return (
      <div className="relative w-16 h-16 shrink-0">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="#e2e8f0" strokeWidth="5" fill="none" />
          <circle 
            cx="32" cy="32" r={radius} 
            stroke={color} strokeWidth="5" fill="none" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-black text-slate-800">
          {val}%
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-12 font-body">
        
        {/* 1. Hero Welcome Banner */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Sparkles size={14} className="text-blue-300" /> placement journey
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-3">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{user?.name?.split(" ")[0] || "Student"}</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              {journeyProgress > 0
                ? `You're ${journeyProgress}% through your placement journey. Keep the momentum going.`
                : "Start your placement journey today. Take your first step!"}
            </p>
          </div>
          
          {analytics?.upcomingEvent && (
            <div className="relative z-10 flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-5 rounded-3xl shadow-xl hover:bg-white/15 transition-colors cursor-default">
              <div className="font-display text-5xl font-black text-blue-300 drop-shadow-md">{analytics.upcomingEvent.daysLeft}</div>
              <div className="text-sm text-slate-300 font-medium leading-snug">
                days left for<br /><strong className="text-white font-bold text-base tracking-wide">{analytics.upcomingEvent.name}</strong>
              </div>
            </div>
          )}
        </div>

        {/* 2. Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Focus Card (Spans 2 columns) */}
          <div className="md:col-span-2 xl:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/10 flex flex-col justify-between group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/30 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-[12px] tracking-wider uppercase text-blue-200 font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                Today's Focus
              </div>
              <h3 className="font-display font-black text-3xl mb-3 tracking-tight">{focusContent.title}</h3>
              <p className="text-[15px] text-blue-100 max-w-md leading-relaxed font-medium mb-8">{focusContent.description}</p>
            </div>
            
            <button
              onClick={() => navigate(focusContent.route)}
              className="relative z-10 self-start bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold text-[14px] flex items-center gap-2 transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg"
            >
              {focusContent.cta} <ArrowRight size={18} />
            </button>
          </div>

          {/* Journey Map (Spans 2 columns) */}
          <div className="md:col-span-2 xl:col-span-2 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 -m-6 scale-[0.9] origin-top-left w-[110%]">
               {/* Note: In a real app we'd rewrite JourneyMap entirely, but to reuse it, we just scale it to fit the bento cell nicely */}
               <JourneyMap journeyData={journeyData} />
            </div>
          </div>

          {/* Stat Cards Row */}
          <div onClick={() => setActiveStatModal('tests')} className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={22} strokeWidth={2.5} />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Tests</div>
            </div>
            <div>
              <h4 className="font-display font-black text-4xl text-slate-800 tracking-tight">{overview?.totalTests || 0}</h4>
              <p className="text-sm font-semibold text-slate-500 mt-1">avg. {overview?.avgScore || 0}% score</p>
            </div>
          </div>

          <div onClick={() => setActiveStatModal('rank')} className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy size={22} strokeWidth={2.5} />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Rank</div>
            </div>
            <div>
              <h4 className="font-display font-black text-4xl text-slate-800 tracking-tight">#{globalRank}</h4>
              <p className="text-sm font-semibold text-slate-500 mt-1">out of {totalUsersCount} students</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Target size={22} strokeWidth={2.5} />
              </div>
              {renderRing(atsScore, atsScore < 70 ? "#ef4444" : "#10b981")}
            </div>
            <div>
              <h4 className="font-display font-black text-2xl text-slate-800 tracking-tight leading-none mb-1">ATS Score</h4>
              <p className={`text-sm font-semibold ${atsScore < 70 ? "text-red-500" : "text-emerald-500"}`}>{atsScore < 70 ? "Needs improvement" : "Good to go"}</p>
            </div>
          </div>

          <div onClick={() => setActiveStatModal('weak')} className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={22} strokeWidth={2.5} className="rotate-180" />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Weak Topic</div>
            </div>
            <div>
              <h4 className="font-display font-black text-2xl text-slate-800 tracking-tight truncate pr-2">{weakestArea}</h4>
              <p className="text-sm font-semibold text-rose-500 mt-1">Focus practice here</p>
            </div>
          </div>

        </div>

        {/* 3. Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Left Column: Drives & Forum */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-black text-2xl text-slate-800">Companies visiting soon</h2>
              <Link to="/career/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-4 py-2 rounded-xl transition-colors">View all <ChevronRight size={16} /></Link>
            </div>
            
            {!analytics?.upcomingCompanies?.length ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-medium">
                No upcoming drives scheduled.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.upcomingCompanies.map((comp) => {
                  const initials = comp.name.substring(0, 2).toUpperCase();
                  const domain = comp.name.toLowerCase().replace(/\s+/g, '') + '.com';
                  
                  return (
                    <div key={comp._id} onClick={() => setSelectedCompany(comp)} className="block bg-slate-50 border border-slate-100 rounded-2xl p-5 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md cursor-pointer group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl border border-slate-200/60 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <img src={`https://logo.clearbit.com/${domain}`} alt={`${comp.name} Logo`} className="w-full h-full object-contain p-2" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          <div className="w-full h-full items-center justify-center font-black text-slate-400 hidden">{initials}</div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-lg font-bold mb-1 truncate text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight">{comp.name}</h4>
                          <p className="text-sm text-slate-500 font-medium truncate">{comp.rolesStr} · {comp.type}</p>
                        </div>
                        <div className={`text-center px-4 py-2 rounded-xl font-mono font-bold text-sm shrink-0 shadow-sm ${comp.daysLeft <= 3 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {comp.daysLeft === 0 ? 'Today' : `${comp.daysLeft} days`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Recent Tests */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-black text-2xl text-slate-800">Recent tests</h2>
              <Link to="/practice/history" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"><ChevronRight size={18} strokeWidth={3} /></Link>
            </div>

            {!analytics?.recentAttempts?.length ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-medium">
                No tests taken yet. Start practicing!
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentAttempts.slice(0, 4).map((test, i) => {
                  const bgColors = ["bg-emerald-500", "bg-amber-500", "bg-indigo-500", "bg-rose-500"];
                  const bgColor = bgColors[i % bgColors.length];
                  return (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-slate-300 transition-colors group cursor-pointer">
                      <div className={`w-[52px] h-[52px] rounded-2xl ${bgColor} flex items-center justify-center font-display font-black text-[15px] text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                        {Math.round(test.percentage)}%
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-[15px] font-bold mb-0.5 truncate capitalize text-slate-900">{test.category}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{new Date(test.date).toLocaleDateString()} · {test.totalQuestions} qs</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* CTA for Doubt */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 text-center mt-6">
              <h4 className="font-bold text-[15px] mb-1.5 text-indigo-900 tracking-tight">Got a doubt?</h4>
              <p className="text-xs text-indigo-700/70 font-semibold mb-4">The community usually replies in 1 hour.</p>
              <button 
                onClick={() => navigate('/community/forum')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 hover:shadow-md transition-all shadow-sm w-full"
              >
                Ask in Forum
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain structurally similar but enhanced */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedCompany(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <div className="p-8 md:p-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-[1.5rem] border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-md">
                  <img 
                    src={`https://logo.clearbit.com/${selectedCompany.name.toLowerCase().replace(/\s+/g, '') + '.com'}`} 
                    alt={selectedCompany.name} 
                    className="w-full h-full object-contain p-3" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                  />
                  <div className="w-full h-full items-center justify-center font-black text-2xl text-slate-400 hidden">
                    {selectedCompany.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="font-display font-black text-3xl text-slate-900 tracking-tight">{selectedCompany.name}</h2>
                  <p className="text-slate-500 font-bold flex items-center gap-2 mt-2 text-sm">
                    <Building2 size={18} className="text-indigo-400" /> {selectedCompany.industry || "IT/Software"}
                    {selectedCompany.website && (
                      <>
                        <span className="text-slate-300">•</span>
                        <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          Visit Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roles Offered</p>
                  <p className="font-bold text-slate-800">{selectedCompany.rolesStr}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expected CTC</p>
                  <p className="font-bold text-slate-800">
                    {selectedCompany.package?.min ? `${selectedCompany.package.min} - ${selectedCompany.package.max} LPA` : "Not Disclosed"}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Drive Date</p>
                  <p className="font-bold text-slate-800">
                    {selectedCompany.visitDate ? new Date(selectedCompany.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBD"}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eligibility Criteria</p>
                  <p className="font-bold text-slate-800">
                    CGPA: {selectedCompany.eligibility?.minCGPA || "N/A"}+ | Max Backlogs: {selectedCompany.eligibility?.maxBacklogs !== undefined ? selectedCompany.eligibility.maxBacklogs : "N/A"}
                  </p>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="mb-8">
                  <h3 className="font-bold text-xl text-slate-900 mb-3 tracking-tight">About the Company</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {selectedCompany.selectionProcess && selectedCompany.selectionProcess.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-xl text-slate-900 mb-4 tracking-tight">Selection Process</h3>
                  <div className="space-y-4">
                    {selectedCompany.selectionProcess.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-sm mt-0.5 shadow-inner">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 text-[15px] font-bold pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-8 border-t border-slate-100 flex justify-end gap-4 mt-4">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="px-8 py-3 rounded-2xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setSelectedCompany(null);
                    navigate('/company-prep');
                  }}
                  className="px-8 py-3 rounded-2xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all"
                >
                  Start Preparation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Rank Modal */}
      {activeStatModal === 'rank' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-100 rounded-[2rem] w-full max-w-md p-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-black text-3xl mb-3 text-slate-900 tracking-tight">Global Rank</h2>
             <p className="text-slate-500 text-[15px] mb-8 font-medium">Your ranking is determined by your Placement Readiness score, which combines your aptitude, coding, and resume scores.</p>
             <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-8 flex items-center gap-6 mb-8 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl"></div>
               <div className="text-5xl relative z-10">
                 <Trophy size={48} className="text-amber-500 drop-shadow-md" strokeWidth={1.5} />
               </div>
               <div className="relative z-10">
                 <p className="text-[11px] font-bold text-amber-700/60 uppercase tracking-wider mb-1">Current Standing</p>
                 <p className="text-4xl font-black text-slate-900 tracking-tight">#{globalRank} <span className="text-xl text-slate-400 font-bold tracking-normal">of {totalUsersCount}</span></p>
               </div>
             </div>
             <p className="text-[15px] text-slate-600 leading-relaxed font-semibold mb-8">Keep practicing mock tests, update your ATS resume, and participate in interview prep to improve your readiness score and climb the leaderboard!</p>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Tests Taken Modal */}
      {activeStatModal === 'tests' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-100 rounded-[2rem] w-full max-w-md p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-black text-3xl mb-3 text-slate-900 tracking-tight">Tests Taken</h2>
             <p className="text-slate-500 text-[15px] mb-8 font-medium">You have taken {overview?.totalTests || 0} tests with an average score of {overview?.avgScore || 0}%.</p>
             
             {analytics?.categoryPerformance?.length > 0 ? (
               <div className="space-y-4 mb-10">
                 {analytics.categoryPerformance.map((cat, i) => (
                   <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                     <span className="font-bold text-slate-800 capitalize text-lg tracking-tight">{cat.category}</span>
                     <div className="flex items-center gap-5">
                       <span className="text-sm text-slate-500 font-bold">{cat.totalAttempts} attempts</span>
                       <span className={`font-display font-black text-lg px-3 py-1.5 rounded-xl shadow-inner ${cat.avgPercentage >= 70 ? 'bg-emerald-100 text-emerald-700' : cat.avgPercentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                         {cat.avgPercentage}%
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-12 text-center text-slate-400 font-semibold bg-slate-50 rounded-3xl border border-slate-100 mb-10 text-lg">No tests taken yet.</div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-4 rounded-2xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all mb-4">Take a new Test</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Weak Topic Modal */}
      {activeStatModal === 'weak' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-100 rounded-[2rem] w-full max-w-md p-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-black text-3xl mb-3 text-slate-900 tracking-tight">Weak Topics</h2>
             <p className="text-slate-500 text-[15px] mb-8 font-medium">Areas where your average score is below 50%. Focus your practice here.</p>
             
             {analytics?.weakAreas?.length > 0 ? (
               <div className="space-y-4 mb-10">
                 {analytics.weakAreas.map((topic, i) => (
                   <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-rose-100 bg-rose-50/50">
                     <span className="font-bold text-rose-700 capitalize text-lg tracking-tight">{topic.category}</span>
                     <span className="font-display font-black text-rose-600 text-xl">{topic.avgPercentage}% avg</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 rounded-3xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-bold text-center mb-10 text-lg shadow-inner">
                 Great job! You have no weak areas currently.
               </div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-4 rounded-2xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all mb-4">Start Practicing</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
