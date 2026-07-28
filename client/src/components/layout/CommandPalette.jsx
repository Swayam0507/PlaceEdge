import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFileText, FiCpu, FiBarChart2, FiBriefcase, FiMessageSquare, FiMic, FiAward, FiBookmark, FiUser, FiCheckSquare, FiUsers, FiCompass } from "react-icons/fi";
import { BiBuildingHouse, BiTargetLock } from "react-icons/bi";

const COMMANDS = [
  { label: "Dashboard", path: "/dashboard", icon: FiBarChart2, category: "Navigation" },
  { label: "Practice Hub", path: "/practice", icon: FiCheckSquare, category: "Navigation" },
  { label: "Career Hub", path: "/career", icon: FiBriefcase, category: "Navigation" },
  { label: "Community Hub", path: "/community", icon: FiMessageSquare, category: "Navigation" },
  
  { label: "Aptitude Tests", path: "/practice/tests", icon: FiCheckSquare, category: "Practice" },
  { label: "Test History", path: "/practice/history", icon: FiBarChart2, category: "Practice" },
  { label: "Interview Prep", path: "/practice/interview", icon: FiMic, category: "Practice" },
  { label: "Leaderboard", path: "/practice/leaderboard", icon: FiAward, category: "Practice" },
  { label: "Bookmarks", path: "/practice/bookmarks", icon: FiBookmark, category: "Practice" },
  { label: "Company Prep", path: "/company-prep", icon: BiBuildingHouse, category: "Practice" },
  
  { label: "Resume Builder", path: "/career/resume", icon: FiFileText, category: "Career" },
  { label: "ATS Checker", path: "/career/ats", icon: FiCpu, category: "Career" },
  { label: "Placement Predictor", path: "/career/predictor", icon: BiTargetLock, category: "Career" },
  { label: "Off-Campus Jobs", path: "/career/jobs", icon: FiBriefcase, category: "Career" },
  { label: "Company Explorer", path: "/career/companies", icon: BiBuildingHouse, category: "Career" },
  
  { label: "Forum", path: "/community/forum", icon: FiMessageSquare, category: "Community" },
  { label: "Study Buddy", path: "/community/study-buddy", icon: FiUsers, category: "Community" },
  { label: "Career Advisor", path: "/community/career-advisor", icon: FiCompass, category: "Community" },
  
  { label: "My Profile", path: "/profile", icon: FiUser, category: "Account" },
];

const CommandPalette = ({ open, setOpen }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex].path);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-start justify-center pt-[15vh] bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-paper-raised rounded-lg shadow-lift overflow-hidden border border-line flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-line gap-3">
          <FiSearch size={20} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none font-body text-ink text-base placeholder-muted"
            placeholder="Search pages, features..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="hidden sm:inline-block rounded bg-paper px-2 py-1 text-xs font-mono font-medium text-ink-soft border border-line">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2" ref={listRef}>
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-8 text-center text-muted font-body">No results found</div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted tracking-wider uppercase">{category}</div>
              {items.map((cmd) => {
                const globalIdx = filtered.indexOf(cmd);
                const Icon = cmd.icon;
                const isSelected = globalIdx === selectedIndex;
                return (
                  <button
                    key={cmd.path}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isSelected ? "bg-amber/10 text-amber-deep" : "text-ink hover:bg-paper"
                    }`}
                    onClick={() => { navigate(cmd.path); setOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <Icon size={16} />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
