import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Target, Sparkles, BrainCircuit, Activity, BookOpen, Clock, Users, GraduationCap, CheckCircle2, AlertTriangle, Loader2, UserCheck, Settings, ChevronDown, Code, FileText, Building2, ArrowRight } from "lucide-react";
import { predictPlacement, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PlacementPredictor = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    cgpa: 7.5,
    aptitude_score: 65,
    coding_score: 60,
    communication_score: 60,
    attendance: 80,
    projects_count: 3,
    internships_count: 1,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Auto-fetch profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await getProfile();
        const profile = data.profile;
        
        setFormData(prev => ({
          ...prev,
          cgpa: profile.cgpa || prev.cgpa,
          aptitude_score: profile.stats?.avgScore || prev.aptitude_score,
          // Rough estimation for other fields if not available, otherwise keep default
        }));
      } catch (err) {
        console.error("Failed to fetch profile for auto-sync:", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchUserData();
  }, []);

  // Helper functions for UI feedback
  const getSkillLabel = (score) => {
    if (score < 40) return { text: "Beginner", color: "text-red-500 bg-red-50" };
    if (score < 70) return { text: "Intermediate", color: "text-yellow-600 bg-yellow-50" };
    if (score < 90) return { text: "Advanced", color: "text-green-600 bg-green-50" };
    return { text: "Expert", color: "text-indigo-600 bg-indigo-50" };
  };

  const getExperienceLabel = (count) => {
    if (count === 0) return { text: "None", color: "text-slate-500 bg-slate-100" };
    if (count <= 2) return { text: "Average", color: "text-yellow-600 bg-yellow-50" };
    if (count <= 4) return { text: "Good", color: "text-green-600 bg-green-50" };
    return { text: "Excellent", color: "text-indigo-600 bg-indigo-50" };
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await predictPlacement(formData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Make sure the ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (value) => {
    if (value >= 75) return "#10b981"; // Emerald
    if (value >= 50) return "#f59e0b"; // Amber
    if (value >= 25) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const colorStyles = {
    blue: {
      bg: "bg-blue-50/50 border-blue-100",
      text: "text-blue-700",
      iconBg: "bg-blue-100 text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-lg",
      badge: "bg-blue-100 text-blue-800",
    },
    purple: {
      bg: "bg-purple-50/50 border-purple-100",
      text: "text-purple-700",
      iconBg: "bg-purple-100 text-purple-600",
      btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 hover:shadow-lg",
      badge: "bg-purple-100 text-purple-800",
    },
    amber: {
      bg: "bg-amber-50/50 border-amber-100",
      text: "text-amber-700",
      iconBg: "bg-amber-100 text-amber-600",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 hover:shadow-lg",
      badge: "bg-amber-100 text-amber-800",
    },
    emerald: {
      bg: "bg-emerald-50/50 border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100 text-emerald-600",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-lg",
      badge: "bg-emerald-100 text-emerald-800",
    },
    rose: {
      bg: "bg-rose-50/50 border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100 text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 hover:shadow-lg",
      badge: "bg-rose-100 text-rose-800",
    },
    indigo: {
      bg: "bg-indigo-50/50 border-indigo-100",
      text: "text-indigo-700",
      iconBg: "bg-indigo-100 text-indigo-600",
      btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-lg",
      badge: "bg-indigo-100 text-indigo-800",
    },
  };

  const getActionableTasks = () => {
    if (!formData) return [];
    const tasks = [];

    // 1. Coding score
    if (formData.coding_score < 75) {
      tasks.push({
        id: "coding",
        title: "Coding Practice Gym",
        description: `Your coding score is currently ${formData.coding_score}%. Top companies require strong DSA skills. Practicing on challenges can boost your rating.`,
        to: "/practice",
        buttonText: "Solve Coding Challenges",
        color: "blue",
        priority: formData.coding_score < 50 ? "high" : "medium",
      });
    }

    // 2. Aptitude score
    if (formData.aptitude_score < 75) {
      tasks.push({
        id: "aptitude",
        title: "Aptitude Booster",
        description: `Your aptitude score is ${formData.aptitude_score}%. Practice quantitative math, verbal, and logical reasoning to clear the first screening round.`,
        to: "/practice",
        buttonText: "Attempt Aptitude Tests",
        color: "purple",
        priority: formData.aptitude_score < 50 ? "high" : "medium",
      });
    }

    // 3. Communication/Behavioral score
    if (formData.communication_score < 75) {
      tasks.push({
        id: "communication",
        title: "AI Mock Interviews",
        description: `Your communication is rated at ${formData.communication_score}%. Practice mock technical & behavioral interviews with AI coach feedback.`,
        to: "/practice/interview",
        buttonText: "Start AI Interview",
        color: "amber",
        priority: formData.communication_score < 50 ? "high" : "medium",
      });
    }

    // 4. Practical Experience / Projects & Internships
    if (formData.projects_count < 3 || formData.internships_count < 1) {
      const missing = [];
      if (formData.projects_count < 3) missing.push(`${3 - formData.projects_count} more project(s)`);
      if (formData.internships_count < 1) missing.push("an internship");
      tasks.push({
        id: "resume",
        title: "ATS Resume Checker",
        description: `You need ${missing.join(" and ")} to build a competitive resume. Scan your resume against target jobs to find improvement areas.`,
        to: "/career/ats",
        buttonText: "Scan Resume with ATS",
        color: "emerald",
        priority: "high",
      });
    }

    // 5. Academic (CGPA)
    if (formData.cgpa < 7.0) {
      tasks.push({
        id: "cgpa",
        title: "Academic Focus",
        description: `A CGPA of ${formData.cgpa} is below the eligibility cut-off for several recruiters. Aim to raise your average in your profile and upcoming terms.`,
        to: "/profile",
        buttonText: "Update CGPA in Profile",
        color: "rose",
        priority: "high",
      });
    }

    // 6. Target Company prep (Always recommend if probability is reasonable or as a stretch goal)
    if (result && result.placement_probability >= 50) {
      tasks.push({
        id: "company",
        title: "Company Prep Guides",
        description: `Your profile looks strong with ${Math.round(result.placement_probability)}% success rate! Unlock company-specific guides to ace interviews.`,
        to: "/company-prep",
        buttonText: "Explore Company Guides",
        color: "indigo",
        priority: "medium",
      });
    }

    return tasks;
  };

  const fieldGroups = [
    {
      title: "Academic Stats",
      icon: GraduationCap,
      fields: [
        { key: "cgpa", label: "CGPA", min: 0, max: 10, step: 0.1, icon: GraduationCap, color: "text-blue-500", type: "academic" },
        { key: "attendance", label: "Attendance %", min: 0, max: 100, step: 1, icon: Clock, color: "text-rose-500", type: "academic" },
      ]
    },
    {
      title: "Skill Metrics",
      icon: Activity,
      fields: [
        { key: "aptitude_score", label: "Aptitude Score", min: 0, max: 100, step: 1, icon: BrainCircuit, color: "text-purple-500", type: "skill" },
        { key: "coding_score", label: "Coding Score", min: 0, max: 100, step: 1, icon: BookOpen, color: "text-emerald-500", type: "skill" },
        { key: "communication_score", label: "Communication Score", min: 0, max: 100, step: 1, icon: Users, color: "text-amber-500", type: "skill" },
      ]
    },
    {
      title: "Practical Experience",
      icon: Target,
      fields: [
        { key: "projects_count", label: "Projects Count", min: 0, max: 20, step: 1, icon: Settings, color: "text-indigo-500", type: "exp" },
        { key: "internships_count", label: "Internships Count", min: 0, max: 10, step: 1, icon: Target, color: "text-cyan-500", type: "exp" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface font-body pb-16 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 pt-16 pb-24 px-6 sm:px-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/4"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md mb-6 shadow-lg text-emerald-400">
            <Sparkles size={32} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Smart Placement Predictor
          </h1>
          <p className="text-indigo-200/80 font-medium text-lg max-w-2xl">
            We've auto-synced your profile data. Adjust the sliders to run "What-If" scenarios and get AI-driven actionable insights.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-line p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <UserCheck className="text-indigo-500" /> Your Metrics
              </h2>
              {fetchingProfile ? (
                <span className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                  <Loader2 className="animate-spin" size={14} /> Syncing Profile...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 size={14} /> Auto-Synced
                </span>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {fieldGroups.map((group, gIdx) => (
                <div key={gIdx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <group.icon size={16} className="text-slate-400" /> {group.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {group.fields.map((field) => {
                      const percentage = ((formData[field.key] - field.min) / (field.max - field.min)) * 100;
                      const labelData = field.type === "skill" ? getSkillLabel(formData[field.key]) : (field.type === "exp" ? getExperienceLabel(formData[field.key]) : null);
                      return (
                        <div key={field.key} className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <label htmlFor={`metric-${field.key}`} className="flex items-center gap-2 font-semibold text-slate-600 text-xs">
                              {field.label}
                              {labelData && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${labelData.color}`}>
                                  {labelData.text}
                                </span>
                              )}
                            </label>
                            <span className="bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-slate-200 shadow-sm min-w-[2.5rem] text-center">
                              {formData[field.key]}
                            </span>
                          </div>
                          
                          <div className="relative pt-1">
                            <input
                              type="range"
                              id={`metric-${field.key}`}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              value={formData[field.key]}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              style={{
                                background: `linear-gradient(to right, #6366f1 ${percentage}%, #e2e8f0 ${percentage}%)`
                              }}
                            />
                            <style dangerouslySetInnerHTML={{
                              __html: `
                              #metric-${field.key}::-webkit-slider-thumb {
                                appearance: none;
                                width: 16px;
                                height: 16px;
                                border-radius: 50%;
                                background: white;
                                border: 2px solid #6366f1;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                                cursor: pointer;
                                transition: transform 0.1s;
                              }
                              #metric-${field.key}::-webkit-slider-thumb:hover {
                                transform: scale(1.2);
                              }
                            `}} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Readiness Report
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-coral/10 border border-coral/20 text-coral-800 rounded-xl text-sm flex items-start gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5 text-coral" size={18} />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-5 flex flex-col h-full gap-6">
            
            {!result && !loading && (
              <div className="bg-white rounded-3xl shadow-sm border border-line p-6 sm:p-10 flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Target size={36} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Ready for Prediction</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  We've populated your known metrics. Adjust the sliders on the left to simulate different scenarios, then click "Generate".
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-3xl shadow-sm border border-line p-6 sm:p-10 flex flex-col items-center justify-center h-full text-center">
                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <BrainCircuit size={28} className="text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Analyzing Data...</h3>
                <p className="text-slate-500 text-sm">Evaluating your profile using our ensemble ML model.</p>
              </div>
            )}

            {result && (
              <div className="animate-fade-in flex flex-col gap-6">
                
                {/* Main Verdict Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-line p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                    Placement Readiness
                  </h2>

                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full mb-6 shadow-sm" style={{
                    background: `conic-gradient(${getGaugeColor(result.placement_probability)} ${result.placement_probability * 3.6}deg, #f1f5f9 ${result.placement_probability * 3.6}deg)`
                  }}>
                    <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-5xl font-black tracking-tight" style={{ color: getGaugeColor(result.placement_probability) }}>
                        {Math.round(result.placement_probability)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className={`px-6 py-2.5 rounded-full font-bold text-white shadow-lg flex items-center gap-2 text-lg ${
                    result.prediction === "Placed" ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/25" : "bg-gradient-to-r from-coral to-red-400 shadow-coral/25"
                  }`}>
                    {result.prediction === "Placed" ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                    {result.prediction === "Placed" ? "Highly Likely" : "Needs Improvement"}
                  </div>
                </div>

                {/* Actionable Prep Roadmap */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-ink font-bold text-lg px-1">
                    <Activity size={20} className="text-indigo-500 animate-pulse" />
                    Actionable Prep Roadmap
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {getActionableTasks().length === 0 ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl text-center">
                        <p className="text-emerald-800 text-sm font-semibold">🎉 Outstanding! You meet all benchmark targets for placement. Keep it up!</p>
                      </div>
                    ) : (
                      getActionableTasks().map((task) => {
                        const styles = colorStyles[task.color] || colorStyles.indigo;
                        
                        let TaskIcon = Lightbulb;
                        if (task.id === "coding") TaskIcon = Code;
                        else if (task.id === "aptitude") TaskIcon = BrainCircuit;
                        else if (task.id === "communication") TaskIcon = Users;
                        else if (task.id === "resume") TaskIcon = FileText;
                        else if (task.id === "cgpa") TaskIcon = GraduationCap;
                        else if (task.id === "company") TaskIcon = Building2;

                        return (
                          <div 
                            key={task.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-md bg-white hover:border-slate-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl shrink-0 ${styles.iconBg}`}>
                                <TaskIcon size={24} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-bold text-slate-800 text-sm">{task.title}</h3>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    task.priority === "high" 
                                      ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                      : "bg-amber-50 text-amber-600 border border-amber-100"
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed">{task.description}</p>
                              </div>
                            </div>
                            
                            <Link 
                              to={task.to} 
                              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm sm:self-center shrink-0 ${styles.btn}`}
                            >
                              {task.buttonText}
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Technical ML Details (Hidden by default) */}
                <details className="group bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                  <summary className="p-5 font-bold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors flex justify-between items-center list-none select-none">
                    <span className="flex items-center gap-2 text-sm"><Settings size={16} /> Advanced ML Diagnostics</span>
                    <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="p-5 bg-white border-t border-line space-y-4">
                    <p className="text-xs text-slate-500 mb-4">Under the hood, our system runs a voting ensemble of 4 distinct machine learning classifiers to determine your overall probability.</p>
                    {Object.entries(result.model_results).map(([key, model]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-28 flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{model.model_name}</span>
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${model.probability}%`,
                              backgroundColor: getGaugeColor(model.probability)
                            }}
                          ></div>
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-slate-600">
                          {model.probability}%
                        </span>
                      </div>
                    ))}
                  </div>
                </details>

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPredictor;
