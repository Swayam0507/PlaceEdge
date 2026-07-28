import { useState, useEffect } from "react";
import {
  getAllQuestions, addQuestion, updateQuestion, deleteQuestion, bulkImportQuestions,
} from "../services/api";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFileText, FiUpload, FiX, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", difficulty: "", search: "", page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    category: "quantitative", question: "", options: ["", "", "", ""],
    correctAnswer: 0, difficulty: "medium", explanation: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJSON, setBulkJSON] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [filters.page, filters.category, filters.difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getAllQuestions({
        page: filters.page, limit: 15,
        category: filters.category, difficulty: filters.difficulty, search: filters.search,
      });
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);

      // Fetch counts for all categories
      const [allQ, quantQ, logQ, techQ] = await Promise.all([
        getAllQuestions({ limit: 1 }),
        getAllQuestions({ limit: 1, category: 'quantitative' }),
        getAllQuestions({ limit: 1, category: 'logical' }),
        getAllQuestions({ limit: 1, category: 'technical' }),
      ]);
      setCategoryCounts({
        all: allQ.data.pagination?.count || 0,
        quantitative: quantQ.data.pagination?.count || 0,
        logical: logQ.data.pagination?.count || 0,
        technical: techQ.data.pagination?.count || 0,
      });
    } catch (err) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchQuestions();
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      category: "quantitative", question: "", options: ["", "", "", ""],
      correctAnswer: 0, difficulty: "medium", explanation: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category, question: q.question, options: [...q.options],
      correctAnswer: q.correctAnswer, difficulty: q.difficulty, explanation: q.explanation || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    if (!formData.question.trim()) { setFormError("Question text is required."); setSaving(false); return; }
    if (formData.options.some((o) => !o.trim())) { setFormError("All 4 options are required."); setSaving(false); return; }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, formData);
        toast.success("Question updated!");
      } else {
        await addQuestion(formData);
        toast.success("Question added!");
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
      toast.success("Question deleted");
    } catch (err) {
      toast.error("Failed to delete question.");
    }
  };

  const handleBulkImport = async () => {
    setBulkImporting(true);
    try {
      const parsed = JSON.parse(bulkJSON);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      await bulkImportQuestions(questions);
      toast.success(`${questions.length} questions imported!`);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkJSON(ev.target.result);
    reader.readAsText(file);
  };

  const sampleJSON = JSON.stringify([{
    category: "quantitative", question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"], correctAnswer: 1,
    difficulty: "easy", explanation: "Basic addition"
  }], null, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display font-bold text-2xl text-ink mb-1">
              <FiFileText className="text-blue-500" /> Manage Questions
            </h1>
            <p className="text-muted text-sm font-medium">Add, edit, and delete aptitude questions ({categoryCounts.all || 0} total)</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-line text-ink font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm" onClick={() => setShowBulkModal(true)}>
              <FiUpload size={16} /> Bulk Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-ink text-white font-bold text-sm rounded-xl hover:bg-ink-soft transition-colors shadow-sm" onClick={openAddModal}>
              <FiPlus size={16} /> Add Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-line shadow-sm flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="relative w-full flex-1">
            <input type="text" placeholder="Search questions..." value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line bg-gray-50 text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm" id="admin-question-search" />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
              <FiSearch size={18} />
            </button>
          </form>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm appearance-none font-medium" id="admin-category-filter">
            <option value="">All Categories ({categoryCounts.all || 0})</option>
            <option value="quantitative">Quantitative ({categoryCounts.quantitative || 0})</option>
            <option value="logical">Logical ({categoryCounts.logical || 0})</option>
            <option value="technical">Technical ({categoryCounts.technical || 0})</option>
          </select>
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all text-sm appearance-none font-medium" id="admin-difficulty-filter">
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-line shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-muted font-medium">Loading questions...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-line text-xs uppercase tracking-wider text-muted font-semibold">
                      <th className="p-4 w-2/5">Question</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Difficulty</th>
                      <th className="p-4">Correct</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {questions.map((q) => (
                      <tr key={q._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-medium text-ink text-sm">
                          {q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                            q.category === 'quantitative' ? 'bg-blue-100 text-blue-700' :
                            q.category === 'logical' ? 'bg-purple-100 text-purple-700' :
                            q.category === 'technical' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {q.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                            q.difficulty === 'easy' ? 'bg-emerald-soft text-emerald' :
                            q.difficulty === 'medium' ? 'bg-amber-100 text-amber-deep' :
                            q.difficulty === 'hard' ? 'bg-coral/20 text-coral' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-ink-soft">
                          {q.options[q.correctAnswer]?.substring(0, 20)}...
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" onClick={() => openEditModal(q)} title="Edit">
                              <FiEdit2 size={16} />
                            </button>
                            <button className="p-2 text-coral hover:bg-coral/10 rounded-lg transition-colors" onClick={() => handleDelete(q._id)} title="Delete">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {questions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-muted">
                          <div className="flex flex-col items-center gap-3 opacity-50">
                            <FiFileText size={48} />
                            <p className="text-sm font-medium">No questions found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.total > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-line shadow-sm">
                <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 text-sm font-bold bg-gray-50 border border-line rounded-xl text-ink hover:bg-gray-100 disabled:opacity-50 transition-colors">← Prev</button>
                <span className="text-sm font-medium text-muted">Page <span className="text-ink font-bold">{pagination.current}</span> of {pagination.total} ({pagination.count} total)</span>
                <button disabled={filters.page >= pagination.total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 text-sm font-bold bg-gray-50 border border-line rounded-xl text-ink hover:bg-gray-100 disabled:opacity-50 transition-colors">Next →</button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-gray-50/50">
                <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                  {editingQuestion ? <><FiEdit2 className="text-indigo-500" /> Edit Question</> : <><FiPlus className="text-emerald" /> Add Question</>}
                </h2>
                <button className="p-2 text-muted hover:text-ink hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="q-category" className="block text-sm font-bold text-ink mb-1.5">Category</label>
                    <select id="q-category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none">
                      <option value="quantitative">Quantitative</option>
                      <option value="logical">Logical</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="q-difficulty" className="block text-sm font-bold text-ink mb-1.5">Difficulty</label>
                    <select id="q-difficulty" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="q-text" className="block text-sm font-bold text-ink mb-1.5">Question Text</label>
                  <textarea id="q-text" rows="3" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} placeholder="Enter the question..." className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y" />
                </div>
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-line">
                  <label className="block text-sm font-bold text-ink">Options (select correct answer)</label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input type="radio" name="correctAnswer" checked={formData.correctAnswer === i} onChange={() => setFormData({ ...formData, correctAnswer: i })} id={`option-radio-${i}`} className="w-5 h-5 text-ink focus:ring-ink border-line" />
                      <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} id={`option-text-${i}`} className={`flex-1 px-4 py-2 rounded-xl border ${formData.correctAnswer === i ? 'border-emerald ring-1 ring-emerald/20 bg-emerald-soft/30' : 'border-line bg-white'} text-ink focus:outline-none transition-all`} />
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="q-explanation" className="block text-sm font-bold text-ink mb-1.5">Explanation (optional)</label>
                  <textarea id="q-explanation" rows="2" value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} placeholder="Explain the correct answer..." className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y" />
                </div>
                {formError && <div className="bg-coral/10 border border-coral/50 text-coral px-4 py-3 rounded-xl text-sm font-medium">{formError}</div>}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-line mt-6">
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-ink bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-ink hover:bg-ink-soft rounded-xl transition-colors shadow-sm disabled:opacity-70" disabled={saving}>{saving ? "Saving..." : editingQuestion ? "Update Question" : "Add Question"}</button>
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
                  <FiUpload className="text-indigo-500" /> Bulk Import Questions
                </h2>
                <button className="p-2 text-muted hover:text-ink hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setShowBulkModal(false)}><FiX size={20} /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-sm text-muted font-medium">
                  Upload a JSON file or paste JSON array below. Each question must have: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">category</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">question</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">options</code> (array of 4), <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">correctAnswer</code> (0-3), <code className="bg-gray-100 px-1.5 py-0.5 rounded text-ink font-mono text-xs">difficulty</code>.
                </p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-line rounded-xl text-sm font-bold text-ink cursor-pointer hover:bg-gray-100 transition-colors">
                    <FiUpload size={16} /> Upload JSON File
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button onClick={() => setBulkJSON(sampleJSON)} className="px-4 py-2 bg-white border border-line rounded-xl text-sm font-bold text-ink hover:bg-gray-50 transition-colors">
                    Load Sample
                  </button>
                </div>

                <textarea
                  value={bulkJSON}
                  onChange={(e) => setBulkJSON(e.target.value)}
                  placeholder='[{"category":"quantitative","question":"...","options":["A","B","C","D"],"correctAnswer":0,"difficulty":"medium"}]'
                  rows="12"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-gray-50 text-ink font-mono text-xs focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-y"
                />

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

export default AdminQuestions;
