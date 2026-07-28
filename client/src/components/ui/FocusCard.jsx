import React from 'react';
import { ArrowRight } from 'lucide-react';

const FocusCard = ({ title, description, ctaText, onCtaClick, icon }) => {
  return (
    <div 
      className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center mb-6 shadow-md gap-6 flex-wrap relative overflow-hidden bg-slate-900 border border-slate-800"
    >
      {/* Decorative gradient orb */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      
      <div className="flex gap-5 items-start relative z-10">
        {icon && (
          <div 
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-inner"
          >
            {icon}
          </div>
        )}
        <div>
          <div className="text-[12px] tracking-wider uppercase text-blue-400 font-bold mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Today's Focus
          </div>
          <h3 className="font-bold text-2xl mb-1.5 text-white tracking-tight">{title}</h3>
          <p className="text-[14px] text-slate-300 max-w-[460px] leading-relaxed font-medium">{description}</p>
        </div>
      </div>
      
      <button
        onClick={onCtaClick}
        className="relative z-10 bg-blue-600 text-white border border-blue-500 px-7 py-3.5 rounded-xl font-bold text-[14px] cursor-pointer whitespace-nowrap flex items-center gap-2 transition-all hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      >
        {ctaText} <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default FocusCard;
