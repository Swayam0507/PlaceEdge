import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTestHistory, getTestAttempt } from "../services/api";
import { formatDate } from "../utils/helpers";

import { FiPieChart, FiBox, FiTerminal, FiTarget, FiBarChart2, FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";

const CATEGORY_ICONS = {
  aptitude: <FiPieChart />,
  dsa: <FiTerminal />,
  soft_skills: <FiBox />,
  career: <FiTarget />,
  mixed: <FiTarget />,
};

const TestHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [detailedAttempt, setDetailedAttempt] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== "all") params.category = filter;
      const { data } = await getTestHistory(params);
      if (data.success) setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return "score-excellent";
    if (pct >= 60) return "score-good";
    if (pct >= 40) return "score-average";
    return "score-poor";
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailedAttempt || detailedAttempt._id !== id) {
      setLoadingDetail(true);
      try {
        const { data } = await getTestAttempt(id);
        if (data.success) {
          setDetailedAttempt(data.attempt);
        }
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>
          <h1 className="font-display font-bold text-3xl text-ink">Test History</h1>
          <p className="font-body text-muted mt-2">Review your past test attempts and track progress.</p>
        </div>
        <Link to={`/exam/${filter === 'all' ? 'mixed' : filter}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-ink text-paper shadow-sm hover:bg-ink-soft transition-colors whitespace-nowrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Test
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8 bg-paper-raised p-2 rounded-2xl border border-line shadow-sm w-fit">
        {["all", "aptitude", "dsa", "soft_skills", "career", "mixed"].map((cat) => (
          <button
            key={cat}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === cat ? "bg-ink text-paper shadow-sm" : "text-ink-soft hover:bg-gray-100"}`}
            onClick={() => setFilter(cat)}
          >
            {cat !== "all" && CATEGORY_ICONS[cat]} 
            {cat === "all" ? "All Tests" 
              : cat === "dsa" ? "DSA"
              : cat === "soft_skills" ? "Soft Skills"
              : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-paper-raised border border-line rounded-2xl p-12 text-center shadow-sm">
          <div className="w-8 h-8 border-4 border-line border-t-ink rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted font-medium">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-paper-raised border border-line rounded-2xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center text-ink-soft mb-4">
            <FiBarChart2 size={32} />
          </div>
          <h3 className="font-display font-bold text-xl text-ink mb-2">No test attempts found</h3>
          <p className="text-muted mb-6">Take your first test to start building your history.</p>
          <Link to={`/exam/${filter === 'all' ? 'mixed' : filter}`} className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold bg-white border border-line text-ink hover:bg-gray-50 transition-colors shadow-sm">
            Start a Test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((attempt) => (
            <div key={attempt._id} className="bg-paper-raised border border-line rounded-2xl shadow-sm overflow-hidden transition-all hover:border-ink/20">
              <div 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleExpand(attempt._id)}
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-ink/5 text-ink flex items-center justify-center shrink-0">
                    {CATEGORY_ICONS[attempt.category] || <FiBarChart2 size={20} />}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink text-lg mb-1">
                      {attempt.category === "dsa" ? "DSA" : attempt.category === "soft_skills" ? "Soft Skills" : attempt.category.charAt(0).toUpperCase() + attempt.category.slice(1)} Test
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted font-medium">
                      <span className="flex items-center gap-1.5"><FiClock size={14}/> {formatDate(attempt.createdAt)}</span>
                      <span>•</span>
                      <span>{formatTime(attempt.timeTaken)}</span>
                      <span>•</span>
                      <span className="capitalize">{attempt.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 pl-16 sm:pl-0">
                  <div className="text-right">
                    <span className={`block font-display font-bold text-2xl ${attempt.percentage >= 80 ? 'text-emerald' : attempt.percentage >= 60 ? 'text-blue-600' : attempt.percentage >= 40 ? 'text-amber-deep' : 'text-coral'}`}>
                      {attempt.percentage}%
                    </span>
                    <span className="block text-xs font-semibold text-muted uppercase tracking-wider">
                      {attempt.score}/{attempt.totalQuestions} Score
                    </span>
                  </div>
                  <div className="text-ink-soft bg-ink/5 p-2 rounded-full">
                    {expandedId === attempt._id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
              </div>

              {expandedId === attempt._id && (
                <div className="border-t border-line bg-gray-50/50 p-5 md:p-8">
                  {loadingDetail ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-line border-t-ink rounded-full animate-spin"></div>
                    </div>
                  ) : detailedAttempt && detailedAttempt._id === attempt._id ? (
                    <div className="space-y-6">
                      <h3 className="font-display font-bold text-xl text-ink">Question Review</h3>
                      <div className="space-y-4">
                        {detailedAttempt.answers.map((ans, i) => {
                          const q = ans.questionId || {};
                          return (
                            <div
                              key={i}
                              className={`bg-white border rounded-xl p-5 shadow-sm ${ans.isCorrect ? "border-emerald/30" : "border-coral/30"}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-mono font-bold text-ink-soft bg-ink/5 px-2.5 py-1 rounded-md text-sm">Q{i + 1}</span>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs ${ans.isCorrect ? "bg-emerald-soft text-emerald" : "bg-coral/10 text-coral"}`}>
                                  {ans.isCorrect ? <><FiCheckCircle /> Correct</> : <><FiXCircle /> Wrong</>}
                                </span>
                              </div>
                              <p className="font-medium text-ink mb-4 leading-relaxed">{q.question || "Question data unavailable"}</p>
                              
                              <div className="flex flex-col gap-2.5">
                                {q.options?.map((opt, j) => {
                                  const isCorrectAnswer = j === q.correctAnswer;
                                  const isSelected = j === ans.selectedAnswer;
                                  
                                  let optionClass = "bg-gray-50 border-line text-ink-soft";
                                  if (isCorrectAnswer) {
                                    optionClass = "bg-emerald-soft border-emerald/50 text-emerald font-medium";
                                  } else if (isSelected && !ans.isCorrect) {
                                    optionClass = "bg-coral/10 border-coral/50 text-coral font-medium";
                                  }
                                  
                                  return (
                                    <div
                                      key={j}
                                      className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${optionClass}`}
                                    >
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isCorrectAnswer ? 'bg-emerald text-white' : isSelected && !ans.isCorrect ? 'bg-coral text-white' : 'bg-gray-200 text-muted'}`}>
                                        {String.fromCharCode(65 + j)}
                                      </span>
                                      <span className="pt-0.5">{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {q.explanation && (
                                <div className="mt-4 p-4 bg-ink/5 rounded-lg border border-line/50 text-sm">
                                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Explanation</span>
                                  <span className="text-ink-soft">{q.explanation}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-coral font-medium flex items-center justify-center gap-2">
                      <FiXCircle /> Failed to load details.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestHistory;
