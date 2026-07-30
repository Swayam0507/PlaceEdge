import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Logo = ({ className = "", showAdminText = true, variant = "light" }) => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const linkTarget = isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/";

  return (
    <Link to={linkTarget} className={`flex items-center gap-2.5 transition-transform hover:scale-[1.02] ${className}`}>
      {/* Icon Container */}
      <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl shadow-lg ${variant === 'dark' ? 'bg-white/10 border border-white/10 shadow-black/20' : 'bg-ink shadow-ink/10'}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vertical line (Stem of P) */}
          <path 
            d="M7 4V20" 
            stroke="#ea580c" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Sharp Edge Bowl (Top of P) */}
          <path 
            d="M7 6H14L19.5 11L14 16H7" 
            stroke="#10b981" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      
      {/* Text Brand */}
      <div className="flex flex-col justify-center">
        <span className={`font-display font-bold text-[22px] leading-none tracking-tight ${variant === 'dark' ? 'text-white' : 'text-ink'}`}>
          Place<span className="text-amber-deep">Edge</span>
        </span>
        {isAdmin && showAdminText && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald -mt-0.5">
            Workspace
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
