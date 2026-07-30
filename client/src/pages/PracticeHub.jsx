import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getDashboardAnalytics } from "../services/api";
import { createPortal } from "react-dom";
import { 
  BrainCircuit, Code2, Users2, Target, Play, X, LayoutDashboard, 
  Mic, CheckSquare, Award, Bookmark, ChevronRight, TrendingUp, Clock, Zap
} from "lucide-react";

// Test Categories for the Unified Test Arena
const TEST_CATEGORIES = [
  { id: "aptitude", title: "Aptitude Assessment", desc: "Quantitative, Logical & Verbal", icon: BrainCircuit, color: "text-blue-600", bg: "bg-blue-100" },
  { id: "dsa", title: "Data Structures & Algorithms", desc: "Coding & Problem Solving", icon: Code2, color: "text-emerald-600", bg: "bg-emerald-100" },
  { id: "soft_skills", title: "Soft Skills & HR", desc: "Behavioral & Communication", icon: Users2, color: "text-violet-600", bg: "bg-violet-100" },
  { id: "career", title: "Career Path Assessment", desc: "Discover your ideal role", icon: Target, color: "text-orange-600", bg: "bg-orange-100" },
];

// Auxiliary Tools
const PREP_TOOLS = [
  { title: "Interview Prep", desc: "AI Mock Interviews", path: "/practice/interview", icon: Mic, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  { title: "Company Prep", desc: "Role-specific Guides", path: "/company-prep", icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
];

const TRACKING_TOOLS = [
  { title: "Test History", desc: "Review Past Scores", path: "/practice/history", icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  { title: "Leaderboard", desc: "Global Rankings", path: "/practice/leaderboard", icon: Award, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { title: "Bookmarks", desc: "Saved Questions", path: "/practice/bookmarks", icon: Bookmark, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
];

const PracticeHub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfig, setShowConfig] = useState(location.state?.openModal || false);
  const [stats, setStats] = useState({ rank: "N/A", tests: 0 });
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || "aptitude");
  const [difficulty, setDifficulty] = useState("medium");

  // Clean up location state on mount to prevent re-opening on manual refresh
  useEffect(() => {
    if (location.state?.openModal) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardAnalytics();
        if (data.success && data.analytics?.overview) {
          setStats({
            rank: data.analytics.overview.globalRank ? `#${data.analytics.overview.globalRank}` : "N/A",
            tests: data.analytics.overview.totalTests || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const startTest = () => {
    // Navigate to the unified exam route with difficulty as state if needed
    navigate(`/exam/${selectedCategory}`, { state: { difficulty } });
  };

  return (
    <div className="min-h-screen bg-surface pb-20 animate-fade-in">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-bold text-3xl md:text-4xl text-ink tracking-tight mb-2">Practice Center</h1>
          <p className="text-ink-soft text-lg font-medium max-w-2xl">Your unified workspace for skill assessment, interview prep, and performance tracking.</p>
        </div>

        {/* Action Dashboard Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Hero: Unified Test Arena */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-floating group">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                  <Zap size={14} className="text-amber-400" /> Unified Arena
                </div>
                <h2 className="font-bold text-3xl md:text-5xl text-white mb-4 leading-tight tracking-tight">
                  Master Your Skills <br /> With AI Assessments
                </h2>
                <p className="text-indigo-200 text-lg max-w-md font-medium mb-8">
                  Take aptitude, DSA, and soft skill tests tailored to your preparation level.
                </p>
              </div>
              
              <div>
                <button 
                  onClick={() => setShowConfig(true)}
                  className="inline-flex items-center gap-3 bg-white text-indigo-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  <Play fill="currentColor" size={20} />
                  Start Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Stats & Activity */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 border border-line shadow-card flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-ink">Performance Snapshot</h3>
                <TrendingUp size={20} className="text-emerald-500" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Global Rank</div>
                  <div className="text-3xl font-bold text-ink tracking-tight">{stats.rank}</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">Global Placement Standing</div>
                </div>
                
                <div className="h-px bg-line w-full"></div>
                
                <div>
                  <div className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Tests Completed</div>
                  <div className="text-3xl font-bold text-ink tracking-tight">{stats.tests}</div>
                  <div className="text-xs text-indigo-600 font-medium mt-1">Keep practicing!</div>
                </div>
              </div>
              
              <Link to="/practice/history" className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-surface hover:bg-surface-hover border border-line rounded-xl text-ink font-bold text-sm transition-colors">
                View Full Analytics <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Swimlanes */}
        <div className="space-y-10">
          
          {/* Specialized Prep */}
          <div>
            <h3 className="font-bold text-2xl text-ink mb-6 flex items-center gap-2 tracking-tight">
              <Target className="text-indigo-500" /> Specialized Preparation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PREP_TOOLS.map((tool) => (
                <Link to={tool.path} key={tool.path} className="group flex items-center gap-5 bg-white p-5 rounded-2xl border border-line shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl ${tool.bg} ${tool.color} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-ink group-hover:text-indigo-600 transition-colors">{tool.title}</h4>
                    <p className="text-sm text-ink-soft font-medium mt-1">{tool.desc}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <ChevronRight size={20} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tracking & Library */}
          <div>
            <h3 className="font-bold text-2xl text-ink mb-6 flex items-center gap-2 tracking-tight">
              <Bookmark className="text-indigo-500" /> Your Library
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TRACKING_TOOLS.map((tool) => (
                <Link to={tool.path} key={tool.path} className="group flex flex-col bg-white p-6 rounded-2xl border border-line shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon size={24} strokeWidth={2.5} />
                    </div>
                    <ChevronRight size={20} className="text-muted group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h4 className="font-bold text-lg text-ink group-hover:text-indigo-600 transition-colors">{tool.title}</h4>
                  <p className="text-sm text-ink-soft font-medium mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Unified Test Configuration Modal */}
      {showConfig && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setShowConfig(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div>
                <h2 className="font-bold text-2xl text-slate-900 tracking-tight">Configure Assessment</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Select your topic and difficulty</p>
              </div>
              <button 
                onClick={() => setShowConfig(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TEST_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative flex flex-col items-start p-5 rounded-2xl text-left transition-all duration-200 ${
                        selectedCategory === cat.id 
                          ? 'bg-indigo-50/50 ring-2 ring-indigo-600 shadow-sm' 
                          : 'bg-white ring-1 ring-slate-200 hover:ring-indigo-300 hover:shadow-sm hover:bg-slate-50/50'
                      }`}
                    >
                      <cat.icon size={26} strokeWidth={2} className={`mb-3 ${selectedCategory === cat.id ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className="font-bold text-slate-900 text-sm mb-1 tracking-tight">{cat.title}</span>
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">{cat.desc}</span>
                      
                      {/* Custom Radio Circle */}
                      <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedCategory === cat.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {selectedCategory === cat.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Difficulty Level</label>
                <div className="inline-flex bg-slate-100/80 p-1.5 rounded-2xl w-full sm:w-auto">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 sm:w-32 py-2.5 px-4 rounded-xl font-bold text-sm capitalize transition-all duration-200 ${
                        difficulty === level
                          ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-3.5 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed">
                <Clock size={20} className="shrink-0 text-slate-400 mt-0.5" />
                <p>This assessment is timed and will automatically submit when time expires. Please ensure you have a stable connection.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={startTest}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
              >
                Begin Assessment <ChevronRight size={18} className="opacity-80" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default PracticeHub;

