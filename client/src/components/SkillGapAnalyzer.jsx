import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaBookOpen } from 'react-icons/fa';

const SkillGapAnalyzer = ({ requiredSkills, userSkills }) => {
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  useEffect(() => {
    // If no required skills are provided, we mock them based on the fact it's a prototype
    const targetSkills = requiredSkills && requiredSkills.length > 0 
      ? requiredSkills 
      : ["React", "JavaScript", "CSS", "Node.js", "Git"];
      
    const currentSkills = userSkills || ["JavaScript", "HTML", "CSS"];

    const matched = targetSkills.filter(skill => currentSkills.includes(skill));
    const missing = targetSkills.filter(skill => !currentSkills.includes(skill));
    
    setMatchedSkills(matched);
    setMissingSkills(missing);
    
    const percentage = Math.round((matched.length / targetSkills.length) * 100);
    setMatchPercentage(percentage);
  }, [requiredSkills, userSkills]);

  // Determine color based on match
  const getMatchColor = () => {
    if (matchPercentage >= 75) return "text-green-400";
    if (matchPercentage >= 50) return "text-yellow-400";
    return "text-red-400";
  };
  
  const getRingColor = () => {
    if (matchPercentage >= 75) return "stroke-green-400";
    if (matchPercentage >= 50) return "stroke-yellow-400";
    return "stroke-red-400";
  };

  return (
    <div className="mt-4 p-5 bg-gray-900 rounded-xl border border-gray-700 w-full animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        
        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-gray-700"
              strokeWidth="3"
              fill="none"
              strokeDasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${getRingColor()} transition-all duration-1000 ease-out`}
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${matchPercentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${getMatchColor()}`}>{matchPercentage}%</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Match</span>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="flex-1 w-full">
          <h4 className="text-white font-semibold mb-4 flex flex-wrap items-center gap-3 text-lg">
            Skill-Gap Analysis
            {matchPercentage < 100 && (
              <span className="bg-primary/20 text-primary-light text-xs font-medium px-2.5 py-1 rounded-md border border-primary/30 whitespace-nowrap">
                Action Required
              </span>
            )}
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            {/* Matched Skills */}
            <div className="flex-1">
              <p className="text-gray-400 mb-2 text-xs uppercase tracking-wider font-semibold">You Have ({matchedSkills.length})</p>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                    <FaCheckCircle size={10} /> {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="flex-1">
              <p className="text-gray-400 mb-2 text-xs uppercase tracking-wider font-semibold">Missing ({missingSkills.length})</p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                    <FaTimesCircle size={10} /> {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        {missingSkills.length > 0 && (
          <div className="flex-shrink-0 w-full lg:w-auto flex flex-col gap-2 mt-4 lg:mt-0">
            <button 
              onClick={() => window.location.href = '/practice'}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <FaBookOpen /> Prepare Module
            </button>
            <p className="text-xs text-gray-400 text-center font-medium">Estimated Prep: 3 days</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
