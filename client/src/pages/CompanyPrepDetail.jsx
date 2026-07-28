import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ExternalLink, TrendingUp, Target, Map, CheckCircle2, Lightbulb } from "lucide-react";
import api from "../services/api";
import ReactMarkdown from 'react-markdown';

const CompanyPrepDetail = () => {
  const { companyName } = useParams();
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-slate-500">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
        <h2 className="text-xl font-bold text-slate-900">Generating Prep Sheet with AI...</h2>
        <p className="mt-2 text-sm font-medium">Please wait while Gemini AI creates a personalized roadmap for {companyName}.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <div className="rounded-3xl bg-red-50 p-8 max-w-md w-full border border-red-100 shadow-sm">
          <h2 className="text-lg font-bold text-red-700 mb-2">Oops! Something went wrong</h2>
          <p className="text-sm font-medium text-red-600 mb-6">{error}</p>
          <Link to="/company-prep" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <ArrowLeft size={16} /> Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link to="/company-prep" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to all companies
      </Link>

      {/* Header */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 shadow-lg relative border border-slate-800">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-inner overflow-hidden shrink-0">
              <img 
                src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${companyName.toLowerCase().replace(/ /g, '')}.com&size=128`} 
                alt={`${companyName} logo`} 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=ffffff&color=4338ca&rounded=false&font-size=0.4`;
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{companyName} Interview Prep</h1>
              <p className="mt-1 text-slate-300 font-medium">AI-generated study guide based on {prepData?.totalQuestions || 100}+ recent questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Topics & Questions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Difficulty Distribution */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-blue-500 h-6 w-6" strokeWidth={2.5} />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Difficulty Distribution</h2>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex mt-6">
              <div style={{ width: `${prepData?.difficulty?.easy || 30}%` }} className="bg-emerald-500"></div>
              <div style={{ width: `${prepData?.difficulty?.medium || 50}%` }} className="bg-amber-500"></div>
              <div style={{ width: `${prepData?.difficulty?.hard || 20}%` }} className="bg-red-500"></div>
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-emerald-600">Easy ({prepData?.difficulty?.easy || 30}%)</span>
              <span className="text-amber-600">Medium ({prepData?.difficulty?.medium || 50}%)</span>
              <span className="text-red-600">Hard ({prepData?.difficulty?.hard || 20}%)</span>
            </div>
          </section>

          {/* Top Topics */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-blue-500 h-6 w-6" strokeWidth={2.5} />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Most Asked Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {prepData?.mostAskedTopics?.map((topic, i) => (
                <div key={i} className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                  {topic.name}
                  <span className="rounded-lg bg-blue-200 px-2 py-0.5 text-xs text-blue-800">{topic.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Questions */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Top 10 Must-Do Questions</h2>
            </div>
            <div className="space-y-3">
              {prepData?.topQuestions?.map((q, i) => (
                <a 
                  key={i} 
                  href={q.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${q.title}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">{i + 1}</span>
                    <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 
                      q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Roadmap & Tips */}
        <div className="space-y-8">
          
          {/* Roadmap */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Map className="text-blue-500 h-6 w-6" strokeWidth={2.5} />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">4-Week Prep Plan</h2>
            </div>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {prepData?.roadmap?.map((week, i) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-sm"></span>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600">{week.week}</div>
                  <h3 className="text-sm font-bold text-slate-900">{week.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 font-medium leading-relaxed">{week.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pro Tips */}
          <section className="rounded-3xl bg-blue-50 p-6 border border-blue-100">
            <h2 className="text-xl font-bold text-blue-900 mb-5 flex items-center gap-2 tracking-tight">
              <Lightbulb className="h-6 w-6 text-amber-500" /> Insider Pro Tips
            </h2>
            <ul className="space-y-4">
              {prepData?.proTips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-blue-800">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-blue-500 h-5 w-5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CompanyPrepDetail;
