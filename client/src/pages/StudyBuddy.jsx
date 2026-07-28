import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiBook, FiCode, FiUsers, FiTarget, FiZap } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { key: "dsa", label: "DSA & Coding", icon: FiCode, color: "#6366f1" },
  { key: "aptitude", label: "Aptitude", icon: FiTarget, color: "#f59e0b" },
  { key: "system-design", label: "System Design", icon: FiZap, color: "#06b6d4" },
  { key: "hr", label: "HR & Behavioral", icon: FiUsers, color: "#ec4899" },
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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md">
          <FiBook size={24} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">
            AI Study Buddy
          </h1>
          <p className="font-body text-muted text-sm mt-0.5">
            Your personal AI tutor for placement prep
          </p>
        </div>
      </div>

      {/* Category Chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                border: `1.5px solid ${isActive ? cat.color : "#e2e8f0"}`,
                backgroundColor: isActive ? `${cat.color}15` : "#fff",
                color: isActive ? cat.color : "#64748b",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Chat Window */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 320px)",
          minHeight: "400px",
          overflow: "hidden",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "10px",
              }}
            >
              {msg.role === "ai" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <FiCpu size={16} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "75%",
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  backgroundColor: msg.role === "user" ? "#6366f1" : "#f1f5f9",
                  color: msg.role === "user" ? "#fff" : "#1e293b",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 700 }}>{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            backgroundColor: "#e2e8f0",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.85em",
                            fontFamily: "monospace",
                          }}
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre
                          style={{
                            backgroundColor: "#1e293b",
                            color: "#e2e8f0",
                            padding: "16px",
                            borderRadius: "8px",
                            overflow: "auto",
                            fontSize: "0.85em",
                            margin: "8px 0",
                          }}
                        >
                          {children}
                        </pre>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: "4px" }}>{children}</li>
                      ),
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
            <div style={{ display: "flex", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <FiCpu size={16} />
              </div>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  fontSize: "0.9rem",
                }}
              >
                <span className="typing-dots">Thinking</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (show only if few messages) */}
        {messages.length <= 2 && (
          <div
            style={{
              padding: "12px 24px 8px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {QUICK_PROMPTS.filter(
              (p) => !activeCategory || p.category === activeCategory
            )
              .slice(0, 4)
              .map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fafafa",
                    color: "#475569",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#6366f115";
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.color = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#fafafa";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.color = "#475569";
                  }}
                >
                  {prompt.text}
                </button>
              ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeCategory
                ? `Ask about ${activeCategory}...`
                : "Ask anything about placements..."
            }
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              backgroundColor: "#fafafa",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background:
                loading || !input.trim()
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #6366f1, #a855f7)",
              color: loading || !input.trim() ? "#94a3b8" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudyBuddy;
