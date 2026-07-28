import { useState, useEffect } from "react";
import {
  getInterviewQuestions, addInterviewQuestion,
  bulkAddInterviewQuestions, deleteInterviewQuestion,
} from "../services/api";
import {
  MessageSquare, Plus, Trash2, Search,
  Upload, X, Tag, Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["hr", "technical", "behavioral", "company-specific"];
const DIFFICULTIES = ["easy", "medium", "hard"];

const AdminInterviewQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", difficulty: "", company: "" });
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkJSON, setBulkJSON] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [formData, setFormData] = useState({
    category: "technical",
    question: "",
    sampleAnswer: "",
    tips: [""],
    difficulty: "medium",
    company: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, [filters.category, filters.difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.company) params.company = filters.company;
      const res = await getInterviewQuestions(params);
      setQuestions(res.data.questions || res.data || []);
    } catch (err) {
      toast.error("Failed to load interview questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      toast.error("Question text is required");
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...formData,
        tips: formData.tips.filter(t => t.trim()),
      };
      await addInterviewQuestion(data);
      toast.success("Interview question added!");
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this interview question?")) return;
    try {
      await deleteInterviewQuestion(id);
      toast.success("Question deleted");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleBulkImport = async () => {
    setBulkImporting(true);
    try {
      const parsed = JSON.parse(bulkJSON);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      await bulkAddInterviewQuestions(questions);
      toast.success(`${questions.length} interview questions imported!`);
      setShowBulkModal(false);
      setBulkJSON("");
      fetchQuestions();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else {
        toast.error(err.response?.data?.message || "Bulk import failed");
      }
    } finally {
      setBulkImporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "technical", question: "", sampleAnswer: "",
      tips: [""], difficulty: "medium", company: "", tags: [],
    });
    setTagInput("");
  };

  const addTip = () => setFormData({ ...formData, tips: [...formData.tips, ""] });
  const updateTip = (i, val) => {
    const tips = [...formData.tips];
    tips[i] = val;
    setFormData({ ...formData, tips });
  };
  const removeTip = (i) => {
    const tips = formData.tips.filter((_, idx) => idx !== i);
    setFormData({ ...formData, tips: tips.length ? tips : [""] });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };
  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkJSON(ev.target.result);
    reader.readAsText(file);
  };

  const getCategoryColor = (cat) => {
    const colors = { hr: '#10b981', technical: '#6366f1', behavioral: '#f59e0b', 'company-specific': '#0ea5e9' };
    return colors[cat] || '#6366f1';
  };

  const sampleJSON = JSON.stringify([{
    category: "technical",
    question: "Explain the difference between REST and GraphQL?",
    sampleAnswer: "REST uses multiple endpoints with fixed data structures...",
    tips: ["Compare request/response patterns", "Mention over-fetching"],
    difficulty: "medium",
    company: "Google",
    tags: ["api", "backend"],
  }], null, 2);

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display font-bold text-2xl text-ink mb-1">
              <MessageSquare className="text-blue-500" /> Interview Questions
            </h1>
            <p className="text-muted text-sm font-medium">Manage interview preparation questions ({questions.length} shown)</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-line text-ink font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm" onClick={() => setShowBulkModal(true)}>
              <Upload size={16} /> Bulk Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-ink text-white font-bold text-sm rounded-xl hover:bg-ink-soft transition-colors shadow-sm" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={16} /> Add Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-line shadow-sm flex flex-col md:flex-row items-center gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm appearance-none font-medium capitalize"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm appearance-none font-medium capitalize"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-line shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-muted font-medium">Loading interview questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-muted bg-white rounded-2xl border border-line shadow-sm">
            <div className="flex flex-col items-center gap-3 opacity-50">
              <MessageSquare size={48} />
              <p className="text-sm font-medium">No interview questions found.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.map((q) => (
              <div key={q._id} className="bg-white rounded-2xl p-6 border border-line shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Category & Difficulty badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                        q.category === 'hr' ? 'bg-emerald-soft text-emerald' :
                        q.category === 'technical' ? 'bg-indigo-100 text-indigo-700' :
                        q.category === 'behavioral' ? 'bg-amber-100 text-amber-deep' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {q.category}
                      </span>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                        q.difficulty === 'easy' ? 'bg-emerald-soft text-emerald' :
                        q.difficulty === 'medium' ? 'bg-amber-100 text-amber-deep' :
                        q.difficulty === 'hard' ? 'bg-coral/20 text-coral' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.company && (
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          {q.company}
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <p className="text-base font-bold text-ink leading-relaxed">
                      {q.question}
                    </p>

                    {/* Sample Answer (truncated) */}
                    {q.sampleAnswer && (
                      <p className="text-sm text-ink-soft leading-relaxed bg-gray-50 p-3 rounded-xl border border-line">
                        <strong className="text-ink">Sample:</strong> {q.sampleAnswer.length > 150 ? q.sampleAnswer.substring(0, 150) + '...' : q.sampleAnswer}
                      </p>
                    )}

                    {/* Tags */}
                    {q.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {q.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-ink-soft">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="p-2 text-coral hover:bg-coral/10 rounded-lg transition-colors shrink-0" onClick={() => handleDelete(q._id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-gray-50/50">
                <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                  <Plus className="text-emerald" /> Add Interview Question
                </h2>
                <button className="p-2 text-muted hover:text-ink hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddQuestion} className="p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Difficulty</label>
                    <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none capitalize">
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Company <span className="font-normal text-muted">(optional)</span></label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g., Google" className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Question</label>
                  <textarea rows="3" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Enter the interview question..." className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Sample Answer <span className="font-normal text-muted">(optional)</span></label>
                  <textarea rows="3" value={formData.sampleAnswer} onChange={(e) => setFormData({ ...formData, sampleAnswer: e.target.value })} placeholder="Provide a model answer..." className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y" />
                </div>

                {/* Tips */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-line space-y-3">
                  <label className="flex justify-between items-center text-sm font-bold text-ink">
                    Tips
                    <button type="button" onClick={addTip} className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-lg transition-colors">+ Add Tip</button>
                  </label>
                  {formData.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={tip} onChange={(e) => updateTip(i, e.target.value)} placeholder={`Tip ${i + 1}`} className="flex-1 px-4 py-2 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm" />
                      {formData.tips.length > 1 && (
                        <button type="button" onClick={() => removeTip(i)} className="p-2 text-coral hover:bg-coral/10 rounded-xl transition-colors border border-transparent hover:border-coral/20">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {tag}
                        <X size={14} className="cursor-pointer hover:text-indigo-800" onClick={() => removeTag(tag)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag and press Enter" className="flex-1 px-4 py-2 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm" />
                    <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-ink font-bold text-sm rounded-xl transition-colors">Add</button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-line mt-6">
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-ink bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-ink hover:bg-ink-soft rounded-xl transition-colors shadow-sm disabled:opacity-70" disabled={saving}>{saving ? "Saving..." : "Add Question"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowBulkModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-gray-50/50">
                <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                  <Upload className="text-indigo-500" /> Bulk Import Interview Questions
                </h2>
                <button className="p-2 text-muted hover:text-ink hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setShowBulkModal(false)}><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-sm text-muted font-medium">
                  Upload JSON with fields: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">category</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">question</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">sampleAnswer</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">tips</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">difficulty</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">company</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">tags</code>
                </p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-line rounded-xl text-sm font-bold text-ink cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload size={16} /> Upload File
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button onClick={() => setBulkJSON(sampleJSON)} className="px-4 py-2 bg-white border border-line rounded-xl text-sm font-bold text-ink hover:bg-gray-50 transition-colors">Load Sample</button>
                </div>
                <textarea value={bulkJSON} onChange={(e) => setBulkJSON(e.target.value)} rows="12" className="w-full px-4 py-3 rounded-xl border border-line bg-gray-50 text-ink font-mono text-xs focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y" placeholder="Paste JSON array here..." />
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-line mt-6">
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-ink bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" onClick={() => setShowBulkModal(false)}>Cancel</button>
                  <button className="px-5 py-2.5 text-sm font-bold text-white bg-ink hover:bg-ink-soft rounded-xl transition-colors shadow-sm disabled:opacity-70" disabled={bulkImporting || !bulkJSON.trim()} onClick={handleBulkImport}>
                    {bulkImporting ? "Importing..." : "Import Questions"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInterviewQuestions;
