import { Link } from "react-router-dom";
import { FiFileText, FiCpu, FiBriefcase, FiAward, FiChevronRight } from "react-icons/fi";
import { BiBuildingHouse, BiTargetLock } from "react-icons/bi";
import Card from "../components/ui/Card";

const SECTIONS = [
  {
    title: "Resume Builder",
    desc: "Upload and manage your resumes with auto-detected skills and education.",
    path: "/career/resume",
    icon: FiFileText,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "ATS Checker",
    desc: "Analyze your resume against Applicant Tracking Systems for compatibility.",
    path: "/career/ats",
    icon: FiCpu,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
  {
    title: "Placement Predictor",
    desc: "Get your placement probability predicted by ML classifiers.",
    path: "/career/predictor",
    icon: BiTargetLock,
    color: "text-ink",
    bg: "bg-ink/5",
  },
  {
    title: "Off-Campus Jobs",
    desc: "Browse live remote and off-campus job opportunities.",
    path: "/career/jobs",
    icon: FiBriefcase,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "Company Explorer",
    desc: "Track company visits, eligibility criteria, and placement stats.",
    path: "/career/companies",
    icon: BiBuildingHouse,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
];

const CareerHub = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink">Career Hub</h1>
        <p className="font-body text-muted mt-2">Manage your placement journey — resume, jobs, predictions, and certifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link to={section.path} key={section.path} className="block group">
              <Card className="h-full flex flex-col justify-between border-line group-hover:border-ink/20">
                <div>
                  <div className={`w-12 h-12 rounded-lg ${section.bg} ${section.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink mb-2">{section.title}</h3>
                  <p className="font-body text-sm text-muted">{section.desc}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-muted group-hover:bg-ink group-hover:text-white transition-colors">
                    <FiChevronRight size={18} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CareerHub;
