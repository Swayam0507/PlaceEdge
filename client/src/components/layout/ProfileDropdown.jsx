import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { FiUser, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";

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
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setOpen(!open)}
      >
        <img
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || "User"}`}
          alt="Avatar"
          className="h-8 w-8 rounded-full bg-slate-100 object-cover border border-slate-200 p-0.5"
        />
        <span className="hidden sm:inline-block font-semibold">{user?.name?.split(" ")[0]}</span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/50 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs font-medium text-slate-500">{user?.email}</p>
          </div>
          <div className="border-t border-slate-100" />
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-600" onClick={() => setOpen(false)}>
            <FiUser size={16} className="text-slate-400" /> My Profile
          </Link>
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-600" onClick={() => setOpen(false)}>
            <FiSettings size={16} className="text-slate-400" /> Settings
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-600" onClick={() => setOpen(false)}>
            <FiHelpCircle size={16} className="text-slate-400" /> Help
          </button>
          <div className="border-t border-slate-100" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <FiLogOut size={16} className="text-red-500" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
