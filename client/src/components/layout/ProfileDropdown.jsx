import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <img
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || "User"}`}
          alt="Avatar"
          className="h-8 w-8 rounded-full bg-slate-100 object-cover border border-slate-200 p-0.5"
        />
        <span className="hidden sm:inline-block font-semibold text-slate-800">{user?.name?.split(" ")[0]}</span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/50 z-50">
          <div className="px-4 py-3 border-b border-slate-100 mb-1">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs font-medium text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600" onClick={() => setOpen(false)}>
            <User size={16} className="text-slate-400" /> My Profile
          </Link>
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600" onClick={() => setOpen(false)}>
            <Settings size={16} className="text-slate-400" /> Settings
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600" onClick={() => setOpen(false)}>
            <HelpCircle size={16} className="text-slate-400" /> Help
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
            <LogOut size={16} className="text-red-500" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
