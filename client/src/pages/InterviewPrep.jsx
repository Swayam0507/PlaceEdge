import { useState, useEffect } from "react";
import { getInterviewQuestions, getInterviewCompanies } from "../services/api";
import api from "../services/api";
import { FiMic, FiCpu, FiMessageCircle, FiTerminal, FiUserCheck, FiList, FiZap, FiPaperclip, FiChevronDown, FiSearch, FiFilter } from "react-icons/fi";
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
    <div className="mt-6 p-5 sm:p-6 bg-paper-raised border border-line rounded-2xl">
      <h4 className="font-display font-bold text-ink flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FiCpu size={18} /></div>
        Practice AI Mock Answer
      </h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here to get AI feedback on tone, technical accuracy, and structure..."
          rows={4}
          className="w-full px-4 py-3 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium resize-y custom-scrollbar text-ink"
          required
        />
        <button 
          type="submit" 
          disabled={loading || !answer.trim()} 
          className="self-end px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          {loading ? (
             <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analyzing...</>
          ) : "Get AI Feedback"}
        </button>
      </form>
      {error && <p className="text-coral text-sm mt-3 font-medium bg-coral/10 p-3 rounded-lg border border-coral/20">{error}</p>}
      {feedback && (
        <div className="mt-6 p-5 bg-paper border border-indigo-100 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500"></div>
          <h5 className="font-bold text-indigo-900 mb-2 text-sm uppercase tracking-wider">AI Analysis</h5>
          <div className="prose prose-sm prose-indigo max-w-none text-ink-soft">
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

  const categories = [
    { key: "", label: "All Questions", icon: <FiList />, color: "text-slate-500", bg: "bg-slate-100", activeBg: "bg-slate-800 text-white" },
    { key: "hr", label: "HR & Culture", icon: <FiMessageCircle />, color: "text-amber-500", bg: "bg-amber-50", activeBg: "bg-amber-500 text-white" },
    { key: "technical", label: "Technical", icon: <FiTerminal />, color: "text-indigo-500", bg: "bg-indigo-50", activeBg: "bg-indigo-600 text-white" },
    { key: "behavioral", label: "Behavioral", icon: <FiUserCheck />, color: "text-emerald-500", bg: "bg-emerald-50", activeBg: "bg-emerald-500 text-white" },
    { key: "company-specific", label: "Company Specific", icon: <BiBuildingHouse />, color: "text-cyan-500", bg: "bg-cyan-50", activeBg: "bg-cyan-500 text-white" },
  ];

  const diffColors = {
    easy: "text-emerald-600 bg-emerald-50 border-emerald-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    hard: "text-coral bg-coral/10 border-coral/20"
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8 font-body animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-line relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <FiMic size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-ink">Interview Preparation</h1>
            </div>
            <p className="text-muted text-lg max-w-2xl">
              Master your next interview. Practice categorized questions, review expert tips, and get real-time AI feedback on your mock answers.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isActive = filters.category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilters({ ...filters, category: cat.key })}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group ${
                  isActive 
                    ? `${cat.activeBg} border-transparent shadow-md` 
                    : `bg-white border-line hover:border-indigo-300 hover:shadow-sm`
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 transition-colors ${isActive ? 'bg-white/20' : cat.bg} ${isActive ? 'text-white' : cat.color}`}>
                  {cat.icon}
                </div>
                <span className={`text-sm font-bold text-center ${isActive ? 'text-white' : 'text-ink-soft group-hover:text-ink'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-line shadow-sm">
          <div className="flex-1 flex items-center gap-3">
            <FiFilter className="text-muted ml-2" />
            <span className="text-sm font-bold text-ink-soft uppercase tracking-wider hidden sm:block">Filters</span>
          </div>
          <div className="flex-1">
            <select 
              value={filters.company} 
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className="w-full px-4 py-2.5 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-ink appearance-none cursor-pointer"
            >
              <option value="">All Companies</option>
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <select 
              value={filters.difficulty} 
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-4 py-2.5 bg-paper-raised border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-ink appearance-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-ink-soft">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-line text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch size={28} />
              </div>
              <h3 className="font-display font-bold text-xl text-ink mb-2">No Questions Found</h3>
              <p className="text-muted max-w-md mx-auto">Try adjusting your category, company, or difficulty filters to see more results.</p>
            </div>
          ) : (
            questions.map((q) => {
              const isExpanded = expandedId === q._id;
              const catTheme = categories.find(c => c.key === q.category) || categories[0];
              
              return (
                <div key={q._id} className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-line shadow-sm hover:border-indigo-200'}`}>
                  
                  {/* Header / Trigger */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : q._id)}
                    className="p-5 sm:p-6 cursor-pointer flex gap-4 select-none group"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${catTheme.bg} ${catTheme.color} border-${catTheme.color.replace('text-', '')}/20`}>
                          {catTheme.icon} {q.category}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${diffColors[q.difficulty] || diffColors.medium}`}>
                          {q.difficulty}
                        </span>
                        {q.company && (
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <BiBuildingHouse /> {q.company}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg text-ink leading-snug group-hover:text-indigo-600 transition-colors pr-8">
                        {q.question}
                      </h3>
                    </div>
                    <div className="shrink-0 pt-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                        <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? '-rotate-180' : ''}`} size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Body (Expanded Content) */}
                  <div className={`px-5 sm:px-6 pb-6 pt-0 border-t border-line/50 mt-2 animate-fade-in ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="pt-6 space-y-6">
                      
                      {q.sampleAnswer && (
                        <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl relative">
                          <div className="absolute -left-px top-5 bottom-5 w-1 bg-amber-400 rounded-r-md"></div>
                          <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                            <FiZap className="text-amber-500" /> Sample Answer Structure
                          </h4>
                          <p className="text-ink-soft text-sm leading-relaxed whitespace-pre-wrap">{q.sampleAnswer}</p>
                        </div>
                      )}

                      {q.tips && q.tips.length > 0 && (
                        <div>
                          <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                            <div className="p-1 bg-emerald-100 rounded text-emerald-600"><FiPaperclip size={14}/></div>
                            Expert Tips
                          </h4>
                          <ul className="space-y-2">
                            {q.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {q.tags.map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <MockAnswerForm question={q} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default InterviewPrep;
