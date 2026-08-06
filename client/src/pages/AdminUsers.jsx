import { useState, useEffect } from "react";
import { getAdminUsers, updateAdminUser, deleteAdminUser, getTestHistory } from "../services/api";
import { Edit2, Trash2, Search, Users, Eye, ArrowUp, ArrowDown, X, TrendingUp, Calendar, BookOpen, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend as ChartLegend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip, ChartLegend);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", page: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", branch: "", semester: 1, cgpa: 0 });
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [detailUser, setDetailUser] = useState(null);
  const [detailTests, setDetailTests] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        page: filters.page,
        limit: 15,
        search: filters.search,
        role: "student",
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ 
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student", 
      branch: user.branch || "", 
      semester: user.semester || 1,
      cgpa: user.cgpa || 0
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminUser(editingUser._id, editForm);
      setEditingUser(null);
      fetchUsers();
      toast.success("Student updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all their test history and resumes.`)) return;
    try {
      await deleteAdminUser(id);
      fetchUsers();
      toast.success(`"${name}" deleted successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const openDetailModal = async (user) => {
    setDetailUser(user);
    setDetailLoading(true);
    try {
      const res = await getTestHistory({ userId: user._id, limit: 50 });
      setDetailTests(res.data.tests || res.data.history || []);
    } catch {
      setDetailTests([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  // Client-side sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let valA = a[sortField], valB = b[sortField];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUp size={12} style={{ opacity: 0.2 }} />;
    return sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  // Detail modal chart data
  const detailChartData = detailTests.length > 0 ? {
    labels: detailTests.slice().reverse().map((t, i) => `Test ${i + 1}`),
    datasets: [{
      label: 'Score %',
      data: detailTests.slice().reverse().map(t => t.percentage),
      borderColor: '#ea580c',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#ea580c',
    }],
  } : null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in font-body">
      <div className="flex flex-col space-y-8">
        
        {/* Header Section */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Users size={14} className="text-blue-300 animate-pulse" /> student directory
            </div>
            <h1 className="font-display font-black text-3xl tracking-tight mb-2">Manage Students</h1>
            <p className="text-slate-350 text-sm font-medium">View, edit, and manage platform students ({pagination.count || 0} total)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium"
              id="admin-user-search"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-650 transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-card">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-semibold text-sm">Loading students...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-450 font-bold select-none">
                      <th onClick={() => handleSort("name")} className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <span className="flex items-center gap-1.5">Name <SortIcon field="name" /></span>
                      </th>
                      <th className="p-4">Email</th>
                      <th onClick={() => handleSort("branch")} className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <span className="flex items-center gap-1.5">Branch <SortIcon field="branch" /></span>
                      </th>
                      <th onClick={() => handleSort("cgpa")} className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <span className="flex items-center gap-1.5">CGPA <SortIcon field="cgpa" /></span>
                      </th>
                      <th onClick={() => handleSort("totalTests")} className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <span className="flex items-center gap-1.5">Tests <SortIcon field="totalTests" /></span>
                      </th>
                      <th onClick={() => handleSort("avgScore")} className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors">
                        <span className="flex items-center gap-1.5">Avg Score <SortIcon field="avgScore" /></span>
                      </th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100 last:border-none">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800 whitespace-nowrap">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{user.email}</td>
                        <td className="p-4 text-slate-500 text-sm">{user.branch || "—"}</td>
                        <td className="p-4 text-slate-800 text-sm font-bold">{user.cgpa || "—"}</td>
                        <td className="p-4 text-slate-500 text-sm font-semibold">{user.totalTests}</td>
                        <td className="p-4">
                          <span className={`font-bold text-sm ${
                            user.avgScore >= 70 ? "text-emerald" : user.avgScore >= 40 ? "text-amber" : "text-coral"
                          }`}>
                            {user.avgScore}%
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="p-2 text-emerald border border-slate-100 hover:bg-emerald/10 hover:border-emerald/20 rounded-xl transition-all" 
                              onClick={() => openDetailModal(user)} 
                              title="View Details"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              className="p-2 text-amber-deep border border-slate-100 hover:bg-amber-50 hover:border-amber-200 rounded-xl transition-all" 
                              onClick={() => openEditModal(user)} 
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              className="p-2 text-coral border border-slate-100 hover:bg-coral/10 hover:border-coral/20 rounded-xl transition-all" 
                              onClick={() => handleDelete(user._id, user.name)} 
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-slate-450">
                          <div className="flex flex-col items-center gap-3 opacity-60">
                            <Users size={48} className="text-slate-350" />
                            <p className="text-sm font-semibold">No students found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
                <button 
                  disabled={filters.page <= 1} 
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })} 
                  className="px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-all"
                >
                  ← Prev
                </button>
                <span className="text-xs font-bold text-slate-450">
                  Page <span className="text-slate-800 font-extrabold">{pagination.current}</span> of {pagination.total} ({pagination.count} total)
                </span>
                <button 
                  disabled={filters.page >= pagination.total} 
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })} 
                  className="px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setEditingUser(null)}>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-floating w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-display font-black text-lg text-slate-800 flex items-center gap-2">
                  <Edit2 className="text-amber-500" /> Edit Student
                </h2>
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" onClick={() => setEditingUser(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Name</label>
                  <input 
                    id="edit-name" 
                    type="text" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                    placeholder="Student Name" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    id="edit-email" 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                    placeholder="Student Email" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-branch" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Branch</label>
                    <input 
                      id="edit-branch" 
                      type="text" 
                      value={editForm.branch} 
                      onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })} 
                      placeholder="e.g., Computer Science" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-semester" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Semester</label>
                    <input 
                      id="edit-semester" 
                      type="number" 
                      min="1" 
                      max="8" 
                      value={editForm.semester} 
                      onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value) || 1 })} 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-cgpa" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">CGPA</label>
                    <input 
                      id="edit-cgpa" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="10" 
                      value={editForm.cgpa} 
                      onChange={(e) => setEditForm({ ...editForm, cgpa: parseFloat(e.target.value) || 0 })} 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-role" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Role</label>
                    <select 
                      id="edit-role" 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all" 
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/10 disabled:opacity-75" 
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Update Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {detailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setDetailUser(null)}>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-floating w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-display font-black text-lg text-slate-800 flex items-center gap-2">
                  <Eye className="text-indigo-500" /> Student Profile
                </h2>
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" onClick={() => setDetailUser(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Student Info */}
                <div className="flex items-center gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-subtle">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
                    {detailUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">{detailUser.name}</h3>
                    <p className="text-sm text-indigo-600 font-semibold mt-1">{detailUser.email}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Branch', value: detailUser.branch || '—', icon: BookOpen, colorClass: "text-slate-800" },
                    { label: 'CGPA', value: detailUser.cgpa || '—', icon: TrendingUp, colorClass: "text-slate-800" },
                    { label: 'Tests Completed', value: detailUser.totalTests, icon: Calendar, colorClass: "text-slate-850" },
                    { 
                      label: 'Avg Score', 
                      value: `${detailUser.avgScore}%`, 
                      icon: TrendingUp, 
                      colorClass: detailUser.avgScore >= 70 ? "text-emerald" : detailUser.avgScore >= 40 ? "text-amber" : "text-coral"
                    },
                  ].map((s, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl text-center shadow-card">
                      <div className={`text-2xl font-black mb-1 ${s.colorClass}`}>{s.value}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Score Trend Chart */}
                {detailLoading ? (
                  <p className="text-center text-slate-400 py-8 text-sm font-semibold animate-pulse">Loading test history...</p>
                ) : detailChartData ? (
                  <div>
                    <h4 className="flex items-center gap-2 font-display font-black text-xs text-slate-650 uppercase tracking-wider mb-3">
                      <TrendingUp size={15} className="text-indigo-500" /> Score Trend
                    </h4>
                    <div className="h-48 p-4 bg-white border border-slate-100 rounded-2xl shadow-card">
                      <Line data={detailChartData} options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, max: 100 } }
                      }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-8 text-sm font-semibold bg-slate-50 rounded-2xl">No test history available.</p>
                )}

                {/* Test History Table */}
                {detailTests.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-display font-black text-xs text-slate-650 uppercase tracking-wider mb-3">
                      <Calendar size={15} className="text-indigo-500" /> Recent Tests
                    </h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-card">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            <tr>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Score</th>
                              <th className="px-4 py-3">%</th>
                              <th className="px-4 py-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {detailTests.slice(0, 20).map((t, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
                                <td className="px-4 py-3 font-semibold text-slate-800 capitalize">{t.category}</td>
                                <td className="px-4 py-3 text-slate-500 font-medium">{t.score}/{t.totalQuestions}</td>
                                <td className={`px-4 py-3 font-bold ${
                                  t.percentage >= 70 ? "text-emerald" : t.percentage >= 40 ? "text-amber" : "text-coral"
                                }`}>{t.percentage}%</td>
                                <td className="px-4 py-3 text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
