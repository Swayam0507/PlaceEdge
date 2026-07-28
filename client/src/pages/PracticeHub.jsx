import { Link } from "react-router-dom";
import { CheckSquare, BarChart2, Mic, Award, Bookmark, Terminal, Target, ChevronRight, BrainCircuit, Code2, Users2, LayoutDashboard } from "lucide-react";

const SECTIONS = [
  {
    title: "Aptitude Tests",
    desc: "Practice quantitative, logical, and technical aptitude questions with AI.",
    path: "/exam/aptitude",
    icon: BrainCircuit,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    title: "DSA Tests",
    desc: "Practice Data Structures & Algorithms with AI-generated questions.",
    path: "/exam/dsa",
    icon: Code2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    title: "Soft Skills & HR",
    desc: "Practice behavioral and HR interview questions dynamically.",
    path: "/exam/soft_skills",
    icon: Users2,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-100",
  },
  {
    title: "Career Path Assessment",
    desc: "Discover your ideal career path with AI-driven testing.",
    path: "/exam/career",
    icon: Target,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    title: "Test History",
    desc: "Review past attempts, scores, and detailed analytics.",
    path: "/practice/history",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    title: "Interview Prep",
    desc: "Company-wise interview questions and AI mock interview practice.",
    path: "/practice/interview",
    icon: Mic,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    title: "Company Prep",
    desc: "AI-generated roadmaps and top questions for top tech companies.",
    path: "/company-prep",
    icon: CheckSquare,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-100",
  },
  {
    title: "Leaderboard",
    desc: "See how you rank against peers and climb the rankings.",
    path: "/practice/leaderboard",
    icon: Award,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    title: "Bookmarks",
    desc: "Your saved questions and resources for quick revision.",
    path: "/practice/bookmarks",
    icon: Bookmark,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
];

const PracticeHub = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">Practice Hub</h1>
        <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">Sharpen your skills with tests, mock interviews, and performance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link to={section.path} key={section.path} className="block group">
              <div className="h-full flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden z-10">
                {/* Decorative background glow */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-100 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10"></div>
                
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${section.bg} ${section.color} border flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors tracking-tight">{section.title}</h3>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{section.desc}</p>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PracticeHub;
