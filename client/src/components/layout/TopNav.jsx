import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Search, Flame, BarChart2, Edit, Users, Briefcase, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const STUDENT_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Practice", path: "/practice" },
  { label: "Career", path: "/career" },
  { label: "Community", path: "/community" },
];

const ADMIN_LINKS = [
  { label: "Analytics", path: "/admin", icon: BarChart2 },
  { label: "Companies", path: "/career/companies", icon: Briefcase },
  { label: "Questions", path: "/admin/questions", icon: Edit },
  { label: "Students", path: "/admin/users", icon: Users },
];

const TopNav = ({ onOpenCommandPalette }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isLanding = location.pathname === "/";

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  if (isLanding && !isAuthenticated) return null;

  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        
        {/* Left: Branding */}
        <div className="flex-1 flex justify-start">
          <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              PlaceEdge{isAdmin ? " Admin" : ""}
            </span>
          </Link>
        </div>

        {/* Center/Primary Nav Links (Desktop) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center justify-center space-x-1 absolute left-1/2 -translate-x-1/2">
            {links.map(link => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.icon && <link.icon size={16} />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              {/* Search Trigger */}
              <button
                className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none shrink-0 shadow-sm"
                onClick={onOpenCommandPalette}
                title="Search (⌘K)"
              >
                <Search size={18} />
              </button>
              
              {/* Streak Pill */}
              {!isAdmin && (
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold shrink-0 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 text-orange-600 shadow-sm"
                >
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                  <span>{user?.streak?.current || 0} Day</span>
                </div>
              )}

              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 px-2 py-2">Sign In</Link>
              <Link to="/register" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:-translate-y-0.5">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
