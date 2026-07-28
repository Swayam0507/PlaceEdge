import { useState, useEffect } from "react";
import { getLeaderboard } from "../services/api";
import { FiAward, FiStar } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

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
    if (i === 0) return <span className="rank-medal gold" style={{color: '#fbbf24'}}><FiAward /></span>;
    if (i === 1) return <span className="rank-medal silver" style={{color: '#94a3b8'}}><FiStar /></span>;
    if (i === 2) return <span className="rank-medal bronze" style={{color: '#b45309'}}><FiStar /></span>;
    return <span className="rank-number">#{i + 1}</span>;
  };

  const getScoreColor = (s) => s >= 70 ? "#10b981" : s >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <div className="page-header-col">
        <h1><FiAward /> Leaderboard</h1>
        <p className="subtitle">Top performers based on placement readiness scores</p>
      </div>   {/* Filters */}
        <div className="leaderboard-filters">
          <div className="filter-group">
            <label>Period</label>
            <div className="filter-tabs">
              {["all", "monthly", "weekly"].map((p) => (
                <button key={p} className={`filter-tab ${filters.period === p ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, period: p })}>
                  {p === "all" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-tabs">
              {["all", "quantitative", "logical", "technical"].map((c) => (
                <button key={c} className={`filter-tab ${filters.category === c ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, category: c })}>
                  {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading rankings...</p></div></div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state"><p>No data yet. Take some tests to appear on the leaderboard!</p></div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="podium">
                {[1, 0, 2].map((pos) => {
                  const p = leaderboard[pos];
                  if (!p) return null;
                  return (
                    <div key={pos} className={`podium-card pos-${pos + 1} ${p._id === user?._id ? "is-me" : ""}`}>
                      <div className="podium-rank">{getRankBadge(pos)}</div>
                      <div className="podium-avatar">{p.name?.charAt(0).toUpperCase()}</div>
                      <h3 className="podium-name">{p.name}</h3>
                      <p className="podium-branch">{p.branch || "—"}</p>
                      <div className="podium-score" style={{ color: getScoreColor(p.avgScore) }}>
                        {p.avgScore}%
                      </div>
                      <span className="podium-tests">{p.totalTests} tests</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th><th>Student</th><th>Branch</th>
                    <th>Avg Score</th><th>Best</th><th>Tests</th><th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => (
                    <tr key={entry._id} className={entry._id === user?._id ? "is-me" : ""}>
                      <td>{getRankBadge(i)}</td>
                      <td className="user-name-cell">
                        <div className="user-avatar">{entry.name?.charAt(0).toUpperCase()}</div>
                        <span>{entry.name} {entry._id === user?._id && <span className="you-badge">You</span>}</span>
                      </td>
                      <td>{entry.branch || "—"}</td>
                      <td><span style={{ color: getScoreColor(entry.avgScore), fontWeight: 700 }}>{entry.avgScore}%</span></td>
                      <td>{entry.bestScore}%</td>
                      <td>{entry.totalTests}</td>
                      <td>{entry.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
