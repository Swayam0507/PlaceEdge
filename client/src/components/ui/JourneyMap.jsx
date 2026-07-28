import React, { useState, useEffect } from 'react';

const JourneyMap = ({ journeyData }) => {
  // Fallback defaults when no data is loaded yet
  const stages = journeyData?.stages || [
    { key: "aptitude", label: "Aptitude", status: "current", sublabel: "" },
    { key: "coding", label: "Coding Test", status: "locked", sublabel: "" },
    { key: "resume", label: "Resume + ATS", status: "locked", sublabel: "" },
    { key: "interview", label: "Mock Interview", status: "locked", sublabel: "" },
    { key: "placed", label: "Placed", status: "locked", sublabel: "" },
  ];
  const completedCount = journeyData?.completedCount ?? 0;
  const currentIdx = journeyData?.currentStageIndex ?? 0;

  const [progress, setProgress] = useState(0);
  
  // Trigger animation on mount/update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // 4 segments = 25% each
      setProgress(currentIdx * 25);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIdx]);

  // SVG node positions along the wavy path
  const nodes = [
    { x: 60, y: 130 },
    { x: 290, y: 65 },
    { x: 500, y: 100 },
    { x: 720, y: 45 },
    { x: 940, y: 110 },
  ];

  // Full background path
  const bgPath = "M 60 130 C 220 40, 340 210, 500 100 S 780 20, 940 110";

  const renderNode = (stage, idx) => {
    const { x, y } = nodes[idx];
    const { label, status, sublabel } = stage;

    if (status === "completed") {
      return (
        <g key={idx} className="journey-node-group">
          <circle cx={x} cy={y} r="16" fill="#10b981" className="journey-node-done" />
          <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">✓</text>
          <text x={x} y={y + 35} className="font-sans" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#0f172a">{label}</text>
          {sublabel && (
            <text x={x} y={y + 50} className="font-sans" textAnchor="middle" fontSize="10.5" fill="#64748b">{sublabel}</text>
          )}
        </g>
      );
    }

    if (status === "current") {
      return (
        <g key={idx} className="journey-node-group">
          {/* Pulse ring animation */}
          <circle cx={x} cy={y} r="24" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" from="20" to="30" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r="20" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
          <text x={x} y={y + 6} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">{idx + 1}</text>
          <text x={x} y={y + 38} className="font-sans" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{label}</text>
          {sublabel && (
            <text x={x} y={y + 53} className="font-sans" textAnchor="middle" fontSize="10.5" fill="#64748b">{sublabel}</text>
          )}
        </g>
      );
    }

    // Locked
    return (
      <g key={idx} className="journey-node-group">
        <circle cx={x} cy={y} r="16" fill="white" stroke="#cbd5e1" strokeWidth="3" />
        <text x={x} y={y + 33} className="font-sans" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#94a3b8">{label}</text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-8 pb-6 mb-6 relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="font-bold text-[20px] text-slate-900">Your prep journey</h2>
        <span className="text-[13px] font-medium text-slate-500">5 stages · {completedCount} completed</span>
      </div>
      
      <svg className="w-full h-auto mt-3" viewBox="0 0 1080 190" xmlns="http://www.w3.org/2000/svg">
        {/* Background Track */}
        <path d={bgPath} stroke="#f1f5f9" strokeWidth="6" fill="none" strokeLinecap="round"/>
        
        {/* Animated Progress Track */}
        <path 
          d={bgPath} 
          stroke="#10b981" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />

        {/* Dynamic Nodes */}
        {stages.map((stage, idx) => renderNode(stage, idx))}
      </svg>
    </div>
  );
};

export default JourneyMap;
