import React from 'react';

const StatCard = ({ label, value, valueSuffix, deltaText, deltaType = 'neutral', ringValue, ringColor = '#E8654F', onClick }) => {
  const deltaColor = {
    positive: 'text-emerald',
    negative: 'text-coral',
    neutral: 'text-muted'
  }[deltaType];

  const renderRing = () => {
    if (ringValue === undefined) return null;
    const radius = 22;
    const circumference = 2 * Math.PI * radius; // ~138
    const offset = circumference - (ringValue / 100) * circumference;

    return (
      <div className="relative w-[52px] h-[52px]">
        <svg width="52" height="52" className="-rotate-90">
          <circle cx="26" cy="26" r={radius} stroke="#EFEBE2" strokeWidth="5" fill="none" />
          <circle 
            cx="26" cy="26" r={radius} 
            stroke={ringColor} strokeWidth="5" fill="none" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] font-bold text-ink">
          {ringValue}%
        </div>
      </div>
    );
  };

  return (
    <div onClick={onClick} className="bg-paper-raised border border-line rounded-xl p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift cursor-pointer">
      <div className="flex justify-between items-start mb-3.5">
        <div className="text-[12px] text-muted font-semibold uppercase tracking-[0.03em]">{label}</div>
        {renderRing()}
      </div>
      <div className="font-display text-[28px] font-semibold text-ink">
        {value}
        {valueSuffix && <span className="text-[15px] text-muted ml-1">{valueSuffix}</span>}
      </div>
      {deltaText && (
        <div className={`text-[12px] font-semibold mt-1 ${deltaColor}`}>
          {deltaText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
