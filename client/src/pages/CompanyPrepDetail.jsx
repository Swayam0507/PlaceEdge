import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiExternalLink, FiTrendingUp, FiTarget, FiMap, FiCheckCircle } from "react-icons/fi";
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
        <FiLoader className="mb-4 h-12 w-12 animate-spin text-indigo-500" />
        <h2 className="text-xl font-semibold text-slate-900">Generating Prep Sheet with AI...</h2>
        <p className="mt-2 text-sm">Please wait while Gemini AI creates a personalized roadmap for {companyName}.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
        <div className="rounded-2xl bg-rose-50 p-8 max-w-md w-full border border-rose-100">
          <h2 className="text-lg font-bold text-rose-700 mb-2">Oops! Something went wrong</h2>
          <p className="text-sm text-rose-600 mb-6">{error}</p>
          <Link to="/company-prep" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors">
            <FiArrowLeft /> Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link to="/company-prep" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <FiArrowLeft /> Back to all companies
      </Link>

      {/* Header */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 shadow-lg relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
              <p className="mt-1 text-indigo-200">AI-generated study guide based on {prepData?.totalQuestions || 100}+ recent questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Topics & Questions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Difficulty Distribution */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="text-indigo-500 h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">Difficulty Distribution</h2>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex mt-4">
              <div style={{ width: `${prepData?.difficulty?.easy || 30}%` }} className="bg-emerald"></div>
              <div style={{ width: `${prepData?.difficulty?.medium || 50}%` }} className="bg-amber"></div>
              <div style={{ width: `${prepData?.difficulty?.hard || 20}%` }} className="bg-coral"></div>
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-emerald">Easy ({prepData?.difficulty?.easy || 30}%)</span>
              <span className="text-amber">Medium ({prepData?.difficulty?.medium || 50}%)</span>
              <span className="text-coral">Hard ({prepData?.difficulty?.hard || 20}%)</span>
            </div>
          </section>

          {/* Top Topics */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-indigo-500 h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">Most Asked Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {prepData?.mostAskedTopics?.map((topic, i) => (
                <div key={i} className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
                  {topic.name}
                  <span className="rounded-full bg-indigo-200 px-2 text-xs text-indigo-800">{topic.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Questions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Top 10 Must-Do Questions</h2>
            </div>
            <div className="space-y-3">
              {prepData?.topQuestions?.map((q, i) => (
                <a 
                  key={i} 
                  href={q.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${q.title}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">{i + 1}</span>
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-600">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                      q.difficulty === 'Easy' ? 'bg-emerald-soft text-emerald' : 
                      q.difficulty === 'Medium' ? 'bg-amber/15 text-amber' : 
                      'bg-coral/15 text-coral'
                    }`}>
                      {q.difficulty}
                    </span>
                    <FiExternalLink className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                </a>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column - Roadmap & Tips */}
        <div className="space-y-8">
          
          {/* Roadmap */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FiMap className="text-indigo-500 h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">4-Week Prep Plan</h2>
            </div>
            
            <div className="relative border-l border-slate-200 ml-3 space-y-8">
              {prepData?.roadmap?.map((week, i) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm"></span>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600">{week.week}</div>
                  <h3 className="text-sm font-bold text-slate-900">{week.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{week.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pro Tips */}
          <section className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
            <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span> Insider Pro Tips
            </h2>
            <ul className="space-y-3">
              {prepData?.proTips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-indigo-500" />
                  <span>{tip}</span>
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
