import { useState, useEffect } from "react";
import { getInterviewQuestions, getInterviewCompanies } from "../services/api";
import api from "../services/api";
import { FiMic, FiCpu, FiMessageCircle, FiTerminal, FiUserCheck, FiList, FiZap, FiPaperclip } from "react-icons/fi";
import { BiBuildingHouse } from "react-icons/bi";
import ReactMarkdown from "react-markdown";

const MockAnswerForm = ({ question }) => {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const res = await api.post("/ai/interview-feedback", { question: question.question, answer });
      if (res.data.success) {
        setFeedback(res.data.feedback);
      } else {
        setError(res.data.message || "Failed to get feedback");
      }
    } catch (err) {
      setError("AI feature requires GEMINI_API_KEY in the backend .env");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-answer-section" style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiCpu /> Practice AI Mock Answer</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here to get AI feedback..."
          rows={4}
          style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'vertical' }}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading || !answer.trim()} style={{ alignSelf: 'flex-start' }}>
          {loading ? "Analyzing..." : "Get Feedback"}
        </button>
      </form>
      {error && <p className="error-message" style={{ marginTop: '1rem' }}>{error}</p>}
      {feedback && (
        <div className="markdown-body" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--primary-color)', borderRadius: 'var(--radius-sm)' }}>
          <h5 style={{ marginBottom: '0.5rem' }}>Feedback</h5>
          <div style={{ lineHeight: '1.6' }}>
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};


const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", company: "", difficulty: "" });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { fetchQuestions(); }, [filters]);

  const fetchCompanies = async () => {
    try { const { data } = await getInterviewCompanies(); setCompanies(data.companies || []); }
    catch (err) { /* ignore */ }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await getInterviewQuestions(filters);
      setQuestions(data.questions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const categoryInfo = {
    hr: { icon: <FiMessageCircle />, color: "#f59e0b" },
    technical: { icon: <FiTerminal />, color: "#6366f1" },
    behavioral: { icon: <FiUserCheck />, color: "#10b981" },
    "company-specific": { icon: <BiBuildingHouse />, color: "#06b6d4" },
  };

  const difficultyColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  return (
    <div className="interview-page">
      <div className="interview-container">
        <div className="page-header-col">
          <h1><FiMic /> Interview Preparation</h1>
          <p className="subtitle">Practice common interview questions with expert tips and sample answers</p>
        </div>

        {/* Category Cards */}
        <div className="interview-category-cards">
          {[
            { key: "", label: "All", icon: <FiList />, count: questions.length },
            { key: "hr", label: "HR Questions", icon: <FiMessageCircle /> },
            { key: "technical", label: "Technical", icon: <FiTerminal /> },
            { key: "behavioral", label: "Behavioral", icon: <FiUserCheck /> },
            { key: "company-specific", label: "Company Specific", icon: <BiBuildingHouse /> },
          ].map((cat) => (
            <button key={cat.key}
              className={`interview-cat-card ${filters.category === cat.key ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, category: cat.key })}>
              <span className="cat-icon" style={{display: 'flex'}}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="interview-filters">
          <select value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} className="interview-select">
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="interview-select">
            <option value="">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading questions...</p></div></div>
        ) : questions.length === 0 ? (
          <div className="empty-state"><p>No interview questions found. Check back later or adjust filters.</p></div>
        ) : (
          <div className="interview-questions-list">
            {questions.map((q) => (
              <div key={q._id} className={`interview-q-card ${expandedId === q._id ? "expanded" : ""}`}>
                <div className="interview-q-header" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                  <div className="interview-q-meta">
                    <span className="interview-q-cat" style={{ background: `${categoryInfo[q.category]?.color}20`, color: categoryInfo[q.category]?.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {categoryInfo[q.category]?.icon} {q.category}
                    </span>
                    <span className="interview-q-diff" style={{ color: difficultyColor[q.difficulty] }}>
                      {q.difficulty}
                    </span>
                    {q.company && <span className="interview-q-company" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BiBuildingHouse /> {q.company}</span>}
                  </div>
                  <h3 className="interview-q-text">{q.question}</h3>
                  <svg className={`expand-chevron ${expandedId === q._id ? "open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {expandedId === q._id && (
                  <div className="interview-q-body">
                    {q.sampleAnswer && (
                      <div className="sample-answer">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiZap /> Sample Answer</h4>
                        <p>{q.sampleAnswer}</p>
                      </div>
                    )}
                    {q.tips && q.tips.length > 0 && (
                      <div className="answer-tips">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPaperclip /> Tips</h4>
                        <ul>{q.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                      </div>
                    )}
                    {q.tags && q.tags.length > 0 && (
                      <div className="interview-tags">
                        {q.tags.map((t, i) => <span key={i} className="interview-tag">{t}</span>)}
                      </div>
                    )}
                    <MockAnswerForm question={q} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
