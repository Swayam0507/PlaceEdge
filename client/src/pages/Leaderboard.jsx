import { useState, useEffect } from "react";
import { getLeaderboard } from "../services/api";
import { FiAward, FiStar, FiFilter } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Trophy, Medal, Target, Activity } from "lucide-react";

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ period: "all", category: "all" });

  useEffect(() => { fetchLeaderboard(); }, [filters]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await getLeaderboard({ ...filters, limit: 50 });
      setLeaderboard(data.leaderboard || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getRankBadge = (i) => {
    if (i === 0) return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg shadow-yellow-500/30 ring-2 ring-white"><Trophy size={18} fill="currentColor" /></div>;
    if (i === 1) return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-400/30 ring-2 ring-white"><Medal size={20} fill="currentColor" /></div>;
    if (i === 2) return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-white"><Medal size={20} fill="currentColor" /></div>;
    return <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 border border-slate-200">#{i + 1}</div>;
  };

  const getScoreColor = (s) => s >= 70 ? "text-emerald" : s >= 40 ? "text-amber" : "text-coral";
  const getScoreBg = (s) => s >= 70 ? "bg-emerald/10 border-emerald/20" : s >= 40 ? "bg-amber/10 border-amber/20" : "bg-coral/10 border-coral/20";

  return (
    <div className="min-h-screen bg-surface font-body pb-16 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 pt-16 pb-24 px-6 sm:px-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md mb-6">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Global Rankings</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight flex items-center gap-4">
              Leaderboard
            </h1>
            <p className="mt-3 text-indigo-200/80 font-medium text-lg">
              Top performers based on placement readiness scores
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
              {["all", "monthly", "weekly"].map((p) => (
                <button 
                  key={p} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filters.period === p ? "bg-indigo-500 text-white shadow-md" : "text-indigo-200 hover:text-white hover:bg-white/5"}`}
                  onClick={() => setFilters({ ...filters, period: p })}
                >
                  {p === "all" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="hidden sm:block w-px bg-white/10 mx-2"></div>
            
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
              {["all", "quantitative", "logical", "technical"].map((c) => (
                <button 
                  key={c} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filters.category === c ? "bg-indigo-500 text-white shadow-md" : "text-indigo-200 hover:text-white hover:bg-white/5"}`}
                  onClick={() => setFilters({ ...filters, category: c })}
                >
                  {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 space-y-12">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-line shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-ink-soft font-medium">Updating rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-line shadow-sm text-center px-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Trophy size={32} className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink mb-2">No Rankings Yet</h3>
            <p className="text-muted max-w-md">Take some tests to establish your readiness score and appear on the global leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-4 sm:gap-6 pt-20 sm:pt-24 pb-8 px-4 overflow-x-auto custom-scrollbar">
                {[1, 0, 2].map((pos) => {
                  const p = leaderboard[pos];
                  if (!p) return null;
                  
                  const isFirst = pos === 0;
                  const isSecond = pos === 1;
                  const isThird = pos === 2;
                  
                  // Height multiplier based on rank
                  const heightClass = isFirst ? 'h-64 sm:h-72' : isSecond ? 'h-52 sm:h-60' : 'h-48 sm:h-52';
                  const bgClass = isFirst ? 'bg-gradient-to-b from-yellow-50 to-white border-yellow-200 shadow-yellow-500/10' : 
                                 isSecond ? 'bg-gradient-to-b from-slate-50 to-white border-slate-200' : 
                                            'bg-gradient-to-b from-orange-50 to-white border-orange-200';
                                            
                  const isMe = p._id === user?._id;

                  return (
                    <div key={pos} className={`relative flex flex-col items-center justify-end w-32 sm:w-48 rounded-t-3xl border-t-2 border-x-2 p-4 transition-transform hover:-translate-y-2 ${bgClass} ${isMe ? 'ring-2 ring-indigo-500 ring-offset-4' : ''} ${heightClass} shadow-xl`}>
                      
                      {/* Avatar floating above */}
                      <div className="absolute -top-10 sm:-top-12 flex flex-col items-center">
                        {isFirst ? (
                          <div className="absolute -top-6 text-yellow-400 animate-bounce"><FiStar size={24} fill="currentColor" /></div>
                        ) : null}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold text-white shadow-lg border-4 border-white ${isFirst ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : isSecond ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                          {p.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-center mt-auto w-full">
                        <div className="flex justify-center mb-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-slate-400' : 'bg-orange-500'}`}>
                            {pos + 1}
                          </span>
                        </div>
                        <h3 className="font-bold text-ink truncate w-full px-1 text-sm sm:text-base">{p.name}</h3>
                        <p className="text-[10px] sm:text-xs text-muted truncate w-full mb-3">{p.branch || "Student"}</p>
                        
                        <div className={`px-2 py-1.5 rounded-xl border ${getScoreBg(p.avgScore)}`}>
                          <span className={`font-display font-bold text-lg sm:text-xl ${getScoreColor(p.avgScore)}`}>
                            {p.avgScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
              <div className="p-6 border-b border-line flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  Complete Rankings
                </h2>
                <div className="text-sm font-medium text-muted">Top 50 Students</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-muted border-b border-line">
                      <th className="py-4 px-6 font-semibold">Rank</th>
                      <th className="py-4 px-6 font-semibold">Student</th>
                      <th className="py-4 px-6 font-semibold">Branch</th>
                      <th className="py-4 px-6 font-semibold">Avg Score</th>
                      <th className="py-4 px-6 font-semibold">Best</th>
                      <th className="py-4 px-6 font-semibold text-center">Tests</th>
                      <th className="py-4 px-6 font-semibold text-right">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {leaderboard.map((entry, i) => {
                      const isMe = entry._id === user?._id;
                      return (
                        <tr key={entry._id} className={`group transition-colors hover:bg-slate-50 ${isMe ? 'bg-indigo-50/30' : ''}`}>
                          <td className="py-4 px-6">
                            {getRankBadge(i)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${isMe ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                {entry.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-ink flex items-center gap-2">
                                  {entry.name}
                                  {isMe && <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">You</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-ink-soft font-medium">
                            {entry.branch || "—"}
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border font-bold ${getScoreBg(entry.avgScore)} ${getScoreColor(entry.avgScore)}`}>
                              {entry.avgScore}%
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-ink-soft">
                            {entry.bestScore}%
                          </td>
                          <td className="py-4 px-6 text-center font-medium text-muted">
                            {entry.totalTests}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-slate-500">
                            {entry.accuracy}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
