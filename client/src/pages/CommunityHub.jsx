import { Link } from "react-router-dom";
import { MessageSquare, BookOpen, Target, ChevronRight, Sparkles, Users } from "lucide-react";

const CommunityHub = () => {
  return (
    <div className="min-h-screen bg-surface pb-20 animate-fade-in">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-bold text-3xl md:text-4xl text-ink tracking-tight mb-2">Community & AI Hub</h1>
          <p className="text-ink-soft text-lg font-medium max-w-2xl">Connect with peers in the forum or get personalized guidance from your AI mentors.</p>
        </div>

        {/* Top Half: The Social Network (Forum) */}
        <div className="mb-12">
          <Link to="/community/forum" className="block group">
            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-floating">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full min-h-[240px]">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm mx-auto md:mx-0">
                    <Users size={14} className="text-white" /> Global Network
                  </div>
                  <h2 className="font-bold text-3xl md:text-5xl text-white mb-4 leading-tight tracking-tight">
                    Join The Discussion
                  </h2>
                  <p className="text-amber-100 text-lg max-w-xl font-medium mb-8 leading-relaxed mx-auto md:mx-0">
                    Ask questions, share interview experiences, and help your peers succeed. The community forum is your go-to place for real-world placement insights.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 hover:scale-[1.02] transition-all duration-300 shadow-xl">
                    <MessageSquare size={20} />
                    Open Forum
                  </div>
                </div>

                {/* Decorative Graphic area */}
                <div className="hidden md:flex flex-shrink-0 relative">
                  <div className="w-48 h-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <MessageSquare size={80} className="text-white opacity-80" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-900/40 backdrop-blur-md border border-white/10 rounded-3xl flex items-center justify-center rotate-12 group-hover:rotate-6 transition-transform duration-500 delay-75">
                    <Users size={48} className="text-amber-200 opacity-80" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Half: AI Mentors */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-blue-500" />
            <h3 className="font-bold text-2xl text-ink tracking-tight">Your AI Mentors</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AI Study Buddy */}
            <Link to="/community/study-buddy" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-line shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-100 shadow-sm">
                    <BookOpen size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">AI Tutor</span>
                </div>
                
                <h4 className="font-bold text-2xl text-ink mb-3 group-hover:text-blue-600 transition-colors tracking-tight">Study Buddy</h4>
                <p className="text-ink-soft font-medium leading-relaxed flex-1 mb-8">
                  Stuck on a DSA problem? Need help understanding a concept? Chat with your personal AI tutor tailored for computer science students.
                </p>
                
                <div className="flex items-center text-blue-600 font-bold group-hover:gap-3 gap-2 transition-all">
                  Start Learning <ChevronRight size={18} />
                </div>
              </div>
            </Link>

            {/* AI Career Advisor */}
            <Link to="/community/career-advisor" className="group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-line shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100 shadow-sm">
                    <Target size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">AI Mentor</span>
                </div>
                
                <h4 className="font-bold text-2xl text-ink mb-3 group-hover:text-emerald-600 transition-colors tracking-tight">Career Advisor</h4>
                <p className="text-ink-soft font-medium leading-relaxed flex-1 mb-8">
                  Get personalized career guidance. The AI analyzes your test performance and profile to recommend the best roles and prep strategies.
                </p>
                
                <div className="flex items-center text-emerald-600 font-bold group-hover:gap-3 gap-2 transition-all">
                  Get Advice <ChevronRight size={18} />
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CommunityHub;
