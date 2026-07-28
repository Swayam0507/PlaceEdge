import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateExam, submitTest } from "../services/api";

const CATEGORY_LABELS = {
  aptitude: "Aptitude Test",
  dsa: "Data Structures & Algorithms",
  soft_skills: "Soft Skills & HR",
  career: "Career Path Test",
  mixed: "Mixed (All Categories)",
};

import { FiPieChart, FiBox, FiTerminal, FiTarget } from "react-icons/fi";

const CATEGORY_ICONS = {
  aptitude: <FiPieChart />,
  dsa: <FiTerminal />,
  soft_skills: <FiBox />,
  career: <FiTarget />,
  mixed: <FiTarget />,
};

const ExamTest = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const selectedCategory = category || "mixed";
  const [phase, setPhase] = useState("config"); // config | test | submitting

  // Config state
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);

  // Test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);

  // Loading & errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Timer
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 30) return "timer-danger";
    if (timeLeft <= 60) return "timer-warning";
    return "";
  };

  const startTest = async () => {
    setLoading(true);
    setError("");

    try {
      // Call our dynamic AI Exam generator
      const { data } = await generateExam({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        limit: questionCount,
      });

      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setAnswers({});
        const time = data.questions.length * 60; // 1 minute per question
        setTimeLeft(time);
        setTotalTime(time);
        setPhase("test");
      } else {
        setError("AI failed to generate questions. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate dynamic exam with AI.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = useCallback(async () => {
    if (phase === "submitting") return;
    setPhase("submitting");
    clearInterval(timerRef.current);

    const timeTaken = totalTime - timeLeft;
    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] !== undefined ? answers[q._id] : -1,
    }));

    try {
      const { data } = await submitTest({
        category: selectedCategory,
        answers: formattedAnswers,
        timeTaken,
        difficulty: selectedDifficulty,
      });

      if (data.success) {
        navigate("/test-result", {
          state: {
            result: data.result,
            timeTaken,
          },
        });
      }
    } catch (err) {
      setError("Failed to submit test. Please try again.");
      setPhase("test");
    }
  }, [phase, questions, answers, timeLeft, totalTime, selectedCategory, selectedDifficulty, navigate]);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // ===== CONFIG PHASE =====
  if (phase === "config") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-3xl text-ink mb-3">{CATEGORY_LABELS[selectedCategory] || "Assessment Test"}</h1>
          <p className="font-body text-muted text-lg">
            AI will instantly generate unique questions for your exam.
          </p>
        </div>

        {error && (
          <div className="bg-coral/10 border border-coral text-coral px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="bg-paper-raised border border-line rounded-2xl p-6 md:p-10 shadow-card">
          {/* Difficulty Selection */}
          <div className="mb-8">
            <h3 className="font-display font-semibold text-ink mb-4 text-lg">Difficulty Level</h3>
            <div className="flex flex-wrap gap-3">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all ${selectedDifficulty === d ? (d==='easy' ? 'bg-emerald text-white shadow-md border-emerald' : d==='medium' ? 'bg-amber-deep text-white shadow-md border-amber-deep' : 'bg-coral text-white shadow-md border-coral') : 'bg-white border border-line text-ink hover:border-ink/20 hover:bg-gray-50'}`}
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-10">
            <h3 className="font-display font-semibold text-ink mb-4 text-lg">Number of Questions</h3>
            <div className="flex flex-wrap gap-3">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all ${questionCount === n ? "bg-ink text-paper shadow-md border-ink" : "bg-white border border-line text-ink hover:border-ink/20 hover:bg-gray-50"}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Test Info */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-ink/5 rounded-xl p-5 mb-10">
            <div className="flex items-center gap-2 text-ink-soft text-sm font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{questionCount} min time limit</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft text-sm font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{questionCount} questions</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft text-sm font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>1 mark per correct</span>
            </div>
          </div>

          <button
            className="w-full flex justify-center items-center gap-2 bg-ink text-paper py-3.5 rounded-xl font-semibold text-lg shadow-sm hover:bg-ink-soft transition-colors disabled:opacity-70"
            onClick={startTest}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generating your assessment...
              </>
            ) : (
              <>
                Start AI Test
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ===== TEST PHASE =====
  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper-raised border border-line rounded-2xl p-4 shadow-sm mb-6 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="flex items-center gap-2 bg-ink/5 px-3 py-1.5 rounded-lg text-ink font-semibold text-sm">
            {CATEGORY_ICONS[selectedCategory]} {CATEGORY_LABELS[selectedCategory]}
          </span>
          <span className="font-mono font-medium text-ink-soft text-sm">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl border ${timeLeft <= 60 ? 'bg-coral/10 text-coral border-coral/20' : 'bg-white border-line text-ink'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-line rounded-full h-2 mb-8 shrink-0 overflow-hidden">
        <div className="bg-emerald h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col min-h-0 bg-paper-raised border border-line rounded-2xl p-6 sm:p-10 shadow-card">
        <div className="mb-8">
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Question {currentIndex + 1}</div>
          <h2 className="font-display font-medium text-xl sm:text-2xl text-ink leading-relaxed">{currentQ?.question}</h2>
        </div>

        <div className="flex-1 overflow-y-auto mb-8">
          <div className="flex flex-col gap-3">
            {currentQ?.options.map((option, i) => (
              <button
                key={i}
                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${answers[currentQ._id] === i ? "bg-ink/5 border-ink text-ink shadow-sm ring-1 ring-ink/20" : "bg-white border-line text-ink-soft hover:border-ink/30 hover:bg-gray-50"}`}
                onClick={() => selectAnswer(currentQ._id, i)}
              >
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${answers[currentQ._id] === i ? "bg-ink text-paper" : "bg-gray-100 text-muted"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={`font-medium pt-0.5 ${answers[currentQ._id] === i ? "text-ink" : "text-ink"}`}>{option}</span>
                {answers[currentQ._id] === i && (
                  <svg className="ml-auto flex-shrink-0 text-ink mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-auto border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-line text-ink hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Previous
          </button>

          <div className="flex flex-wrap justify-center gap-1.5 max-w-[50%]">
            {questions.map((q, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${i === currentIndex ? "bg-ink text-paper ring-2 ring-ink ring-offset-2" : answers[q._id] !== undefined ? "bg-emerald-soft text-emerald border border-emerald/20" : "bg-gray-100 text-muted hover:bg-gray-200"}`}
                onClick={() => setCurrentIndex(i)}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-ink text-paper shadow-sm hover:bg-ink-soft transition-colors"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-emerald text-white shadow-sm hover:bg-emerald/90 transition-colors disabled:opacity-70"
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (!window.confirm(`You've answered ${answeredCount}/${questions.length} questions. Submit anyway?`)) {
                    return;
                  }
                }
                handleSubmit();
              }}
              disabled={phase === "submitting"}
            >
              {phase === "submitting" ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Test
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Answer Summary */}
      <div className="flex justify-center gap-6 mt-6 shrink-0 text-sm font-medium">
        <span className="flex items-center gap-2 text-emerald">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald"></span>
          Answered: {answeredCount}
        </span>
        <span className="flex items-center gap-2 text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
          Unanswered: {questions.length - answeredCount}
        </span>
      </div>
    </div>
  );
};

export default ExamTest;
