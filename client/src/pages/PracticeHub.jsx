import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [showConfig, setShowConfig] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("aptitude");
  const [difficulty, setDifficulty] = useState("medium");

  const startTest = () => {
    // Navigate to the unified exam route with difficulty as state if needed
    navigate(`/exam/${selectedCategory}`, { state: { difficulty } });
  };

  return (
    <div className="min-h-screen bg-surface pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight mb-2">Practice Center</h1>
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
                <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
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
                  <div className="text-3xl font-display font-bold text-ink">#428</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">↑ Top 15% this week</div>
                </div>
                
                <div className="h-px bg-line w-full"></div>
                
                <div>
                  <div className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Tests Completed</div>
                  <div className="text-3xl font-display font-bold text-ink">24</div>
                  <div className="text-xs text-indigo-600 font-medium mt-1">4 tests in last 7 days</div>
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
            <h3 className="font-display font-bold text-2xl text-ink mb-6 flex items-center gap-2">
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
            <h3 className="font-display font-bold text-2xl text-ink mb-6 flex items-center gap-2">
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
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowConfig(false)}>
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-line flex items-center justify-between bg-surface">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink">Configure Assessment</h2>
                <p className="text-sm text-ink-soft font-medium mt-1">Select your topic and difficulty</p>
              </div>
              <button 
                onClick={() => setShowConfig(false)}
                className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-4">1. Select Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEST_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selectedCategory === cat.id 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                          : 'border-line bg-white hover:border-indigo-200 hover:bg-surface'
                      }`}
                    >
                      <cat.icon size={24} className={`mb-3 ${selectedCategory === cat.id ? 'text-indigo-600' : cat.color}`} />
                      <span className="font-bold text-ink text-sm mb-1">{cat.title}</span>
                      <span className="text-xs text-ink-soft font-medium">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-4">2. Select Difficulty</label>
                <div className="flex bg-surface p-1.5 rounded-xl border border-line">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm capitalize transition-all ${
                        difficulty === level
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-muted hover:text-ink hover:bg-white/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm font-medium">
                <Clock size={20} className="shrink-0 text-amber-500" />
                <p>This assessment is timed (typically 30 mins) and will automatically submit when time expires. Ensure you have a stable connection.</p>
              </div>
            </div>

            <div className="p-6 border-t border-line bg-surface flex justify-end gap-3">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-6 py-3 rounded-xl font-bold text-ink bg-white border border-line hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={startTest}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
              >
                <Play fill="currentColor" size={16} /> Begin Test
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PracticeHub;

