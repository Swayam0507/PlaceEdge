import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiMaximize2, FiCpu, FiPaperclip } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your PlaceEdge AI Mentor. How can I help you today?\n\nI can help with:\n• Mock Interviews\n• Resume Review\n• Career Counseling\n• DSA & Coding Hints` }
  ]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!input.trim() && !file) || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic update
    const newHistory = [...messages, { role: 'user', text: userMessage + (file ? ` [Attached: ${file.name}]` : "") }];
    setMessages(newHistory);
    setLoading(true);

    try {
      let requestData;
      if (file) {
        requestData = new FormData();
        requestData.append("resume", file);
        requestData.append("messages", JSON.stringify(newHistory));
      } else {
        requestData = newHistory;
      }

      const response = await chatWithAI(requestData);
      if (response.data.success) {
        if (response.data.extractedText) {
          // Secretly store the extracted PDF text in the history so the AI remembers it in future turns
          newHistory[newHistory.length - 1].hiddenText = response.data.extractedText;
        }
        setMessages([...newHistory, response.data.message]);
        setFile(null); // Clear file after send
      } else {
        throw new Error(response.data.message || "Failed to get response");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Sorry, I'm having trouble connecting right now.";
      setMessages([...newHistory, { role: 'ai', text: `Error: ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
      {/* Toggle Button */}
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={toggleChat}>
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window card">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <div className="chatbot-avatar">
                <FiCpu size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>PlaceEdge AI</h4>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Online</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={() => setIsMinimized(!isMinimized)} title="Minimize">
                <FiMinimize2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close">
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Body (Hidden if minimized) */}
          {!isMinimized && (
            <>
              <div className="chatbot-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="message-content">
                      {msg.isToolCall ? (
                        <>
                          {msg.toolName === "generate_resume_ui" && (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl my-1 w-full max-w-sm">
                               <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">📄 Resume Data Ready!</h5>
                               <div className="space-y-1 mb-4 text-xs text-indigo-800">
                                 <p><strong>Name:</strong> {msg.toolArgs.name}</p>
                                 <p><strong>Email:</strong> {msg.toolArgs.email}</p>
                                 <p><strong>Phone:</strong> {msg.toolArgs.phone}</p>
                                 <p><strong>Skills:</strong> {msg.toolArgs.skills}</p>
                               </div>
                               <button onClick={() => window.location.href='/resume-builder'} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors w-full shadow-sm">
                                 Open Resume Builder
                               </button>
                            </div>
                          )}
                          {msg.toolName === "generate_exam" && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl my-1 w-full max-w-sm">
                               <h5 className="font-bold text-green-900 mb-2 flex items-center gap-2">📝 Exam Generated!</h5>
                               <p className="text-xs text-green-800 mb-3">Topic: <strong>{msg.toolArgs.topic}</strong> | Difficulty: <strong>{msg.toolArgs.difficulty}</strong></p>
                               <button onClick={() => window.location.href='/test'} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors w-full shadow-sm">
                                 Take the Test Now
                               </button>
                            </div>
                          )}
                          {msg.toolName === "show_ats_score" && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl my-1 w-full max-w-sm">
                               <h5 className="font-bold text-orange-900 mb-2 flex items-center gap-2">🎯 ATS Score: {msg.toolArgs.score}%</h5>
                               <div className="text-xs text-orange-800 mb-3">
                                 <strong>Missing Keywords:</strong> {msg.toolArgs.missingKeywords?.join(", ") || "None"}
                               </div>
                               <ul className="text-xs text-orange-800 pl-4 list-disc space-y-1 mb-3">
                                 {msg.toolArgs.actionableFeedback?.map((fb, i) => <li key={i}>{fb}</li>)}
                               </ul>
                               <button onClick={() => window.location.href='/resume-builder'} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors w-full shadow-sm">
                                 Fix Resume Now
                               </button>
                            </div>
                          )}
                          {msg.toolName === "evaluate_interview" && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl my-1 w-full max-w-sm">
                               <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">🎤 Interview Feedback</h5>
                               <h2 className="text-xl font-bold text-blue-700 mb-3">Score: {msg.toolArgs.score}/10</h2>
                               <div className="space-y-2 text-xs text-blue-800">
                                 <p><strong>Strengths:</strong> {msg.toolArgs.strengths}</p>
                                 <p><strong>To Improve:</strong> {msg.toolArgs.improvements}</p>
                               </div>
                            </div>
                          )}
                          {msg.toolName === "generate_company_prep" && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl my-1 w-full max-w-sm">
                               <h5 className="font-bold text-purple-900 mb-2 flex items-center gap-2">🏢 Prep Sheet: {msg.toolArgs.companyName}</h5>
                               <p className="text-xs text-purple-800 mb-3 italic">{msg.toolArgs.aboutCompany}</p>
                               <div className="text-xs text-purple-800 space-y-2 mb-3">
                                 <p><strong>Typical Rounds:</strong> {msg.toolArgs.interviewRounds?.join(" ➔ ")}</p>
                               </div>
                               <button onClick={() => window.location.href='/companies'} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors w-full shadow-sm">
                                 View All Companies
                               </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="chat-message ai">
                    <div className="message-content typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-slate-200 p-3 flex flex-col gap-2 rounded-b-2xl">
                {file && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 w-full animate-fade-in shadow-sm">
                    <FiPaperclip size={14} className="shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="ml-auto text-indigo-400 hover:text-red-500 transition-colors p-1"><FiX size={14} /></button>
                  </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2 w-full bg-slate-50 border border-slate-200 rounded-full px-2 py-1 shadow-inner focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,.docx"
                  />
                  <button 
                    type="button" 
                    className={`p-2 rounded-full transition-colors ${file ? 'text-indigo-600 bg-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    title="Attach Resume for ATS Check"
                  >
                    <FiPaperclip size={18} />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={file ? "Add a message..." : "Type your message..."}
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 text-slate-700 placeholder-slate-400"
                    disabled={loading}
                  />
                  <button type="submit" className={`p-2 rounded-full transition-colors flex items-center justify-center ${(!input.trim() && !file) || loading ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`} disabled={(!input.trim() && !file) || loading}>
                    <FiSend size={16} style={{ transform: 'translateX(1px) translateY(1px)' }} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
