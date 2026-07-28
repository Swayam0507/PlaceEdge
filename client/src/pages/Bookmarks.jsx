import { useState, useEffect } from "react";
import { getBookmarks, toggleBookmark } from "../services/api";
import { Bookmark, BookmarkMinus, Eye, EyeOff, Lightbulb, CheckCircle2 } from "lucide-react";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => { fetchBookmarks(); }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRemove = async (questionId) => {
    try {
      await toggleBookmark(questionId);
      setBookmarks(bookmarks.filter((b) => b.questionId?._id !== questionId));
    } catch (err) { console.error(err); }
  };

  const toggleReveal = (id) => {
    setRevealedAnswers({ ...revealedAnswers, [id]: !revealedAnswers[id] });
  };

  const getDifficultyColor = (diff) => {
    if (diff === "easy") return "bg-emerald/10 text-emerald border-emerald/20";
    if (diff === "medium") return "bg-amber/10 text-amber border-amber/20";
    return "bg-coral/10 text-coral border-coral/20";
  };

  return (
    <div className="min-h-screen bg-surface font-body pb-16 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 pt-16 pb-24 px-6 sm:px-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md mb-6 shadow-lg text-pink-400">
            <Bookmark size={32} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Bookmarked Questions
          </h1>
          <p className="text-indigo-200/80 font-medium text-lg max-w-lg">
            Your saved collection of tricky and important questions for quick revision.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-100 text-sm font-semibold shadow-inner">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-line shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-ink-soft font-medium">Loading your bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-line shadow-sm text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bookmark size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink mb-2">No Bookmarks Yet</h3>
            <p className="text-muted max-w-md">Save tricky questions during tests for later revision. They will appear here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((bm) => {
              const q = bm.questionId;
              if (!q) return null;
              const revealed = revealedAnswers[q._id];
              
              return (
                <div key={bm._id} className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 group relative">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        {q.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemove(q._id)}
                      className="p-2 text-slate-400 hover:text-coral hover:bg-coral/10 rounded-xl transition-colors shrink-0"
                      title="Remove Bookmark"
                    >
                      <BookmarkMinus size={20} />
                    </button>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-ink leading-relaxed mb-6">
                    {q.question}
                  </h3>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.correctAnswer;
                        const showAsCorrect = revealed && isCorrect;
                        const showAsFaded = revealed && !isCorrect;
                        
                        return (
                          <div 
                            key={i} 
                            className={`flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                              showAsCorrect 
                                ? "bg-emerald/5 border-emerald text-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                                : "bg-slate-50 border-line text-ink-soft"
                            } ${showAsFaded ? "opacity-40" : "opacity-100"}`}
                          >
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 shrink-0 ${
                              showAsCorrect ? "bg-emerald text-white" : "bg-white border border-line text-slate-400"
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="font-medium text-sm sm:text-base">{opt}</span>
                            {showAsCorrect && <CheckCircle2 size={20} className="text-emerald ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions & Explanation */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-4 border-t border-line/50">
                    <button 
                      onClick={() => toggleReveal(q._id)}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
                        revealed 
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      {revealed ? "Hide Answer" : "Reveal Answer"}
                    </button>
                    
                    {revealed && q.explanation && (
                      <div className="flex gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex-grow animate-fade-in text-sm">
                        <Lightbulb size={20} className="text-amber shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-indigo-900 block mb-1">Explanation</span>
                          <p className="text-indigo-800/80 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
