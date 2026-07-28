import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardAnalytics } from "../services/api";
import { 
  CheckSquare, FileText, MessageSquare, Cpu, Award, 
  AlertCircle, MessageCircle, Target, Building2, ChevronRight, X, Trophy
} from "lucide-react";

// UI Primitives
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import ProgressRing from "../components/ui/ProgressRing";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import JourneyMap from "../components/ui/JourneyMap";
import FocusCard from "../components/ui/FocusCard";
import DriveCard from "../components/ui/DriveCard";

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
    
    // Use dynamic recommendation from backend if available
    const dynamicDesc = overview.focusRecommendation || "Continue your placement preparation.";
    
    // Prioritize weak areas if they exist
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
      case "aptitude":
        return { title: "Sharpen your aptitude skills", description: dynamicDesc, cta: "Take a Test", route: "/practice" };
      case "coding":
        return { title: "Level up your coding", description: dynamicDesc, cta: "Practice Coding", route: "/practice" };
      case "resume":
        return { title: "Your Resume needs a tune-up", description: dynamicDesc, cta: "Update Resume", route: "/career/resume" };
      case "interview":
        return { title: "Ace the mock interview", description: dynamicDesc, cta: "Start Interview Prep", route: "/practice/interview" };
      case "placed":
        return { title: "You're almost there! 🎉", description: dynamicDesc, cta: "View Jobs", route: "/career/jobs" };
      default:
        return { title: "Keep going!", description: dynamicDesc, cta: "Dashboard", route: "/dashboard" };
    }
  };

  const focusContent = getFocusContent();

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        
      {/* 1. Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="font-bold text-3xl tracking-tight text-slate-900 mb-1.5">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-[15px] text-slate-500 font-medium">
            {journeyProgress > 0
              ? `You're ${journeyProgress}% through your placement journey. Keep the momentum going.`
              : "Start your placement journey today. Take your first step!"}
          </p>
        </div>
        {analytics?.upcomingEvent && (
          <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-lg shadow-slate-200">
            <div className="font-mono text-3xl font-bold text-blue-400 leading-none">{analytics.upcomingEvent.daysLeft}</div>
            <div className="text-xs text-slate-400 leading-snug">
              days left for<br /><strong className="text-white font-semibold text-[13px]">{analytics.upcomingEvent.name}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Journey Map */}
      <JourneyMap journeyData={journeyData} />

      {/* 3. Focus Card */}
      <FocusCard 
        title={focusContent.title}
        description={focusContent.description}
        ctaText={focusContent.cta}
        onCtaClick={() => navigate(focusContent.route)}
        icon={<Target size={24} />}
      />

      {/* 4. Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="ATS Score" 
          value={atsScore}
          valueSuffix="/100"
          deltaText={atsScore < 70 ? "Needs improvement" : "Good to go"}
          deltaType={atsScore < 70 ? "negative" : "positive"}
          ringValue={atsScore}
          ringColor={atsScore < 70 ? "#ef4444" : "#10b981"}
        />
        <StatCard 
          label="Global Rank" 
          value={`#${globalRank}`}
          deltaText={`Out of ${totalUsersCount} students`}
          deltaType="neutral"
          onClick={() => setActiveStatModal('rank')}
        />
        <StatCard 
          label="Tests Taken" 
          value={overview?.totalTests || 0}
          deltaText={`avg. ${overview?.avgScore || 0}% score`}
          deltaType="neutral"
          onClick={() => setActiveStatModal('tests')}
        />
        <StatCard 
          label="Weak Topic" 
          value={<span className="text-[19px] leading-none mt-1 inline-block truncate max-w-[120px]">{weakestArea}</span>}
          deltaText="Focus practice here"
          deltaType="negative"
          onClick={() => setActiveStatModal('weak')}
        />
      </div>

      {/* 5. Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[22px] mb-6">
        {/* Left Column: Drives & Forum */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[19px] text-slate-900">Companies visiting soon</h2>
            <Link to="/career/jobs" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center">View all <ChevronRight size={14} /></Link>
          </div>
          
          {!analytics?.upcomingCompanies?.length ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm text-slate-500 text-[13px] mb-4">
              No upcoming drives scheduled.
            </div>
          ) : (
            analytics.upcomingCompanies.map((comp) => {
              // Extract initials for placeholder logo if actual logo fails
              const initials = comp.name.substring(0, 2).toUpperCase();
              // Try clearbit logo
              const domain = comp.name.toLowerCase().replace(/\s+/g, '') + '.com';
              
              return (
                <div key={comp._id} onClick={() => setSelectedCompany(comp)} className="block bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                      <img src={`https://logo.clearbit.com/${domain}`} alt={`${comp.name} Logo`} className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      <div className="w-full h-full items-center justify-center font-bold text-[15px] text-slate-400 hidden">{initials}</div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-[15px] font-bold mb-0.5 truncate text-slate-900 group-hover:text-blue-600 transition-colors">{comp.name}</h4>
                      <p className="text-[13px] text-slate-500 truncate">{comp.rolesStr} · {comp.type}</p>
                    </div>
                    <div className={`text-center px-3 py-1.5 rounded-lg font-mono font-bold text-[13px] shrink-0 ${comp.daysLeft <= 3 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {comp.daysLeft === 0 ? 'Today' : `${comp.daysLeft} days`}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Empty State Card */}
          <div className="bg-white border-[1.5px] border-dashed border-slate-200 rounded-2xl p-8 text-center mt-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} />
            </div>
            <h4 className="font-bold text-[16px] mb-2 text-slate-900">No doubts posted this week</h4>
            <p className="text-[14px] text-slate-500 mb-5">Stuck on something? The community usually replies within an hour.</p>
            <button 
              onClick={() => navigate('/community/forum')}
              className="border border-slate-200 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-[13px] hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            >
              Ask a doubt
            </button>
          </div>
        </div>

        {/* Right Column: Recent Tests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[19px] text-slate-900">Recent tests</h2>
            <Link to="/practice/history" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center">History <ChevronRight size={14} /></Link>
          </div>

          {!analytics?.recentAttempts?.length ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm text-slate-500 text-[13px]">
              No tests taken yet. Start practicing!
            </div>
          ) : (
            analytics.recentAttempts.slice(0, 3).map((test, i) => {
              const bgColors = ["bg-emerald-500", "bg-amber-500", "bg-blue-500"];
              const bgColor = bgColors[i % bgColors.length];
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 mb-3 shadow-sm hover:border-slate-300 transition-colors">
                  <div className={`w-[48px] h-[48px] rounded-full ${bgColor} flex items-center justify-center font-mono font-bold text-[14px] text-white shrink-0 shadow-sm`}>
                    {Math.round(test.percentage)}%
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[15px] font-bold mb-0.5 truncate capitalize text-slate-900">{test.category}</h4>
                    <p className="text-[12px] text-slate-500 font-medium">{new Date(test.date).toLocaleDateString()} · {test.totalQuestions} questions</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedCompany(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center shadow-sm">
                  <img 
                    src={`https://logo.clearbit.com/${selectedCompany.name.toLowerCase().replace(/\s+/g, '') + '.com'}`} 
                    alt={selectedCompany.name} 
                    className="w-full h-full object-contain p-2" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                  />
                  <div className="w-full h-full items-center justify-center font-bold text-xl text-slate-400 hidden">
                    {selectedCompany.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-2xl text-slate-900">{selectedCompany.name}</h2>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-1.5 text-sm">
                    <Building2 size={16} /> {selectedCompany.industry || "IT/Software"}
                    {selectedCompany.website && (
                      <>
                        <span className="text-slate-300">•</span>
                        <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Roles Offered</p>
                  <p className="font-semibold text-slate-900">{selectedCompany.rolesStr}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected CTC</p>
                  <p className="font-semibold text-slate-900">
                    {selectedCompany.package?.min ? `${selectedCompany.package.min} - ${selectedCompany.package.max} LPA` : "Not Disclosed"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Drive Date</p>
                  <p className="font-semibold text-slate-900">
                    {selectedCompany.visitDate ? new Date(selectedCompany.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBD"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Eligibility Criteria</p>
                  <p className="font-semibold text-slate-900">
                    CGPA: {selectedCompany.eligibility?.minCGPA || "N/A"}+ | Max Backlogs: {selectedCompany.eligibility?.maxBacklogs !== undefined ? selectedCompany.eligibility.maxBacklogs : "N/A"}
                  </p>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="mb-8">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">About the Company</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {selectedCompany.selectionProcess && selectedCompany.selectionProcess.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-3">Selection Process</h3>
                  <div className="space-y-3">
                    {selectedCompany.selectionProcess.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 text-sm font-medium pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setSelectedCompany(null);
                    navigate('/company-prep');
                  }}
                  className="px-6 py-2.5 rounded-full font-semibold text-sm bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-bold text-2xl mb-2 text-slate-900">Global Rank</h2>
             <p className="text-slate-500 text-sm mb-6">Your ranking is determined by your Placement Readiness score, which combines your aptitude, coding, and resume scores.</p>
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-5 mb-6 shadow-sm">
               <div className="text-4xl">
                 <Trophy size={40} className="text-amber-500" />
               </div>
               <div>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Standing</p>
                 <p className="text-3xl font-bold text-slate-900">#{globalRank} <span className="text-lg text-slate-400 font-normal">of {totalUsersCount}</span></p>
               </div>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed font-medium">Keep practicing mock tests, update your ATS resume, and participate in interview prep to improve your readiness score and climb the leaderboard!</p>
             <button onClick={() => setActiveStatModal(null)} className="w-full mt-8 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Tests Taken Modal */}
      {activeStatModal === 'tests' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="font-bold text-2xl mb-2 text-slate-900">Tests Taken</h2>
             <p className="text-slate-500 text-sm mb-6 font-medium">You have taken {overview?.totalTests || 0} tests with an average score of {overview?.avgScore || 0}%.</p>
             
             {analytics?.categoryPerformance?.length > 0 ? (
               <div className="space-y-3 mb-8">
                 {analytics.categoryPerformance.map((cat, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                     <span className="font-bold text-slate-800 capitalize">{cat.category}</span>
                     <div className="flex items-center gap-4">
                       <span className="text-xs text-slate-500 font-medium">{cat.totalAttempts} attempts</span>
                       <span className={`font-mono font-bold text-sm px-2 py-1 rounded ${cat.avgPercentage >= 70 ? 'bg-emerald-100 text-emerald-700' : cat.avgPercentage < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                         {cat.avgPercentage}%
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-100 mb-6">No tests taken yet.</div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors mb-3">Take a new Test</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Weak Topic Modal */}
      {activeStatModal === 'weak' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-bold text-2xl mb-2 text-slate-900">Weak Topics</h2>
             <p className="text-slate-500 text-sm mb-6 font-medium">Areas where your average score is below 50%. Focus your practice here.</p>
             
             {analytics?.weakAreas?.length > 0 ? (
               <div className="space-y-3 mb-8">
                 {analytics.weakAreas.map((topic, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                     <span className="font-bold text-red-700 capitalize">{topic.category}</span>
                     <span className="font-mono font-bold text-red-600">{topic.avgPercentage}% avg</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-center mb-8">
                 Great job! You have no weak areas currently.
               </div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors mb-3">Start Practicing</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
