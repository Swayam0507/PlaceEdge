import { Link } from "react-router-dom";
import { FiCheckSquare, FiBarChart2, FiMic, FiAward, FiBookmark, FiTerminal, FiTarget, FiChevronRight } from "react-icons/fi";
import Card from "../components/ui/Card";

const SECTIONS = [
  {
    title: "Aptitude Tests",
    desc: "Practice quantitative, logical, and technical aptitude questions with AI.",
    path: "/exam/aptitude",
    icon: FiCheckSquare,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "DSA Tests",
    desc: "Practice Data Structures & Algorithms with AI-generated questions.",
    path: "/exam/dsa",
    icon: FiTerminal,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
  {
    title: "Soft Skills & HR",
    desc: "Practice behavioral and HR interview questions dynamically.",
    path: "/exam/soft_skills",
    icon: FiMic,
    color: "text-ink",
    bg: "bg-ink/5",
  },
  {
    title: "Career Path Assessment",
    desc: "Discover your ideal career path with AI-driven testing.",
    path: "/exam/career",
    icon: FiTarget,
    color: "text-coral",
    bg: "bg-coral/10",
  },
  {
    title: "Test History",
    desc: "Review past attempts, scores, and detailed analytics.",
    path: "/practice/history",
    icon: FiBarChart2,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "Interview Prep",
    desc: "Company-wise interview questions and AI mock interview practice.",
    path: "/practice/interview",
    icon: FiMic,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
  {
    title: "Company Prep",
    desc: "AI-generated roadmaps and top questions for top tech companies.",
    path: "/company-prep",
    icon: FiCheckSquare,
    color: "text-ink",
    bg: "bg-ink/5",
  },
  {
    title: "Leaderboard",
    desc: "See how you rank against peers and climb the rankings.",
    path: "/practice/leaderboard",
    icon: FiAward,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "Bookmarks",
    desc: "Your saved questions and resources for quick revision.",
    path: "/practice/bookmarks",
    icon: FiBookmark,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
];

const PracticeHub = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink">Practice Hub</h1>
        <p className="font-body text-muted mt-2">Sharpen your skills with tests, mock interviews, and performance tracking.</p>
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

export default PracticeHub;
