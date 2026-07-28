import { Link } from "react-router-dom";
import { FiMessageSquare, FiBook, FiTarget, FiChevronRight } from "react-icons/fi";
import Card from "../components/ui/Card";

const SECTIONS = [
  {
    title: "Forum",
    desc: "Discuss placement questions, share tips, and help each other.",
    path: "/community/forum",
    icon: FiMessageSquare,
    color: "text-amber-deep",
    bg: "bg-amber/10",
  },
  {
    title: "AI Study Buddy",
    desc: "Your personal AI tutor — ask doubts, get explanations, and practice problems.",
    path: "/community/study-buddy",
    icon: FiBook,
    color: "text-ink",
    bg: "bg-ink/5",
  },
  {
    title: "AI Career Advisor",
    desc: "Get personalized career guidance based on your test performance and profile.",
    path: "/community/career-advisor",
    icon: FiTarget,
    color: "text-emerald",
    bg: "bg-emerald-soft",
  },
];

const CommunityHub = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink">Community & AI Hub</h1>
        <p className="font-body text-muted mt-2">Connect with peers, get AI-powered study help, and plan your career.</p>
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

export default CommunityHub;
