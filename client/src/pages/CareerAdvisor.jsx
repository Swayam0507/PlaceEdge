import { useState } from "react";
import {
  FiTarget,
  FiTrendingUp,
  FiAlertTriangle,
  FiAward,
  FiCalendar,
  FiZap,
  FiCpu,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getCareerAdvice } from "../services/api";

const CareerAdvisor = () => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getCareerAdvice();
      if (data.success) {
        setAdvice(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate career advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Difficulty badge styling
  const diffBadge = (d) => {
    if (d === "Easy") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (d === "Medium") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  };

  // Framer motion variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
          <FiTarget size={28} />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            AI Career Advisor
          </h1>
          <p className="font-body text-slate-500 text-sm mt-1">
            Personalized, actionable insights based on your mock test performance
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* CTA / Error State */}
        {!advice && !loading && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center p-12 bg-white/60 backdrop-blur-xl border border-white rounded-3xl shadow-xl shadow-slate-200/50"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-200 animate-pulse-slow">
              <FiCpu size={44} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 tracking-tight">
              Unlock Your Career Roadmap
            </h2>
            <p className="text-slate-500 max-w-lg mb-8 leading-relaxed text-sm md:text-base">
              Our advanced AI model analyzes your historical test scores, identifies your core strengths and weaknesses, and engineers a tailored 30-day mastery schedule for you.
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100"
              >
                <FiAlertTriangle />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <button
              onClick={analyze}
              className="group relative flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-3">
                <FiZap className="text-amber-300" size={20} /> 
                Analyze My Profile
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                <FiCpu size={24} className="animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing your profile...</h3>
            <p className="text-slate-500 text-sm">Processing historical data & crafting personalized advice 🤖</p>
          </motion.div>
        )}

        {/* Results State */}
        {advice && !loading && (
          <motion.div
            key="results-state"
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* Action Bar */}
            <motion.div variants={itemVars} className="flex justify-end">
              <button
                onClick={analyze}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-colors hover:shadow-sm"
              >
                <FiRefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" /> Re-analyze
              </button>
            </motion.div>

            {/* Stats Overview */}
            {stats && (
              <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-md">
                  <span className="text-3xl font-black text-indigo-600 mb-1">{stats.totalTests}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tests Taken</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-md">
                  <span className="text-3xl font-black text-emerald-500 mb-1">{stats.avgScore}%</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</span>
                </div>
                {stats.categoryBreakdown?.slice(0, 2).map((cat, idx) => (
                  <div key={cat.category} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:shadow-md">
                    <span className={`text-3xl font-black mb-1 ${idx === 0 ? 'text-amber-500' : 'text-cyan-500'}`}>
                      {cat.avgPercentage}%
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center">
                      {cat.category}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Overall Assessment */}
            <motion.div variants={itemVars} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-4 relative z-10">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <FiCpu size={20} />
                </div>
                Overall Assessment
              </h3>
              <p className="text-slate-600 leading-relaxed text-base relative z-10">
                {advice.overallAssessment}
              </p>
            </motion.div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div variants={itemVars} className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-700 mb-5">
                  <FiTrendingUp /> Your Strengths
                </h3>
                <ul className="space-y-3">
                  {advice.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-emerald-900 text-sm">
                      <FiCheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span className="leading-tight">{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVars} className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-rose-700 mb-5">
                  <FiAlertTriangle /> Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {advice.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start gap-3 text-rose-900 text-sm">
                      <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">!</div>
                      <span className="leading-tight">{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Recommended Companies & Skill Gaps */}
            <div className="grid md:grid-cols-12 gap-6">
              <motion.div variants={itemVars} className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <FiAward size={18} />
                  </div>
                  Recommended Companies
                </h3>
                <div className="flex flex-col gap-3">
                  {advice.recommendedCompanies?.map((c, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 mb-1">{c.name}</p>
                        <p className="text-xs text-slate-500 leading-snug">{c.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 w-fit ${diffBadge(c.difficulty)}`}>
                        {c.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVars} className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
                  <div className="p-1.5 bg-cyan-100 text-cyan-600 rounded-lg">
                    <FiZap size={18} />
                  </div>
                  Skill Gaps to Fill
                </h3>
                {advice.skillGaps?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {advice.skillGaps.map((skill, i) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-cyan-50 hover:text-cyan-700 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No major skill gaps identified right now. Keep practicing!</p>
                )}
                
                {/* Motivational block placed nicely here */}
                {advice.motivationalNote && (
                  <div className="mt-auto pt-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50">
                      <p className="text-sm font-medium text-indigo-800 italic leading-relaxed">
                        <span className="mr-2">💡</span>"{advice.motivationalNote}"
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* 30-Day Study Plan */}
            <motion.div variants={itemVars} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-6">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FiCalendar size={20} />
                </div>
                30-Day Study Plan
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {advice.thirtyDayPlan?.map((week, index) => (
                  <div key={week.week} className="flex flex-col bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-black text-purple-600 border border-slate-100">
                        W{week.week}
                      </div>
                      <span className="font-bold text-slate-800 text-sm leading-tight flex-1">
                        {week.focus}
                      </span>
                    </div>
                    <ul className="space-y-2 mt-auto">
                      {week.tasks?.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0"></div>
                          <span className="leading-snug">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerAdvisor;
