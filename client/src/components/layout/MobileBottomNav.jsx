import { Link, useLocation } from "react-router-dom";
import { FiHome, FiCheckSquare, FiBriefcase, FiMessageSquare, FiUser } from "react-icons/fi";

const TABS = [
  { label: "Home", path: "/dashboard", icon: FiHome },
  { label: "Practice", path: "/practice", icon: FiCheckSquare },
  { label: "Career", path: "/career", icon: FiBriefcase },
  { label: "Community", path: "/community", icon: FiMessageSquare },
  { label: "Profile", path: "/profile", icon: FiUser },
];

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    if (path === "/profile") return location.pathname === "/profile";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-line bg-white/85 backdrop-blur-md pb-4 pt-2.5 px-2" role="navigation" aria-label="Mobile navigation">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-1 text-[10.5px] font-semibold transition-colors duration-200 ${
              active ? "text-ink" : "text-muted"
            }`}
          >
            <Icon size={20} />
            <div className={`w-1.5 h-1.5 rounded-full bg-amber transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}></div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
