import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

const FocusCard = ({ title, description, ctaText, onCtaClick, icon }) => {
  return (
    <div 
      className="rounded-[28px] p-6 md:p-7 text-white flex flex-col md:flex-row justify-between items-center mb-6 shadow-lift gap-5 flex-wrap"
      style={{ background: 'linear-gradient(120deg, #1B2A4A 0%, #24365E 100%)' }}
    >
      <div className="flex gap-4 items-start">
        {icon && (
          <div 
            className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,182,72,0.15)', color: '#FFB648' }}
          >
            {icon}
          </div>
        )}
        <div>
          <div className="text-[11.5px] tracking-[0.06em] uppercase text-amber font-bold mb-1">Today's focus</div>
          <h3 className="font-display font-medium text-[19px] mb-1">{title}</h3>
          <p className="text-[13.5px] text-[#C3CBE0] max-w-[420px] leading-relaxed">{description}</p>
        </div>
      </div>
      
      <button
        onClick={onCtaClick}
        className="text-[#3A2600] border-none px-6 py-3 rounded-xl font-bold text-[14px] cursor-pointer whitespace-nowrap flex items-center gap-2 transition-all hover:-translate-y-[2px] hover:shadow-[0_10px_20px_-6px_rgba(255,182,72,0.5)]"
        style={{ backgroundColor: '#FFB648' }}
      >
        {ctaText} <FiArrowRight size={16} />
      </button>
    </div>
  );
};

export default FocusCard;
