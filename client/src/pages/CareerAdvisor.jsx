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
} from "react-icons/fi";
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

  // Difficulty badge color
  const diffColor = (d) => {
    if (d === "Easy") return { bg: "#ecfdf5", color: "#10b981", border: "#a7f3d0" };
    if (d === "Medium") return { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" };
    return { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md">
          <FiTarget size={24} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">
            AI Career Advisor
          </h1>
          <p className="font-body text-muted text-sm mt-0.5">
            Personalized insights based on your mock test performance
          </p>
        </div>
      </div>

      {/* CTA / Loading / Error */}
      {!advice && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 24px",
            }}
          >
            <FiCpu size={36} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>
            Get Your Personalized Career Roadmap
          </h2>
          <p
            style={{
              color: "#64748b",
              maxWidth: "480px",
              margin: "0 auto 28px",
              lineHeight: 1.6,
              fontSize: "0.95rem",
            }}
          >
            Our AI will analyze your test scores, strengths, and weaknesses to create a tailored
            career plan with company recommendations and a 30-day study schedule.
          </p>
          {error && (
            <p style={{ color: "#ef4444", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</p>
          )}
          <button
            onClick={analyze}
            style={{
              padding: "14px 36px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(236,72,153,0.3)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiZap size={18} /> Analyze My Profile
            </span>
          </button>
        </div>
      )}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
          }}
        >
          <div className="spinner" style={{ margin: "0 auto 24px" }} />
          <h3 style={{ color: "#1e293b", marginBottom: "8px" }}>Analyzing your profile...</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            AI is reviewing your test history and generating personalized advice 🤖
          </p>
        </div>
      )}

      {/* Results */}
      {advice && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Re-analyze button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={analyze}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <FiRefreshCw size={14} /> Re-analyze
            </button>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#6366f1", margin: 0 }}>
                  {stats.totalTests}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, margin: 0 }}>
                  Tests Taken
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: 0 }}>
                  {stats.avgScore}%
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, margin: 0 }}>
                  Avg Score
                </p>
              </div>
              {stats.categoryBreakdown?.map((cat) => (
                <div
                  key={cat.category}
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", margin: 0 }}>
                    {cat.avgPercentage}%
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      fontWeight: 600,
                      margin: 0,
                      textTransform: "capitalize",
                    }}
                  >
                    {cat.category}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Overall Assessment */}
          <div
            style={{
              padding: "24px",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "12px",
              }}
            >
              <FiCpu style={{ color: "#6366f1" }} /> Overall Assessment
            </h3>
            <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>
              {advice.overallAssessment}
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div
              style={{
                padding: "24px",
                backgroundColor: "#fff",
                border: "1px solid #a7f3d0",
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#10b981",
                  marginBottom: "16px",
                }}
              >
                <FiTrendingUp /> Strengths
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {advice.strengths?.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "0.9rem",
                      color: "#475569",
                    }}
                  >
                    <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                padding: "24px",
                backgroundColor: "#fff",
                border: "1px solid #fecaca",
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#ef4444",
                  marginBottom: "16px",
                }}
              >
                <FiAlertTriangle /> Areas to Improve
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {advice.weaknesses?.map((w, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "0.9rem",
                      color: "#475569",
                    }}
                  >
                    <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Companies */}
          <div
            style={{
              padding: "24px",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "16px",
              }}
            >
              <FiAward style={{ color: "#f59e0b" }} /> Recommended Companies
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {advice.recommendedCompanies?.map((c, i) => {
                const d = diffColor(c.difficulty);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      backgroundColor: "#fafafa",
                      borderRadius: "10px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{c.reason}</p>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: d.bg,
                        color: d.color,
                        border: `1px solid ${d.border}`,
                        flexShrink: 0,
                      }}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 30-Day Plan */}
          <div
            style={{
              padding: "24px",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "20px",
              }}
            >
              <FiCalendar style={{ color: "#6366f1" }} /> 30-Day Study Plan
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
              {advice.thirtyDayPlan?.map((week) => (
                <div
                  key={week.week}
                  style={{
                    padding: "18px",
                    backgroundColor: "#fafafa",
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: "#6366f1",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      W{week.week}
                    </span>
                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                      {week.focus}
                    </span>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {week.tasks?.map((task, j) => (
                      <li
                        key={j}
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "6px",
                        }}
                      >
                        <span style={{ color: "#6366f1" }}>•</span> {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          {advice.skillGaps?.length > 0 && (
            <div
              style={{
                padding: "24px",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "14px",
                }}
              >
                <FiZap style={{ color: "#06b6d4" }} /> Skill Gaps to Fill
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {advice.skillGaps.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      backgroundColor: "#ecfeff",
                      color: "#0891b2",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "1px solid #a5f3fc",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Note */}
          {advice.motivationalNote && (
            <div
              style={{
                padding: "24px",
                background: "linear-gradient(135deg, #6366f108, #a855f710)",
                border: "1px solid #c7d2fe",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#4338ca",
                  fontWeight: 600,
                  lineHeight: 1.6,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                💡 "{advice.motivationalNote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerAdvisor;
