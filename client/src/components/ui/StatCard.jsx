import React from 'react';

const StatCard = ({ label, value, valueSuffix, deltaText, deltaType = 'neutral', ringValue, ringColor = '#ef4444', onClick }) => {
  const deltaColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-500',
    neutral: 'text-slate-500'
  }[deltaType];

  const renderRing = () => {
    if (ringValue === undefined) return null;
    const radius = 22;
    const circumference = 2 * Math.PI * radius; // ~138
    const offset = circumference - (ringValue / 100) * circumference;

    return (
      <div className="relative w-[52px] h-[52px]">
        <svg width="52" height="52" className="-rotate-90">
          <circle cx="26" cy="26" r={radius} stroke="#f1f5f9" strokeWidth="5" fill="none" />
          <circle 
            cx="26" cy="26" r={radius} 
            stroke={ringColor} strokeWidth="5" fill="none" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] font-bold text-slate-900">
          {ringValue}%
        </div>
      </div>
    );
  };

  return (
    <div onClick={onClick} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
        {renderRing()}
      </div>
      <div className="text-[28px] font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
        {value}
        {valueSuffix && <span className="text-[15px] text-slate-400 font-medium ml-1">{valueSuffix}</span>}
      </div>
      {deltaText && (
        <div className={`text-[12px] font-bold mt-1 ${deltaColor}`}>
          {deltaText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
