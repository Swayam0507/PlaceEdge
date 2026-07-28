import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const ROUTE_LABELS = {
  dashboard: "Dashboard",
  practice: "Practice",
  career: "Career",
  community: "Community",
  profile: "Profile",
  tests: "Aptitude Tests",
  history: "Test History",
  interview: "Interview Prep",
  leaderboard: "Leaderboard",
  bookmarks: "Bookmarks",
  resume: "Resume Builder",
  ats: "ATS Checker",
  predictor: "Placement Predictor",
  jobs: "Off-Campus Jobs",
  companies: "Company Explorer",
  certificates: "Certificates",
  forum: "Forum",
  feed: "Success Stories",
  mentorship: "Mentorship",
  "test-result": "Test Result",
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  return (
    <nav className="hidden md:flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-[12px] font-body text-muted">
        <li>
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-ink transition-colors">
            <FiHome size={12} />
            <span>Home</span>
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={path} className="flex items-center space-x-2">
              <FiChevronRight size={10} className="text-line" />
              {isLast ? (
                <span className="text-ink font-medium">{label}</span>
              ) : (
                <Link to={path} className="hover:text-ink transition-colors">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
