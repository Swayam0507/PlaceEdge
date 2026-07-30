import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const AIChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the floating button if we are already on the study-buddy page
  if (location.pathname === '/community/study-buddy') {
    return null;
  }

  return (
    <div className="chatbot-container">
      <button 
        className="chatbot-toggle-btn group relative" 
        onClick={() => navigate('/community/study-buddy')}
        title="Ask Study Buddy"
      >
        <FiMessageSquare size={24} />
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-3 w-max px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Ask Study Buddy ✨
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </span>
      </button>
    </div>
  );
};

export default AIChatbot;
