import { Link } from "react-router-dom";
import { FileText, Cpu, Briefcase, ChevronRight, Target, Building2 } from "lucide-react";

const SECTIONS = [
  {
    title: "Resume Builder",
    desc: "Upload and manage your resumes with auto-detected skills and education.",
    path: "/career/resume",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    title: "ATS Checker",
    desc: "Analyze your resume against Applicant Tracking Systems for compatibility.",
    path: "/career/ats",
    icon: Cpu,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    title: "Placement Predictor",
    desc: "Get your placement probability predicted by ML classifiers.",
    path: "/career/predictor",
    icon: Target,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-100",
  },
  {
    title: "Off-Campus Jobs",
    desc: "Browse live remote and off-campus job opportunities.",
    path: "/career/jobs",
    icon: Briefcase,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    title: "Company Explorer",
    desc: "Track company visits, eligibility criteria, and placement stats.",
    path: "/career/companies",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
];

const CareerHub = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight">Career Hub</h1>
        <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">Manage your placement journey — resume, jobs, predictions, and certifications.</p>
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

export default CareerHub;
