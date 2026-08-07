import React, { useState, useEffect } from 'react';
import { Check, Lock, ChevronRight } from 'lucide-react';

const JourneyMap = ({ journeyData }) => {
  const stages = journeyData?.stages || [
    { key: "aptitude", label: "Aptitude", status: "current", sublabel: "Start here" },
    { key: "coding", label: "Coding", status: "locked", sublabel: "Next up" },
    { key: "resume", label: "Resume", status: "locked", sublabel: "Upload" },
    { key: "interview", label: "Interview", status: "locked", sublabel: "Mock prep" },
    { key: "placed", label: "Placed", status: "locked", sublabel: "Goal" },
  ];
  const completedCount = journeyData?.completedCount ?? 0;
  
  return (
    <div className="w-full h-full flex flex-col justify-center p-6 sm:p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight">Your Journey</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Stage {completedCount + 1} of 5</p>
        </div>
        <div className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100">
          {completedCount} Completed
        </div>
      </div>
      
      <div className="relative flex justify-between items-start w-full">
        {/* Background connector line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-slate-200 rounded-full -z-20"></div>
        
        {/* Active connector segments */}
        {[0, 1, 2, 3].map((i) => {
          const isSegmentActive = stages[i].status !== "locked" && stages[i+1].status !== "locked";
          return (
            <div 
              key={`segment-${i}`}
              className={`absolute top-6 h-1 transition-all duration-1000 -z-10 ${isSegmentActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-transparent'}`}
              style={{ left: `${i * 25}%`, width: '25%' }}
            ></div>
          );
        })}

        {stages.map((stage, idx) => {
          const isCompleted = stage.status === "completed";
          const isCurrent = stage.status === "current";
          
          return (
            <div key={idx} className="flex flex-col items-center relative group w-1/5">
              {/* Icon / Circle */}
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-transform duration-300 z-10 ${
                  isCurrent ? "scale-110" : "group-hover:scale-105"
                } ${
                  isCompleted 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30" 
                    : isCurrent 
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-100 shadow-blue-500/30" 
                      : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                <span className="font-display font-black text-lg">{idx + 1}</span>
              </div>
              
              {/* Label */}
              <div className="text-center w-full">
                <p className={`font-bold text-[13px] sm:text-sm tracking-tight mb-0.5 truncate ${
                  isCompleted || isCurrent ? "text-slate-900" : "text-slate-400"
                }`}>
                  {stage.label}
                </p>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                  {stage.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyMap;
