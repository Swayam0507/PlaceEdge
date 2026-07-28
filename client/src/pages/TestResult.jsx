import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiAward, FiStar, FiActivity, FiBook, FiCheckCircle, FiXCircle, FiClock, FiTag, FiRefreshCw, FiList } from "react-icons/fi";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, timeTaken } = location.state || {};

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-soft mb-6">
          <FiActivity size={32} />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink mb-2">No Results Found</h2>
        <p className="text-muted mb-8">Take a test first to see your detailed performance analytics.</p>
        <Link to="/practice" className="bg-ink text-paper px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-ink-soft transition-colors">
          Take a Test
        </Link>
      </div>
    );
  }

  const { score, totalQuestions, percentage, detailedResults, category } = result;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { label: "Excellent", color: "text-emerald", bg: "bg-emerald-soft border-emerald/20", icon: <FiAward className="text-emerald" size={32} /> };
    if (pct >= 70) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: <FiStar className="text-blue-600" size={32} /> };
    if (pct >= 50) return { label: "Average", color: "text-amber-deep", bg: "bg-amber/10 border-amber/20", icon: <FiActivity className="text-amber-deep" size={32} /> };
    return { label: "Needs Improvement", color: "text-coral", bg: "bg-coral/10 border-coral/20", icon: <FiBook className="text-coral" size={32} /> };
  };

  const grade = getGrade(percentage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      {/* Result Hero */}
      <div className="bg-paper-raised border border-line rounded-3xl p-8 md:p-12 shadow-card mb-10 text-center relative overflow-hidden">
        
        {/* Grade Badge */}
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border ${grade.bg} mb-6`}>
          {grade.icon}
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-muted opacity-80 mb-0.5">Performance</p>
            <p className={`font-display font-bold text-xl ${grade.color}`}>{grade.label}</p>
          </div>
        </div>
        
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-10">Test Complete!</h1>

        <div className="relative w-48 h-48 mx-auto mb-12">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#EFEBE2" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={`${grade.color} transition-all duration-1000 ease-out`}
              style={{ strokeDasharray: 339.292, strokeDashoffset: 339.292 - (percentage / 100) * 339.292 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-5xl text-ink">{percentage}%</span>
            <span className="font-mono text-muted mt-1">{score}/{totalQuestions} correct</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-soft text-emerald flex items-center justify-center mx-auto mb-3"><FiCheckCircle size={20} /></div>
            <span className="block font-display font-bold text-2xl text-ink mb-1">{score}</span>
            <span className="block text-xs font-semibold text-muted uppercase tracking-wider">Correct</span>
          </div>
          <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-3"><FiXCircle size={20} /></div>
            <span className="block font-display font-bold text-2xl text-ink mb-1">{totalQuestions - score}</span>
            <span className="block text-xs font-semibold text-muted uppercase tracking-wider">Wrong</span>
          </div>
          <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-ink/5 text-ink-soft flex items-center justify-center mx-auto mb-3"><FiClock size={20} /></div>
            <span className="block font-display font-bold text-2xl text-ink mb-1">{formatTime(timeTaken || 0)}</span>
            <span className="block text-xs font-semibold text-muted uppercase tracking-wider">Time Taken</span>
          </div>
          <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber/10 text-amber-deep flex items-center justify-center mx-auto mb-3"><FiTag size={20} /></div>
            <span className="block font-display font-bold text-xl text-ink mb-1 truncate px-2 capitalize">{category}</span>
            <span className="block text-xs font-semibold text-muted uppercase tracking-wider">Category</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-ink text-paper shadow-sm hover:bg-ink-soft transition-colors" onClick={() => navigate("/practice")}>
            <FiRefreshCw /> Take Another Test
          </button>
          <Link to="/practice/history" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-white border border-line text-ink hover:bg-gray-50 transition-colors">
            <FiList /> View History
          </Link>
        </div>
      </div>

      {/* Detailed Review */}
      {/* Detailed Review */}
      {detailedResults && detailedResults.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl text-ink mb-6">Detailed Review</h2>
          <div className="space-y-6">
            {detailedResults.map((item, i) => (
              <div key={i} className={`bg-paper-raised border rounded-2xl p-6 shadow-sm ${item.isCorrect ? "border-emerald/30" : "border-coral/30"}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono font-bold text-ink-soft bg-ink/5 px-3 py-1 rounded-lg">Q{i + 1}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-sm ${item.isCorrect ? "bg-emerald-soft text-emerald" : "bg-coral/10 text-coral"}`}>
                    {item.isCorrect ? <><FiCheckCircle /> Correct</> : <><FiXCircle /> Wrong</>}
                  </span>
                </div>
                
                <p className="font-medium text-lg text-ink mb-6 leading-relaxed">{item.question}</p>
                
                <div className="flex flex-col gap-3 mb-6">
                  {item.options?.map((opt, j) => {
                    const isCorrectAnswer = j === item.correctAnswer;
                    const isSelected = j === item.selectedAnswer;
                    
                    let optionClass = "bg-white border-line text-ink-soft"; // default
                    if (isCorrectAnswer) {
                      optionClass = "bg-emerald-soft border-emerald text-emerald font-medium ring-1 ring-emerald/20";
                    } else if (isSelected && !item.isCorrect) {
                      optionClass = "bg-coral/10 border-coral text-coral font-medium";
                    }
                    
                    return (
                      <div key={j} className={`flex items-start gap-4 p-4 rounded-xl border ${optionClass}`}>
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${isCorrectAnswer ? 'bg-emerald text-white' : isSelected && !item.isCorrect ? 'bg-coral text-white' : 'bg-gray-100'}`}>
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span className="pt-0.5">{opt}</span>
                        {isCorrectAnswer && (
                          <FiCheckCircle className="ml-auto mt-0.5 flex-shrink-0" size={20} />
                        )}
                        {(isSelected && !item.isCorrect) && (
                          <FiXCircle className="ml-auto mt-0.5 flex-shrink-0" size={20} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {item.explanation && (
                  <div className="bg-ink/5 border border-line rounded-xl p-5">
                    <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Explanation</span>
                    <p className="text-sm text-ink-soft leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResult;
