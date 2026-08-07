import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateInterviewQuestions } from "../services/api";
import api from "../services/api";
import { FiMic, FiTerminal, FiChevronRight, FiCheckCircle, FiRefreshCw, FiCpu, FiAward, FiMessageSquare, FiMicOff, FiArrowLeft } from "react-icons/fi";
import { BiBuildingHouse } from "react-icons/bi";
import ReactMarkdown from "react-markdown";

const TOP_COMPANIES = [
  "TCS", "Infosys", "Wipro", "HCLTech", "Tech Mahindra", "Cognizant",
  "Reliance Jio", "Flipkart", "Zomato", "Swiggy", "Paytm", "Zoho",
  "Ola", "L&T", "MakeMyTrip", "PhonePe", "Cred", "Zerodha", "Postman",
  "Razorpay", "Meesho", "Udaan", "ShareChat", "Dream11", "Freshworks",
  "BrowserStack", "Delhivery", "Nykaa", "Byju's", "Unacademy", "Pine Labs",
  "CARS24", "Oyo", "Groww", "Upstox", "Coforge", "Mindtree", "Mphasis",
  "Tata Elxsi", "Persistent", "Google", "Microsoft", "Amazon", "Apple", "Meta"
];

const InterviewPrep = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("setup"); // 'setup', 'generating', 'interview', 'summary'
  const [companies, setCompanies] = useState(TOP_COMPANIES);
  const [filters, setFilters] = useState({ company: "", category: "technical", role: "Software Engineer" });
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { q: string, answer: string, feedback: string }
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState(null);

  const handleStart = async () => {
    setStep("generating");
    try {
      const { data } = await generateInterviewQuestions(filters);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setAnswers([]);
        setCurrentAnswer("");
        setCurrentFeedback(null);
        setStep("interview");
      } else {
        alert("Failed to generate questions. Please try again.");
        setStep("setup");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Generation failed.");
      setStep("setup");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setLoadingFeedback(true);
    try {
      const res = await api.post("/ai/interview-feedback", { 
        question: questions[currentIdx].question, 
        answer: currentAnswer 
      });
      if (res.data.success) {
        setCurrentFeedback(res.data.feedback);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Failed to get feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleNext = () => {
    const newAnswers = [...answers, { 
      q: questions[currentIdx].question, 
      answer: currentAnswer, 
      feedback: currentFeedback 
    }];
    setAnswers(newAnswers);
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrentAnswer("");
      setCurrentFeedback(null);
    } else {
      setStep("summary");
    }
  };

  const toggleListening = () => {
    if (isListening && recognitionObj) {
      recognitionObj.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
      }
      if (finalTranscript) setCurrentAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript.trim());
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
    setRecognitionObj(recognition);
  };

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-line mt-10 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 p-2 text-slate-400 hover:text-ink hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center"
        title="Go Back"
      >
        <FiArrowLeft size={20} />
      </button>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiMic size={32} />
        </div>
        <h2 className="font-display text-3xl font-bold text-ink mb-2">Mock Interview Setup</h2>
        <p className="text-muted">Configure your AI mock interview session.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Role / Designation</label>
          <div className="relative">
            <FiTerminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={filters.role}
              onChange={e => setFilters({...filters, role: e.target.value})}
              className="w-full pl-11 pr-4 py-3 bg-paper border border-line rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-ink"
              placeholder="e.g. Frontend Developer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Target Company (Optional)</label>
          <div className="relative">
            <BiBuildingHouse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={filters.company}
              onChange={e => setFilters({...filters, company: e.target.value})}
              list="companies-list"
              className="w-full pl-11 pr-4 py-3 bg-paper border border-line rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-ink"
              placeholder="e.g. Google, TCS"
            />
            <datalist id="companies-list">
              {companies.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Interview Type</label>
          <select 
            value={filters.category}
            onChange={e => setFilters({...filters, category: e.target.value})}
            className="w-full px-4 py-3 bg-paper border border-line rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-ink"
          >
            <option value="technical">Technical</option>
            <option value="hr">HR & Behavioral</option>
            <option value="system design">System Design</option>
          </select>
        </div>

        <button 
          onClick={handleStart}
          className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          Start Mock Interview <FiChevronRight />
        </button>
      </div>
    </div>
  );

  const renderInterview = () => {
    const q = questions[currentIdx];
    return (
      <div className="max-w-4xl mx-auto mt-6 relative">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to exit the interview? Your progress will be lost.")) {
              if (recognitionObj) recognitionObj.stop();
              navigate(-1);
            }
          }}
          className="absolute -left-16 top-0 p-2 text-slate-400 hover:text-coral hover:bg-coral/5 rounded-xl transition-colors hidden lg:flex items-center justify-center"
          title="Exit Interview"
        >
          <FiArrowLeft size={20} />
        </button>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to exit the interview? Your progress will be lost.")) {
                  if (recognitionObj) recognitionObj.stop();
                  navigate(-1);
                }
              }}
              className="lg:hidden mr-2 p-2 text-slate-400 hover:text-coral hover:bg-coral/5 rounded-xl transition-colors flex items-center justify-center"
            >
              <FiArrowLeft size={18} />
            </button>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-sm font-bold text-slate-400 capitalize">{filters.category}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-line mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-snug mb-8">
            {q.question}
          </h2>

          {!currentFeedback ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-ink-soft flex items-center gap-2">
                  <FiMessageSquare /> Your Answer
                </label>
                <button 
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isListening ? 'bg-coral text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <><FiMicOff size={14} /> Stop Recording</> : <><FiMic size={14} /> Record Audio</>}
                </button>
              </div>
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
                className="w-full p-4 bg-paper border border-line rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-ink resize-y"
              />
              <button 
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || loadingFeedback}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loadingFeedback ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Evaluating...</>
                ) : (
                  <><FiCheckCircle /> Submit Answer</>
                )}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  <FiCpu size={120} />
                </div>
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <FiAward className="text-indigo-600" size={20} /> AI Feedback & Score
                </h3>
                <div className="prose prose-sm prose-indigo max-w-none text-ink-soft">
                  <ReactMarkdown>{currentFeedback}</ReactMarkdown>
                </div>
                {q.hint && (
                  <div className="mt-6 pt-6 border-t border-indigo-100/50">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Ideal Answer Hint</p>
                    <p className="text-sm font-medium text-indigo-800/70 italic">{q.hint}</p>
                  </div>
                )}
              </div>
              <button 
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {currentIdx < questions.length - 1 ? "Next Question" : "Finish Interview"} <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="max-w-4xl mx-auto mt-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-line text-center mb-8">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAward size={40} />
        </div>
        <h2 className="font-display text-4xl font-bold text-ink mb-3">Interview Completed!</h2>
        <p className="text-muted text-lg max-w-xl mx-auto">Great job! Review your answers and AI feedback below to see where you can improve.</p>
        <button 
          onClick={() => setStep("setup")}
          className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
        >
          <FiRefreshCw /> Practice Again
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-xl text-ink px-2">Detailed Report</h3>
        {answers.map((ans, i) => (
          <div key={i} className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-lg text-ink mb-4"><span className="text-indigo-500 mr-2">Q{i+1}.</span>{ans.q}</h4>
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Answer</p>
              <p className="text-sm font-medium text-ink-soft bg-slate-50 p-3 rounded-lg border border-slate-100">{ans.answer}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Feedback</p>
              <div className="prose prose-sm prose-indigo max-w-none text-ink-soft bg-indigo-50/30 p-4 rounded-lg border border-indigo-50">
                <ReactMarkdown>{ans.feedback}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8 font-body">
      {step === "setup" && renderSetup()}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600 animate-fade-in">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <h2 className="font-display text-2xl font-bold text-ink mb-2">Generating Questions...</h2>
          <p className="text-muted">AI is crafting custom interview questions for you.</p>
        </div>
      )}
      {step === "interview" && renderInterview()}
      {step === "summary" && renderSummary()}
    </div>
  );
};

export default InterviewPrep;
