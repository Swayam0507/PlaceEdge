import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink, TrendingUp, Target, Map, CheckCircle2, Lightbulb, PlayCircle, BookOpen } from "lucide-react";
import api from "../services/api";
import MockAnswerForm from "../components/MockAnswerForm";

const CompanyPrepDetail = () => {
  const { companyName } = useParams();
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  useEffect(() => {
    const fetchPrepData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ai/company-prep/${companyName}`);
        if (res.data.success) {
          setPrepData(res.data.data);
        } else {
          setError("Failed to fetch preparation data.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error generating prep sheet. Ensure Gemini API key is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrepData();
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-slate-500 font-body">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
          <Loader2 className="relative mb-6 h-14 w-14 animate-spin text-indigo-600 drop-shadow-md" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">Generating Prep Sheet with AI...</h2>
        <p className="mt-2 text-sm font-medium text-ink-soft max-w-sm text-center">
          Please wait while Gemini AI analyzes thousands of interview experiences to create a personalized roadmap for {companyName}.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center font-body">
        <div className="rounded-3xl bg-coral/5 p-8 max-w-md w-full border border-coral/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-coral"></div>
          <h2 className="text-xl font-bold text-coral mb-3">Oops! Something went wrong</h2>
          <p className="text-sm font-medium text-coral/80 mb-8">{error}</p>
          <Link to="/company-prep" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink shadow-sm border border-line hover:bg-slate-50 hover:border-slate-300 transition-all">
            <ArrowLeft size={16} /> Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const easyPct = parseFloat(prepData?.difficulty?.easy) || 30;
  const medPct = parseFloat(prepData?.difficulty?.medium) || 50;
  const hardPct = parseFloat(prepData?.difficulty?.hard) || 20;

  return (
    <div className="min-h-screen bg-surface font-body pb-16 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link to="/company-prep" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to all companies
        </Link>

        {/* Header Section */}
        <div className="mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-indigo-950 shadow-2xl relative border border-indigo-900/50">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          
          <div className="relative p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden shrink-0 border border-white/10 relative group">
                <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                <img 
                  src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${companyName.toLowerCase().replace(/ /g, '')}.com&size=128`} 
                  alt={`${companyName} logo`} 
                  className="h-12 w-12 object-contain relative z-10"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=ffffff&color=4338ca&rounded=false&font-size=0.4`;
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-wider backdrop-blur-sm">
                    AI Generated Profile
                  </span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">{companyName} Interview Prep</h1>
                <p className="mt-2 text-indigo-200/80 font-medium text-lg flex items-center gap-2">
                  <BookOpen size={18} /> Based on {prepData?.totalQuestions || 100}+ recent technical questions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - Topics & Questions (Spans 7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Difficulty Distribution */}
            <section className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Target size={20} strokeWidth={2.5} /></div>
                <h2 className="font-display text-xl font-bold text-ink tracking-tight">Difficulty Distribution</h2>
              </div>
              
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 flex shadow-inner">
                <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 hover:brightness-110 transition-all cursor-help" title="Easy"></div>
                <div style={{ width: `${medPct}%` }} className="bg-amber-500 hover:brightness-110 transition-all cursor-help" title="Medium"></div>
                <div style={{ width: `${hardPct}%` }} className="bg-coral hover:brightness-110 transition-all cursor-help" title="Hard"></div>
              </div>
              
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Easy</span>
                  <span className="font-display text-lg font-bold text-emerald-700">{easyPct}%</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Medium</span>
                  <span className="font-display text-lg font-bold text-amber-700">{medPct}%</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-coral/5 border border-coral/10">
                  <span className="text-[10px] font-bold text-coral uppercase tracking-wider mb-1">Hard</span>
                  <span className="font-display text-lg font-bold text-coral">{hardPct}%</span>
                </div>
              </div>
            </section>

            {/* Most Asked Topics */}
            <section className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20} strokeWidth={2.5} /></div>
                <h2 className="font-display text-xl font-bold text-ink tracking-tight">Most Asked Topics</h2>
              </div>
              <div className="space-y-4">
                {prepData?.mostAskedTopics?.map((topic, i) => (
                  <div key={i} className="group rounded-2xl border border-line bg-slate-50/50 p-5 transition-all hover:border-indigo-200 hover:shadow-sm hover:bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-bold text-ink group-hover:text-indigo-700 transition-colors">{topic.name}</h3>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-line text-xs font-bold text-ink-soft shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-all">
                        {topic.count} questions
                      </span>
                    </div>
                    {topic.questions && topic.questions.length > 0 ? (
                      <ul className="space-y-3 pt-2 border-t border-line/50">
                        {topic.questions.map((q, j) => {
                          const qId = `topic-${i}-q-${j}`;
                          const isActive = activeQuestionId === qId;
                          return (
                            <li key={j} className="flex flex-col gap-3">
                              <button 
                                onClick={() => setActiveQuestionId(isActive ? null : qId)}
                                className="group/btn flex items-start gap-3 text-sm text-left hover:text-indigo-700 transition-colors w-full"
                              >
                                <div className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${isActive ? 'bg-indigo-600' : 'bg-indigo-300 group-hover/btn:bg-indigo-500'}`}></div>
                                <span className={`leading-relaxed font-medium transition-colors ${isActive ? 'text-indigo-900' : 'text-ink-soft'}`}>{q}</span>
                              </button>
                              
                              <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'block' : 'hidden'}`}>
                                <MockAnswerForm question={q} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted italic">Ask Gemini in Practice Hub for specific questions on this topic.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Top 10 Must-Do Questions */}
            <section className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-ink tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl"><PlayCircle size={20} /></div>
                  Top Must-Do Questions
                </h2>
              </div>
              <div className="space-y-3">
                {prepData?.topQuestions?.map((q, i) => {
                  const isEasy = q.difficulty?.toLowerCase() === 'easy';
                  const isMed = q.difficulty?.toLowerCase() === 'medium';
                  const borderColor = isEasy ? 'border-l-emerald-500' : isMed ? 'border-l-amber-500' : 'border-l-coral';
                  const badgeColor = isEasy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isMed ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-coral/10 text-coral border-coral/20';
                  
                  return (
                    <a 
                      key={i} 
                      href={q.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${q.title}`}
                      target="_blank" 
                      rel="noreferrer"
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised p-4 transition-all hover:border-indigo-200 hover:shadow-md border-l-4 ${borderColor}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-line text-sm font-display font-bold text-ink-soft shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                          {i + 1}
                        </span>
                        <span className="font-bold text-ink group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {q.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full pl-14 sm:pl-0">
                        <span className={`rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                          {q.difficulty}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-slate-50 border border-line flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                          <ExternalLink size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN - Roadmap & Tips (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 4-Week Prep Plan Timeline */}
            <section className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Map size={20} strokeWidth={2.5} /></div>
                <h2 className="font-display text-xl font-bold text-ink tracking-tight">4-Week Prep Plan</h2>
              </div>
              
              <div className="relative border-l-[3px] border-dashed border-slate-200 ml-4 space-y-8 py-2">
                {prepData?.roadmap?.map((week, i) => (
                  <div key={i} className="relative pl-8 group">
                    {/* Glowing Node */}
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white bg-slate-300 shadow-sm group-hover:bg-purple-500 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-300"></div>
                    
                    <div className="inline-block mb-2 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                      {week.week}
                    </div>
                    <h3 className="font-display text-base font-bold text-ink group-hover:text-purple-700 transition-colors">{week.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{week.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Insider Pro Tips */}
            <section className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 sm:p-8 border border-amber-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-amber-500/10">
                <Lightbulb size={120} />
              </div>
              <h2 className="font-display text-xl font-bold text-amber-900 mb-6 flex items-center gap-3 tracking-tight relative z-10">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shadow-sm"><Lightbulb size={20} /></div>
                Insider Pro Tips
              </h2>
              <ul className="space-y-4 relative z-10">
                {prepData?.proTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-amber-900/80 bg-white/40 p-4 rounded-2xl border border-amber-100/50 backdrop-blur-sm">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-amber-500 h-5 w-5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPrepDetail;
