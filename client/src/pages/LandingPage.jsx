import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  Target, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Trophy, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from "lucide-react";

const FEATURES = [
  { icon: BrainCircuit, title: "Smart Aptitude Tests", desc: "Practice with categorized tests across quantitative, logical, and technical domains with real-time scoring." },
  { icon: Sparkles, title: "AI Placement Predictor", desc: "Get your placement probability predicted by an ensemble of 4 ML classifiers trained on real data." },
  { icon: Briefcase, title: "Job Recommendations", desc: "Receive personalized job matches based on your skills profile and academic performance." },
  { icon: FileText, title: "Resume Analysis", desc: "Upload your resume for skill extraction, scoring, and ATS-readiness feedback." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track your performance trends, identify weak areas, and monitor placement readiness." },
  { icon: Trophy, title: "Leaderboard", desc: "Compete with peers and climb the rankings on the global leaderboard." },
];

const STATS = [
  { value: 500, suffix: "+", label: "Questions" },
  { value: 20, suffix: "+", label: "Job Roles" },
  { value: 4, suffix: "", label: "ML Models" },
  { value: 95, suffix: "%", label: "Accuracy" },
];

const CountUp = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <>{count}{suffix}</>;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">PlaceEdge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all hover:shadow-lg hover:shadow-slate-900/20 flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-violet-400 blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8"
          >
            <Sparkles size={16} />
            <span>AI-Powered Placement Preparation</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900"
          >
            Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Placement</span> Journey
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10"
          >
            The all-in-one platform for aptitude practice, ML-powered placement prediction, resume analysis, and personalized job recommendations.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
              Start Preparing Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all flex items-center justify-center">
              View Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-slate-500">A comprehensive suite of professional tools designed to maximize your placement readiness.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-violet-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-6 bg-slate-900 text-white rounded-t-[3rem] lg:rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Your path to placement</h2>
            <p className="text-lg text-slate-400">Follow our structured methodology to land your dream job.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-800 via-blue-500 to-slate-800"></div>
            
            {[
              { step: "01", title: "Profile", desc: "Build your academic and skill profile", icon: Target },
              { step: "02", title: "Practice", desc: "Take aptitude and coding tests", icon: BrainCircuit },
              { step: "03", title: "Analyze", desc: "Get AI feedback on your resume", icon: FileText },
              { step: "04", title: "Apply", desc: "Get matched with top companies", icon: Briefcase },
            ].map((item, i) => (
              <div key={i} className="relative text-center pt-4">
                <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center relative z-10 mb-6 text-blue-400">
                  <item.icon size={24} />
                </div>
                <div className="text-blue-400 font-mono text-sm font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Footer */}
      <section className="bg-slate-900 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to accelerate your career?</h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg relative z-10">Join thousands of students who are preparing smarter and landing better jobs with PlaceEdge.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors relative z-10">
              Get Started for Free <ChevronRight size={20} />
            </Link>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles size={16} className="text-blue-500" />
              <span className="font-bold text-white text-lg">PlaceEdge</span>
            </div>
            <p>© {new Date().getFullYear()} PlaceEdge Platform. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
