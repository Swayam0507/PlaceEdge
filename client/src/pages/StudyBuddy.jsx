import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiBook, FiCode, FiUsers, FiTarget, FiZap, FiMessageSquare } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "dsa", label: "DSA & Coding", icon: FiCode, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500" },
  { key: "aptitude", label: "Aptitude", icon: FiTarget, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500" },
  { key: "system-design", label: "System Design", icon: FiZap, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500" },
  { key: "hr", label: "HR & Behavioral", icon: FiUsers, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500" },
];

const QUICK_PROMPTS = [
  { text: "Explain Binary Search with examples", category: "dsa" },
  { text: "Give me 5 aptitude problems on Percentages", category: "aptitude" },
  { text: "What is the difference between Stack and Queue?", category: "dsa" },
  { text: "How to design a URL shortener?", category: "system-design" },
  { text: "Common HR questions and best answers", category: "hr" },
  { text: "Time complexity of all sorting algorithms", category: "dsa" },
  { text: "Practice problems on Probability", category: "aptitude" },
  { text: "Tell me about yourself — best answer format", category: "hr" },
];

const StudyBuddy = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hey ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your **AI Study Buddy**.\n\nI'm here to help you prepare for placements. Pick a topic below or ask me anything!\n\n• **DSA & Coding** — Algorithms, Data Structures, Problems\n• **Aptitude** — Quantitative, Logical Reasoning\n• **System Design** — Architecture, Scalability\n• **HR & Behavioral** — Interview Questions, Soft Skills`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setInput("");

    const contextPrefix = activeCategory
      ? `[Context: The student is studying ${activeCategory}. Focus your answer on this topic.]\n\n`
      : "";

    const userMessage = text.trim();
    const newHistory = [...messages, { role: "user", text: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const aiHistory = newHistory.map((m) => ({
        role: m.role === "ai" ? "ai" : "user",
        text: m.role === "user" && m === newHistory[newHistory.length - 1] 
          ? contextPrefix + m.text 
          : m.text,
      }));
      const response = await chatWithAI(aiHistory);
      if (response.data.success) {
        setMessages([...newHistory, { role: "ai", text: response.data.reply }]);
      } else {
        throw new Error("Failed");
      }
    } catch {
      setMessages([
        ...newHistory,
        { role: "ai", text: "Sorry, I'm having trouble right now. Please try again! 🔌" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt) => {
    setActiveCategory(prompt.category);
    sendMessage(prompt.text);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-surface font-body animate-fade-in flex flex-col relative overflow-hidden rounded-2xl">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col relative z-10 p-4 sm:p-6 lg:p-8 min-h-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <FiCpu size={28} />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-ink tracking-tight">
                AI Study Buddy
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Your personal AI tutor for placement prep
              </p>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 flex-wrap sm:justify-end shrink-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(isActive ? null : cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    isActive 
                      ? `${cat.bg} ${cat.color} ${cat.border} shadow-sm ring-2 ring-offset-2 ring-${cat.border.split('-')[1]}-200` 
                      : "bg-white border-line text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 min-h-0 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl flex flex-col overflow-hidden relative">

          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-500/20">
                    <FiCpu size={20} />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-sm" 
                      : "bg-slate-50/80 border border-slate-100 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-indigo-900">{children}</strong>,
                        code: ({ node, inline, children, ...props }) => {
                          const match = /language-(\w+)/.exec(props.className || "");
                          return !inline ? (
                            <div className="my-4 rounded-xl overflow-hidden bg-[#1e1e2e] border border-slate-700/50">
                              <div className="flex items-center px-4 py-2 bg-black/40 border-b border-white/10">
                                <span className="text-xs font-mono text-slate-400">{match ? match[1] : 'code'}</span>
                              </div>
                              <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono">
                                <code {...props}>{children}</code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-indigo-100/50 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono text-sm border border-indigo-200/50" {...props}>
                              {children}
                            </code>
                          )
                        },
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        h3: ({ children }) => <h3 className="font-bold text-lg text-indigo-900 mt-4 mb-2">{children}</h3>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <FiCpu size={20} />
                </div>
                <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 text-slate-500">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="font-medium text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (Only show if few messages) */}
          {messages.length < 3 && !loading && (
            <div className="px-4 sm:px-8 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {QUICK_PROMPTS.filter(p => !activeCategory || p.category === activeCategory).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
                  >
                    <FiMessageSquare size={14} className="text-indigo-400" />
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white/50 border-t border-slate-100 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <div className="relative flex-1 bg-white rounded-2xl border border-indigo-100 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask anything about placements..."
                  className="w-full bg-transparent border-none px-5 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 min-h-[56px] font-medium"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-14 h-[56px] flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shrink-0"
              >
                <FiSend size={20} className="ml-1" />
              </button>
            </form>
            <p className="text-center text-[11px] font-medium text-slate-400 mt-3">
              AI Study Buddy can make mistakes. Verify important information.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
