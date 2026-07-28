import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import { FiBarChart2, FiEdit, FiUsers, FiBriefcase } from "react-icons/fi";

const STUDENT_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Practice", path: "/practice" },
  { label: "Career", path: "/career" },
  { label: "Community", path: "/community" },
];

const ADMIN_LINKS = [
  { label: "Analytics", path: "/admin", icon: FiBarChart2 },
  { label: "Companies", path: "/career/companies", icon: FiBriefcase },
  { label: "Questions", path: "/admin/questions", icon: FiEdit },
  { label: "Students", path: "/admin/users", icon: FiUsers },
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

  // Hide on landing page for unauthenticated users
  if (isLanding && !isAuthenticated) return null;

  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper/70 backdrop-blur-md border-b border-line" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-7">
        
        {/* Left: Branding */}
        <div className="flex-1 flex justify-start">
          <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ink to-ink-soft text-amber-deep shadow-md font-display font-bold text-xl">
              P
            </div>
            <span className="font-display font-semibold text-lg text-ink">
              PlaceEdge{isAdmin ? " Admin" : ""}
            </span>
          </Link>
        </div>

        {/* Center/Primary Nav Links (Desktop) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center justify-center space-x-1 absolute left-1/2 -translate-x-1/2">
            {links.map(link => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    active 
                      ? "bg-white text-ink shadow-sm" 
                      : "text-ink-soft hover:bg-white/50 hover:text-ink"
                  }`}
                >
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
                className="flex items-center justify-center h-[38px] w-[38px] rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink/20 hover:text-ink hover:bg-paper focus:outline-none shrink-0 shadow-sm"
                onClick={onOpenCommandPalette}
                title="Search (⌘K)"
              >
                <FiSearch size={18} />
              </button>
              
              {/* Streak Pill */}
              {!isAdmin && (
                <div 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold shrink-0"
                  style={{ background: 'linear-gradient(90deg, #FFF3DE, #FFE8C2)', border: '1px solid #F3D89A', color: '#8A5A0E' }}
                >
                  <span>🔥</span>
                  <span>{user?.streak?.current || 0}-day</span>
                </div>
              )}

              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-ink transition-colors hover:text-ink-soft px-3 py-2">Login</Link>
              <Link to="/register" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lift transition-all hover:bg-ink-soft hover:-translate-y-0.5">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
