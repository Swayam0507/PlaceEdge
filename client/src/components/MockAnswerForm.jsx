import { useState } from "react";
import api from "../services/api";
import { FiCpu } from "react-icons/fi";
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
      // Allow passing either a question object with .question or just a string
      const questionText = typeof question === 'string' ? question : question?.question;
      const res = await api.post("/ai/interview-feedback", { question: questionText, answer });
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
        <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <FiCpu size={64} />
           </div>
           <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2 relative z-10">
             AI Feedback
           </h4>
           <div className="prose prose-sm prose-indigo max-w-none relative z-10 text-ink-soft">
             <ReactMarkdown>{feedback}</ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};

export default MockAnswerForm;
