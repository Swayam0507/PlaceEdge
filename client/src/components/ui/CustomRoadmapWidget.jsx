import React, { useState } from 'react';
import { FiCheckCircle, FiCircle, FiTarget, FiAlertCircle } from 'react-icons/fi';
import { toggleRoadmapTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CustomRoadmapWidget = ({ user }) => {
  const [activeWeek, setActiveWeek] = useState(1);
  const { setUser } = useAuth();
  
  const roadmap = user?.customRoadmap;
  const completedTasks = roadmap?.completedTasks || [];

  const handleToggleTask = async (taskId) => {
    const isCompleted = completedTasks.includes(taskId);
    const willComplete = !isCompleted;

    // Optimistic UI update
    const updatedCompletedTasks = willComplete 
      ? [...completedTasks, taskId] 
      : completedTasks.filter(id => id !== taskId);

    setUser(prev => ({
      ...prev,
      customRoadmap: {
        ...prev.customRoadmap,
        completedTasks: updatedCompletedTasks
      }
    }));

    try {
      const { data } = await toggleRoadmapTask(taskId, willComplete);
      if (data.success) {
        setUser(prev => ({
          ...prev,
          customRoadmap: data.customRoadmap
        }));
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
      // Revert if failed
      setUser(prev => ({
        ...prev,
        customRoadmap: roadmap
      }));
    }
  };

  if (!roadmap || !roadmap.weeks || roadmap.weeks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-xl border border-white rounded-3xl text-center">
        <FiTarget className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="font-display font-black text-xl text-slate-800">No Roadmap Found</h3>
        <p className="text-sm font-medium text-slate-500 mt-2">
          Your custom roadmap for {user?.targetCompany || "your target company"} is not available.
        </p>
      </div>
    );
  }

  const currentWeekData = roadmap.weeks.find(w => w.week === activeWeek) || roadmap.weeks[0];

  return (
    <div className="w-full h-full flex flex-col p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
              Target Company
            </span>
            <span className="font-display font-black text-lg text-slate-900">{user.targetCompany}</span>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight">Your Custom Prep Plan</h2>
        </div>
        <div className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 whitespace-nowrap">
          {roadmap.weeks.length} Weeks Plan
        </div>
      </div>

      {/* Gap Analysis Alert */}
      {roadmap.gapAnalysis && (
        <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
          <FiAlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-slate-800">AI Gap Analysis</h4>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
              {roadmap.gapAnalysis}
            </p>
            {roadmap.missingSkills && roadmap.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {roadmap.missingSkills.map((skill, idx) => (
                  <span key={idx} className="bg-white border border-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-md">
                    Missing: {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-3 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg inline-block border border-emerald-200">
                🎉 All identified missing skills acquired!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {roadmap.weeks.map((w) => (
          <button
            key={w.week}
            onClick={() => setActiveWeek(w.week)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeWeek === w.week 
                ? "bg-slate-900 text-white shadow-md" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Week {w.week}
          </button>
        ))}
      </div>

      {/* Week Content */}
      <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100 overflow-y-auto max-h-[200px]">
        <h3 className="font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">
          Focus: {currentWeekData.title}
        </h3>
        
        <ul className="space-y-4">
          {currentWeekData.tasks && currentWeekData.tasks.map((task, idx) => {
            const taskId = `w${activeWeek}-t${idx}`;
            const isCompleted = completedTasks.includes(taskId);
            
            return (
              <li 
                key={idx} 
                onClick={() => handleToggleTask(taskId)}
                className="flex items-start gap-3 group cursor-pointer"
              >
                <div className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500'}`}>
                  {isCompleted ? <FiCheckCircle size={18} /> : <FiCircle size={18} />}
                </div>
                <p className={`text-sm font-medium transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {task}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CustomRoadmapWidget;
