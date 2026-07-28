import { Link } from "react-router-dom";
import { 
  FileText, Cpu, Briefcase, ChevronRight, Target, 
  Building2, Zap, ArrowUpRight, CheckCircle2 
} from "lucide-react";

const CareerHub = () => {
  return (
    <div className="min-h-screen bg-surface pb-20 animate-fade-in">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-bold text-3xl md:text-4xl text-ink tracking-tight mb-2">Career Command Center</h1>
          <p className="text-ink-soft text-lg font-medium max-w-2xl">Optimize your profile, predict your placement chances, and discover off-campus opportunities.</p>
        </div>

        {/* Top Split Layout: Profile Optimization & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Hero: Resume & ATS (The core action) */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-floating group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                  <Zap size={14} className="text-emerald-400" /> Essential Step
                </div>
                <h2 className="font-bold text-3xl md:text-5xl text-white mb-4 leading-tight tracking-tight">
                  Optimize Your Resume <br /> For ATS Systems
                </h2>
                <p className="text-indigo-200 text-lg max-w-lg font-medium mb-8 leading-relaxed">
                  Upload your latest resume to automatically extract skills, build your profile, and check compatibility with top tech companies.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  to="/career/resume"
                  className="inline-flex items-center gap-2 bg-white text-indigo-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  <FileText size={20} />
                  Manage Resume
                </Link>
                <Link 
                  to="/career/ats"
                  className="inline-flex items-center gap-2 bg-indigo-900/50 text-white border border-indigo-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-800 transition-all duration-300"
                >
                  <Cpu size={20} />
                  Run ATS Check
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel: Placement Predictor Widget */}
          <div className="bg-white rounded-[2rem] p-8 border border-line shadow-card flex flex-col justify-between group hover:border-indigo-200 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                  <Target size={24} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted bg-surface px-3 py-1 rounded-full">ML Powered</span>
              </div>
              <h3 className="font-bold text-2xl text-ink tracking-tight mb-2">Placement Predictor</h3>
              <p className="text-ink-soft text-sm font-medium mb-8">Calculate your probability of getting placed based on your current metrics.</p>
              
              {/* Mock Probability Visual */}
              <div className="relative mb-8 flex justify-center">
                <div className="w-40 h-40 rounded-full border-8 border-surface flex items-center justify-center relative">
                  <div className="absolute inset-[-4px] rounded-full border-8 border-violet-500 border-t-transparent border-l-transparent -rotate-45 opacity-20"></div>
                  <div className="text-center">
                    <span className="block text-4xl font-bold text-ink tracking-tight">?</span>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Probability</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Link 
              to="/career/predictor"
              className="flex items-center justify-center gap-2 w-full py-4 bg-surface hover:bg-slate-100 border border-line rounded-xl font-bold text-ink transition-colors"
            >
              Run Prediction <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>

        {/* Bottom Section: Opportunities */}
        <div>
          <h3 className="font-bold text-2xl text-ink mb-6 flex items-center gap-2 tracking-tight">
            <Briefcase className="text-amber-500" /> Explore Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Jobs Card */}
            <Link to="/career/jobs" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-line shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-amber-100">
                    <Briefcase size={28} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-bold text-2xl text-ink mb-2 group-hover:text-amber-600 transition-colors tracking-tight">Off-Campus Jobs</h4>
                  <p className="text-ink-soft font-medium leading-relaxed max-w-sm">Browse live remote and off-campus job opportunities curated for recent graduates.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shrink-0">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>

            {/* Company Explorer Card */}
            <Link to="/career/companies" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-line shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                    <Building2 size={28} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-bold text-2xl text-ink mb-2 group-hover:text-emerald-600 transition-colors tracking-tight">Company Explorer</h4>
                  <p className="text-ink-soft font-medium leading-relaxed max-w-sm">Track top tech companies, view eligibility criteria, and analyze placement statistics.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-muted group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shrink-0">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CareerHub;
