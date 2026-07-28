import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardAnalytics } from "../services/api";
import { FiCheckSquare, FiFileText, FiMessageSquare, FiCpu, FiAward, FiAlertCircle, FiMessageCircle } from "react-icons/fi";
import { BiTargetLock, BiBuildingHouse } from "react-icons/bi";

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
          <h1 className="font-display font-medium text-[32px] tracking-[-0.01em] text-ink mb-1.5">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="font-body text-[15px] text-ink-soft">
            {journeyProgress > 0
              ? `You're ${journeyProgress}% through your placement journey. Keep the momentum going.`
              : "Start your placement journey today. Take your first step!"}
          </p>
        </div>
        {analytics?.upcomingEvent && (
          <div className="flex items-center gap-3 bg-ink text-paper px-5 py-3 rounded-2xl shadow-card">
            <div className="font-mono text-3xl font-bold text-amber leading-none">{analytics.upcomingEvent.daysLeft}</div>
            <div className="text-xs text-[#B8C2DB] leading-snug">
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
        icon={<FiFileText size={24} />}
      />

      {/* 4. Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5 mb-6">
        <StatCard 
          label="ATS Score" 
          value={atsScore}
          valueSuffix="/100"
          deltaText={atsScore < 70 ? "Needs improvement" : "Good to go"}
          deltaType={atsScore < 70 ? "negative" : "positive"}
          ringValue={atsScore}
          ringColor={atsScore < 70 ? "#E8654F" : "#2F8F6E"}
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
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-display font-semibold text-[19px]">Companies visiting soon</h2>
            <Link to="/career/jobs" className="text-[13px] font-semibold text-ink-soft hover:underline">View all →</Link>
          </div>
          
          {!analytics?.upcomingCompanies?.length ? (
            <div className="bg-paper-raised border border-line rounded-xl p-6 text-center shadow-card text-muted text-[13px] mb-3">
              No upcoming drives scheduled.
            </div>
          ) : (
            analytics.upcomingCompanies.map((comp) => {
              // Extract initials for placeholder logo if actual logo fails
              const initials = comp.name.substring(0, 2).toUpperCase();
              // Try clearbit logo
              const domain = comp.name.toLowerCase().replace(/\s+/g, '') + '.com';
              
              return (
                <div key={comp._id} onClick={() => setSelectedCompany(comp)} className="block bg-paper-raised border border-line rounded-xl p-4 mb-3 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl border border-line overflow-hidden bg-white shrink-0 flex items-center justify-center">
                      <img src={`https://logo.clearbit.com/${domain}`} alt={`${comp.name} Logo`} className="w-full h-full object-contain p-1.5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      <div className="w-full h-full items-center justify-center font-display font-bold text-[15px] text-ink-soft hidden">{initials}</div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-[14.5px] font-bold mb-0.5 truncate text-ink">{comp.name}</h4>
                      <p className="text-[12px] text-muted truncate">{comp.rolesStr} · {comp.type}</p>
                    </div>
                    <div className={`text-center px-3 py-1.5 rounded-[10px] font-mono font-bold text-[13px] shrink-0 ${comp.daysLeft <= 3 ? 'bg-[#FDE9E5] text-coral' : 'bg-emerald-soft text-emerald'}`}>
                      {comp.daysLeft === 0 ? 'Today' : `${comp.daysLeft} days`}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Empty State Card */}
          <div className="bg-paper-raised border-[1.5px] border-dashed border-line rounded-xl p-7 text-center mt-1.5">
            <div className="text-[30px] mb-2">💬</div>
            <h4 className="font-display text-[16px] mb-1 font-semibold">No doubts posted this week</h4>
            <p className="text-[13px] text-muted mb-3.5">Stuck on something? The community usually replies within an hour.</p>
            <button 
              onClick={() => navigate('/community/forum')}
              className="border-[1.5px] border-ink bg-transparent text-ink px-4.5 py-2.5 rounded-[10px] font-bold text-[13px] hover:bg-ink hover:text-white transition-colors"
            >
              Ask a doubt
            </button>
          </div>
        </div>

        {/* Right Column: Recent Tests */}
        <div>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-display font-semibold text-[19px]">Recent tests</h2>
            <Link to="/practice/history" className="text-[13px] font-semibold text-ink-soft hover:underline">History →</Link>
          </div>

          {!analytics?.recentAttempts?.length ? (
            <div className="bg-paper-raised border border-line rounded-xl p-6 text-center shadow-card text-muted text-[13px]">
              No tests taken yet. Start practicing!
            </div>
          ) : (
            analytics.recentAttempts.slice(0, 3).map((test, i) => {
              const bgColors = ["bg-[#2F8F6E]", "bg-[#E8962C]", "bg-[#E8654F]"];
              const bgColor = bgColors[i % bgColors.length];
              return (
                <div key={i} className="bg-paper-raised border border-line rounded-xl p-4 flex items-center gap-3.5 mb-3 shadow-card">
                  <div className={`w-[46px] h-[46px] rounded-full ${bgColor} flex items-center justify-center font-mono font-bold text-[13px] text-white shrink-0`}>
                    {Math.round(test.percentage)}%
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[14px] font-bold mb-0.5 truncate capitalize">{test.category}</h4>
                    <p className="text-[11.5px] text-muted">{new Date(test.date).toLocaleDateString()} · {test.totalQuestions} questions</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedCompany(null)}>
          <div className="bg-paper border border-line rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-ink-soft hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl border border-line overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                  <img 
                    src={`https://logo.clearbit.com/${selectedCompany.name.toLowerCase().replace(/\s+/g, '') + '.com'}`} 
                    alt={selectedCompany.name} 
                    className="w-full h-full object-contain p-2" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                  />
                  <div className="w-full h-full items-center justify-center font-display font-bold text-xl text-ink-soft hidden">
                    {selectedCompany.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-ink">{selectedCompany.name}</h2>
                  <p className="text-ink-soft font-medium flex items-center gap-2 mt-1">
                    <BiBuildingHouse /> {selectedCompany.industry || "IT/Software"}
                    {selectedCompany.website && (
                      <>
                        <span className="text-gray-300">•</span>
                        <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          Visit Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-line shadow-sm">
                  <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Roles Offered</p>
                  <p className="font-medium text-ink">{selectedCompany.rolesStr}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-line shadow-sm">
                  <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Expected CTC</p>
                  <p className="font-medium text-ink">
                    {selectedCompany.package?.min ? `${selectedCompany.package.min} - ${selectedCompany.package.max} LPA` : "Not Disclosed"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-line shadow-sm">
                  <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Drive Date</p>
                  <p className="font-medium text-ink">
                    {selectedCompany.visitDate ? new Date(selectedCompany.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "TBD"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-line shadow-sm">
                  <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">Eligibility Criteria</p>
                  <p className="font-medium text-ink">
                    CGPA: {selectedCompany.eligibility?.minCGPA || "N/A"}+ | Max Backlogs: {selectedCompany.eligibility?.maxBacklogs !== undefined ? selectedCompany.eligibility.maxBacklogs : "N/A"}
                  </p>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="mb-8">
                  <h3 className="font-display font-semibold text-lg text-ink mb-2">About the Company</h3>
                  <p className="text-ink-soft leading-relaxed text-sm">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {selectedCompany.selectionProcess && selectedCompany.selectionProcess.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-semibold text-lg text-ink mb-3">Selection Process</h3>
                  <div className="space-y-3">
                    {selectedCompany.selectionProcess.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-ink text-sm font-medium pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-line flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-line text-ink hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setSelectedCompany(null);
                    navigate('/company-prep');
                  }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-ink text-paper shadow-sm hover:bg-ink-soft transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-paper border border-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-bold text-2xl mb-2 text-ink">Global Rank</h2>
             <p className="text-muted text-sm mb-5">Your ranking is determined by your Placement Readiness score, which combines your aptitude, coding, and resume scores.</p>
             <div className="bg-ink/5 border border-line rounded-xl p-5 flex items-center gap-4 mb-5 shadow-sm">
               <div className="text-4xl">🏆</div>
               <div>
                 <p className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-1">Current Standing</p>
                 <p className="text-3xl font-bold text-ink">#{globalRank} <span className="text-lg text-muted font-normal">of {totalUsersCount}</span></p>
               </div>
             </div>
             <p className="text-sm text-ink-soft leading-relaxed">Keep practicing mock tests, update your ATS resume, and participate in interview prep to improve your readiness score and climb the leaderboard!</p>
             <button onClick={() => setActiveStatModal(null)} className="w-full mt-6 py-2.5 rounded-xl font-semibold bg-gray-100 text-ink hover:bg-gray-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Tests Taken Modal */}
      {activeStatModal === 'tests' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-paper border border-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-bold text-2xl mb-2 text-ink">Tests Taken</h2>
             <p className="text-muted text-sm mb-5">You have taken {overview?.totalTests || 0} tests with an average score of {overview?.avgScore || 0}%.</p>
             
             {analytics?.categoryPerformance?.length > 0 ? (
               <div className="space-y-3 mb-6">
                 {analytics.categoryPerformance.map((cat, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-line bg-gray-50">
                     <span className="font-semibold text-ink capitalize">{cat.category}</span>
                     <div className="flex items-center gap-3">
                       <span className="text-xs text-muted">{cat.totalAttempts} attempts</span>
                       <span className={`font-mono font-bold ${cat.avgPercentage >= 70 ? 'text-emerald' : cat.avgPercentage < 50 ? 'text-coral' : 'text-amber'}`}>
                         {cat.avgPercentage}% avg
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-6 text-center text-muted">No tests taken yet.</div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-2.5 rounded-xl font-semibold bg-ink text-white shadow-sm hover:bg-ink-soft transition-colors mb-3">Take a new Test</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-2.5 rounded-xl font-semibold bg-gray-100 text-ink hover:bg-gray-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Weak Topic Modal */}
      {activeStatModal === 'weak' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveStatModal(null)}>
          <div className="bg-paper border border-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <h2 className="font-display font-bold text-2xl mb-2 text-ink">Weak Topics</h2>
             <p className="text-muted text-sm mb-5">Areas where your average score is below 50%. Focus your practice here.</p>
             
             {analytics?.weakAreas?.length > 0 ? (
               <div className="space-y-3 mb-6">
                 {analytics.weakAreas.map((topic, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-coral/30 bg-[#FDE9E5]">
                     <span className="font-semibold text-coral capitalize">{topic.category}</span>
                     <span className="font-mono font-bold text-coral">{topic.avgPercentage}% avg</span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-4 rounded-xl border border-emerald/30 bg-emerald-soft text-emerald font-semibold text-center mb-6">
                 Great job! You have no weak areas currently.
               </div>
             )}
             
             <button onClick={() => { setActiveStatModal(null); navigate('/practice'); }} className="w-full py-2.5 rounded-xl font-semibold bg-ink text-white shadow-sm hover:bg-ink-soft transition-colors mb-3">Start Practicing</button>
             <button onClick={() => setActiveStatModal(null)} className="w-full py-2.5 rounded-xl font-semibold bg-gray-100 text-ink hover:bg-gray-200 transition-colors">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
