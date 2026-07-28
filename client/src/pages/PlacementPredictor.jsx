import { useState } from "react";
import { Lightbulb, Target, Sparkles, BrainCircuit, Activity, BookOpen, Clock, Users, GraduationCap, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { predictPlacement } from "../services/api";

const PlacementPredictor = () => {
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

  const fields = [
    { key: "cgpa", label: "CGPA", min: 0, max: 10, step: 0.1, icon: GraduationCap, color: "text-blue-500" },
    { key: "aptitude_score", label: "Aptitude Score", min: 0, max: 100, step: 1, icon: BrainCircuit, color: "text-purple-500" },
    { key: "coding_score", label: "Coding Score", min: 0, max: 100, step: 1, icon: BookOpen, color: "text-emerald-500" },
    { key: "communication_score", label: "Communication Score", min: 0, max: 100, step: 1, icon: Users, color: "text-amber-500" },
    { key: "attendance", label: "Attendance %", min: 0, max: 100, step: 1, icon: Clock, color: "text-rose-500" },
    { key: "projects_count", label: "Projects Count", min: 0, max: 20, step: 1, icon: Activity, color: "text-indigo-500" },
    { key: "internships_count", label: "Internships Count", min: 0, max: 10, step: 1, icon: Target, color: "text-cyan-500" },
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
            Placement Predictor
          </h1>
          <p className="text-indigo-200/80 font-medium text-lg max-w-2xl">
            Enter your academic and skill metrics to predict your placement probability using our AI-powered ensemble of 4 ML classifiers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-6 bg-white rounded-3xl shadow-sm border border-line p-6 sm:p-8">
            <h2 className="text-xl font-bold text-ink mb-8 flex items-center gap-2">
              <Activity className="text-indigo-500" /> Your Metrics
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((field) => {
                const percentage = ((formData[field.key] - field.min) / (field.max - field.min)) * 100;
                
                return (
                  <div key={field.key} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={`metric-${field.key}`} className="flex items-center gap-2 font-medium text-slate-700 text-sm">
                        <field.icon size={16} className={field.color} />
                        {field.label}
                      </label>
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100 min-w-[3rem] text-center">
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
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        style={{
                          background: `linear-gradient(to right, #6366f1 ${percentage}%, #f1f5f9 ${percentage}%)`
                        }}
                      />
                      <style dangerouslySetInnerHTML={{
                        __html: `
                        #metric-${field.key}::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: white;
                          border: 2px solid #6366f1;
                          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                          cursor: pointer;
                          transition: transform 0.1s;
                        }
                        #metric-${field.key}::-webkit-slider-thumb:hover {
                          transform: scale(1.2);
                        }
                      `}} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                      <span>{field.min}</span>
                      <span>{field.max}</span>
                    </div>
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Predict Placement
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-coral/10 border border-coral/20 text-coral-800 rounded-xl text-sm flex items-start gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5 text-coral" size={18} />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-6 bg-white rounded-3xl shadow-sm border border-line p-6 sm:p-8 flex flex-col">
            
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20 px-4">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Target size={40} className="text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Ready for Prediction</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                  Adjust your academic and skill metrics on the left and click "Predict" to see your AI-powered analysis.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Random Forest', 'Decision Tree', 'SVM', 'KNN'].map(model => (
                    <span key={model} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-full">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <BrainCircuit size={32} className="text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Analyzing Data...</h3>
                <p className="text-slate-500">Running predictions across 4 distinct ML models</p>
              </div>
            )}

            {result && (
              <div className="animate-fade-in flex flex-col h-full">
                <h2 className="text-xl font-bold text-ink mb-8 flex items-center gap-2">
                  <Sparkles className="text-amber-500" /> Prediction Results
                </h2>

                {/* Main Gauge */}
                <div className="flex flex-col items-center mb-10">
                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full mb-6" style={{
                    background: `conic-gradient(${getGaugeColor(result.placement_probability)} ${result.placement_probability * 3.6}deg, #f1f5f9 ${result.placement_probability * 3.6}deg)`
                  }}>
                    <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-4xl font-black tracking-tight" style={{ color: getGaugeColor(result.placement_probability) }}>
                        {result.placement_probability}%
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Probability</span>
                    </div>
                  </div>
                  
                  <div className={`px-6 py-2 rounded-full font-bold text-white shadow-lg flex items-center gap-2 ${
                    result.prediction === "Placed" ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/20" : "bg-gradient-to-r from-coral to-red-400 shadow-coral/20"
                  }`}>
                    {result.prediction === "Placed" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {result.prediction}
                  </div>
                </div>

                {/* Model Breakdown */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-line pb-2">Model Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(result.model_results).map(([key, model]) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-32 flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{model.model_name}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${model.prediction === "Placed" ? "text-emerald" : "text-coral"}`}>
                            {model.prediction}
                          </span>
                        </div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${model.probability}%`,
                              backgroundColor: getGaugeColor(model.probability)
                            }}
                          ></div>
                        </div>
                        <span className="w-10 text-right text-sm font-bold text-slate-700">
                          {model.probability}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-auto bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold">
                    <Lightbulb size={20} />
                    AI Recommendation
                  </div>
                  <div className="text-amber-900/80 text-sm leading-relaxed space-y-2">
                    {result.recommendation.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPredictor;
