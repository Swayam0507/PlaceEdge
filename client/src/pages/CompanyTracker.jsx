import { useState, useEffect } from "react";
import { getCompanies, checkEligibility, createCompany, deleteCompanyApi, searchStudentsForPlacement, getCompanyPlacements, addCompanyPlacement, removeCompanyPlacement } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";
import { Building2, IndianRupee, Calendar, GraduationCap, Target, ChevronRight, Plus, Trash2, Globe, CheckCircle2, XCircle, AlertTriangle, Users, Search, X, UserPlus, Eye } from "lucide-react";

const CompanyTracker = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [eligibility, setEligibility] = useState({});
  const [newCompany, setNewCompany] = useState({
    name: "", industry: "IT/Software", website: "",
    package: { min: 0, max: 0 }, eligibility: { minCGPA: 0, branches: [], maxBacklogs: 0 },
    visitDate: "", status: "upcoming", roles: "", description: "", selectionProcess: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Placement state
  const [placementModal, setPlacementModal] = useState(null); // companyId or null
  const [viewPlacementsModal, setViewPlacementsModal] = useState(null); // companyId or null
  const [placements, setPlacements] = useState([]);
  const [placementsLoading, setPlacementsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [placementRole, setPlacementRole] = useState("");
  const [placementPackage, setPlacementPackage] = useState("");
  const [placementError, setPlacementError] = useState("");

  useEffect(() => { fetchCompanies(); }, [statusFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await getCompanies({ status: statusFilter, limit: 50 });
      setCompanies(data.companies || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckEligibility = async (id) => {
    try {
      const { data } = await checkEligibility(id);
      setEligibility({ ...eligibility, [id]: data });
    } catch (err) { console.error(err); }
  };

  const validateForm = () => {
    const errors = {};

    if (!newCompany.name.trim()) errors.name = "Company name is required.";
    if (!newCompany.visitDate) errors.visitDate = "Visit date is required.";

    const rolesArr = newCompany.roles.split(",").map(r => r.trim()).filter(Boolean);
    if (rolesArr.length === 0) errors.roles = "At least one role is required.";

    const processArr = newCompany.selectionProcess.split(",").map(s => s.trim()).filter(Boolean);
    if (processArr.length === 0) errors.selectionProcess = "At least one selection process step is required.";

    // Date-status consistency
    if (newCompany.visitDate && newCompany.status) {
      const visit = new Date(newCompany.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newCompany.status === "upcoming" && visit < today) {
        errors.visitDate = "Visit date must be today or in the future for 'Upcoming' status.";
      }
      if (newCompany.status === "completed" && visit > today) {
        errors.visitDate = "Visit date must be in the past for 'Completed' status.";
      }
    }

    return errors;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n"));
      return;
    }
    try {
      await createCompany({
        ...newCompany,
        roles: newCompany.roles.split(",").map((r) => r.trim()).filter(Boolean),
        selectionProcess: newCompany.selectionProcess.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowAdd(false);
      setFormErrors({});
      setNewCompany({
        name: "", industry: "IT/Software", website: "",
        package: { min: 0, max: 0 }, eligibility: { minCGPA: 0, branches: [], maxBacklogs: 0 },
        visitDate: "", status: "upcoming", roles: "", description: "", selectionProcess: "",
      });
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add company.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try { await deleteCompanyApi(id); fetchCompanies(); }
    catch (err) { alert("Failed to delete."); }
  };

  // --- Placement handlers ---

  const handleSearchStudents = async (query) => {
    setStudentSearch(query);
    setSelectedStudent(null);
    if (query.trim().length < 2) { setStudentResults([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await searchStudentsForPlacement(query);
      setStudentResults(data.students || []);
    } catch (err) { console.error(err); }
    finally { setSearchLoading(false); }
  };

  const handleAddPlacement = async () => {
    if (!selectedStudent) { setPlacementError("Please select a student."); return; }
    if (!placementRole.trim()) { setPlacementError("Role is required."); return; }
    setPlacementError("");
    try {
      await addCompanyPlacement(placementModal, {
        studentId: selectedStudent._id,
        role: placementRole,
        packageOffered: parseFloat(placementPackage) || 0,
      });
      // Reset and close
      setPlacementModal(null);
      setSelectedStudent(null);
      setStudentSearch("");
      setStudentResults([]);
      setPlacementRole("");
      setPlacementPackage("");
      fetchCompanies();
    } catch (err) {
      setPlacementError(err.response?.data?.message || "Failed to add placement.");
    }
  };

  const handleViewPlacements = async (companyId) => {
    setViewPlacementsModal(companyId);
    setPlacementsLoading(true);
    try {
      const { data } = await getCompanyPlacements(companyId);
      setPlacements(data.placements || []);
    } catch (err) { console.error(err); }
    finally { setPlacementsLoading(false); }
  };

  const handleRemovePlacement = async (placementId) => {
    if (!window.confirm("Remove this placement?")) return;
    try {
      await removeCompanyPlacement(viewPlacementsModal, placementId);
      setPlacements(placements.filter(p => p._id !== placementId));
      fetchCompanies();
    } catch (err) { alert("Failed to remove."); }
  };

  const statusColors = {
    upcoming: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
    ongoing: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    completed: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
    cancelled: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
  };

  const getCompanyName = (id) => companies.find(c => c._id === id)?.name || "Company";

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12">
        
        {/* Header Section */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Building2 size={14} className="text-blue-300" /> company management
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Company Tracker</h1>
            <p className="text-slate-400 max-w-xl">Track placement drives, check eligibility, and stay informed.</p>
          </div>
          
          {isAdmin && (
            <div className="relative z-10 w-full md:w-auto">
              <button 
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 ${showAdd ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 hover:shadow-blue-900/80'}`}
                onClick={() => setShowAdd(!showAdd)}
              >
                {showAdd ? "Cancel" : <><Plus size={18} /> Add Company</>}
              </button>
            </div>
          )}
        </div>

        {/* Admin Add Form */}
        {showAdd && isAdmin && (
          <div className="bg-paper p-6 sm:p-8 rounded-2xl shadow-card border border-line mb-10 animate-fade-in">
            <h2 className="font-display font-semibold text-xl mb-6 border-b border-line pb-4 flex items-center gap-2 text-ink">
              <Plus size={20} className="text-amber-deep" /> Add Company Drive
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Company Name *</label>
                  <input type="text" className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-line'} bg-paper focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all`} value={newCompany.name} onChange={(e) => { setNewCompany({...newCompany, name: e.target.value}); setFormErrors({...formErrors, name: undefined}); }} required />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Industry</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all" value={newCompany.industry} onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Min Package (LPA)</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.package.min} onChange={(e) => setNewCompany({...newCompany, package: {...newCompany.package, min: Number(e.target.value)}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Max Package (LPA)</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.package.max} onChange={(e) => setNewCompany({...newCompany, package: {...newCompany.package, max: Number(e.target.value)}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Min CGPA</label>
                  <input type="number" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.eligibility.minCGPA} onChange={(e) => setNewCompany({...newCompany, eligibility: {...newCompany.eligibility, minCGPA: Number(e.target.value)}})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Visit Date *</label>
                  <input type="date" className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.visitDate ? 'border-red-500 ring-1 ring-red-500' : 'border-line'} bg-paper focus:outline-none focus:border-ink transition-all`} value={newCompany.visitDate} onChange={(e) => { setNewCompany({...newCompany, visitDate: e.target.value}); setFormErrors({...formErrors, visitDate: undefined}); }} />
                  {formErrors.visitDate && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.visitDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Status</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.status} onChange={(e) => { setNewCompany({...newCompany, status: e.target.value}); setFormErrors({...formErrors, visitDate: undefined}); }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Roles (comma-separated) *</label>
                <input type="text" className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.roles ? 'border-red-500 ring-1 ring-red-500' : 'border-line'} bg-paper focus:outline-none focus:border-ink transition-all`} value={newCompany.roles} onChange={(e) => { setNewCompany({...newCompany, roles: e.target.value}); setFormErrors({...formErrors, roles: undefined}); }} placeholder="SDE, Data Analyst, QA" />
                {formErrors.roles && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.roles}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Selection Process (comma-separated) *</label>
                <input type="text" className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.selectionProcess ? 'border-red-500 ring-1 ring-red-500' : 'border-line'} bg-paper focus:outline-none focus:border-ink transition-all`} value={newCompany.selectionProcess} onChange={(e) => { setNewCompany({...newCompany, selectionProcess: e.target.value}); setFormErrors({...formErrors, selectionProcess: undefined}); }} placeholder="Online Test, Technical, HR" />
                {formErrors.selectionProcess && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.selectionProcess}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.description} onChange={(e) => setNewCompany({...newCompany, description: e.target.value})} rows={3} />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-ink text-paper rounded-xl font-medium text-sm hover:bg-ink-soft transition-all shadow-md">
                  💾 Save Company
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["", "upcoming", "ongoing", "completed", "cancelled"].map((s) => (
            <button 
              key={s} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter === s ? "bg-ink text-paper shadow-sm" : "bg-paper text-ink-soft border border-line hover:bg-paper hover:text-ink"}`}
              onClick={() => setStatusFilter(s)}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-line border-t-amber rounded-full animate-spin mb-4"></div>
            <p className="text-ink-soft font-medium">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-paper border border-line border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-muted mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink mb-2">No companies found</h3>
            <p className="text-ink-soft text-sm">{isAdmin ? "Add a company drive to get started!" : "Check back later for upcoming drives."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div key={company._id} className="bg-paper rounded-2xl shadow-sm border border-line p-6 flex flex-col transition-all hover:shadow-md">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-xl text-ink">{company.name}</h3>
                    <span className="text-sm text-ink-soft">{company.industry}</span>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize" 
                    style={{ background: statusColors[company.status]?.bg, color: statusColors[company.status]?.color }}
                  >
                    {company.status}
                  </span>
                </div>

                {company.description && <p className="text-sm text-ink-soft mb-5">{company.description}</p>}

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 p-4 bg-surface rounded-xl border border-line">
                  {company.package?.max > 0 && (
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <div className="text-emerald"><IndianRupee size={16} /></div>
                      <span className="font-semibold">₹{company.package.min}-{company.package.max} LPA</span>
                    </div>
                  )}
                  {company.visitDate && (
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <div className="text-blue-500"><Calendar size={16} /></div>
                      <span className="font-semibold">{formatDate(company.visitDate)}</span>
                    </div>
                  )}
                  {company.eligibility?.minCGPA > 0 && (
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <div className="text-amber-deep"><Target size={16} /></div>
                      <span className="font-semibold">Min CGPA: {company.eligibility.minCGPA}</span>
                    </div>
                  )}
                  {company.studentsPlaced > 0 && (
                    <div
                      className="flex items-center gap-2 text-sm text-ink cursor-pointer hover:text-purple-600 transition-colors"
                      onClick={() => handleViewPlacements(company._id)}
                      title="Click to view placed students"
                    >
                      <div className="text-purple-500"><GraduationCap size={16} /></div>
                      <span className="font-semibold underline decoration-dotted">{company.studentsPlaced} placed</span>
                    </div>
                  )}
                </div>

                {company.roles?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.roles.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-amber/10 text-amber-deep text-xs font-semibold rounded-full border border-amber/20">
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {company.selectionProcess?.length > 0 && (
                  <div className="text-sm text-ink-soft mb-6">
                    <span className="font-semibold text-ink">Process:</span>{" "}
                    {company.selectionProcess.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5">
                        {s}{i < company.selectionProcess.length - 1 && <ChevronRight size={14} className="text-muted" />}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-line gap-2">
                  {/* Student: Check Eligibility | Admin: Add Placement + View */}
                  {!isAdmin ? (
                    <div className="flex-1 mr-4">
                      <button 
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                          eligibility[company._id] 
                            ? (eligibility[company._id].eligible ? "bg-emerald/10 text-emerald border border-emerald/20" : "bg-coral/10 text-coral border border-coral/20") 
                            : "bg-paper border border-line text-ink hover:bg-surface"
                        }`}
                        onClick={() => handleCheckEligibility(company._id)}
                      >
                        {eligibility[company._id] ? (eligibility[company._id].eligible ? <><CheckCircle2 size={18} /> Eligible</> : <><XCircle size={18} /> Not Eligible</>) : "Check Eligibility"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <button
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100"
                        onClick={() => {
                          setPlacementModal(company._id);
                          setPlacementError("");
                          setSelectedStudent(null);
                          setStudentSearch("");
                          setStudentResults([]);
                          setPlacementRole("");
                          setPlacementPackage("");
                        }}
                        title="Add a placed student"
                      >
                        <UserPlus size={16} /> Add Placed
                      </button>
                      {company.studentsPlaced > 0 && (
                        <button
                          className="py-2.5 px-4 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                          onClick={() => handleViewPlacements(company._id)}
                          title="View placed students"
                        >
                          <Eye size={16} /> View
                        </button>
                      )}
                    </div>
                  )}
                  
                  {isAdmin && (
                    <button 
                      className="p-2.5 rounded-xl bg-coral/10 text-coral hover:bg-coral/20 transition-colors border border-coral/20 flex items-center justify-center" 
                      onClick={() => handleDelete(company._id)}
                      title="Delete Company"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Eligibility Issues Warning */}
                {!isAdmin && eligibility[company._id] && !eligibility[company._id].eligible && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {eligibility[company._id].issues?.map((issue, i) => (
                      <span key={i} className="text-xs text-coral bg-coral/10 px-2.5 py-1.5 rounded-md border border-coral/20 flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={14} /> {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Add Placement Modal ===== */}
      {placementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPlacementModal(null)}>
          <div className="bg-paper rounded-2xl shadow-2xl border border-line w-full max-w-lg p-6 sm:p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                <UserPlus size={22} className="text-purple-500" /> Add Placed Student
              </h2>
              <button onClick={() => setPlacementModal(null)} className="p-2 rounded-lg hover:bg-surface transition-colors">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-4">
              Company: <span className="font-semibold text-ink">{getCompanyName(placementModal)}</span>
            </p>

            {/* Student Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1">Search Student *</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all"
                  placeholder="Type student name or email..."
                  value={studentSearch}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                />
              </div>

              {/* Search Results Dropdown */}
              {studentResults.length > 0 && !selectedStudent && (
                <div className="mt-1 border border-line rounded-xl bg-paper shadow-lg max-h-48 overflow-y-auto">
                  {studentResults.map((s) => (
                    <button
                      key={s._id}
                      className="w-full text-left px-4 py-3 hover:bg-surface transition-colors border-b border-line last:border-none flex justify-between items-center"
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentSearch(s.name);
                        setStudentResults([]);
                      }}
                    >
                      <div>
                        <span className="font-semibold text-sm text-ink">{s.name}</span>
                        <span className="text-xs text-ink-soft ml-2">{s.email}</span>
                      </div>
                      <span className="text-xs text-muted">{s.branch} · CGPA {s.cgpa}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchLoading && <p className="text-xs text-muted mt-1">Searching...</p>}

              {/* Selected Student Chip */}
              {selectedStudent && (
                <div className="mt-2 flex items-center gap-2 bg-emerald/10 text-emerald px-3 py-2 rounded-lg border border-emerald/20">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-semibold">{selectedStudent.name}</span>
                  <span className="text-xs opacity-70">({selectedStudent.email})</span>
                  <button className="ml-auto" onClick={() => { setSelectedStudent(null); setStudentSearch(""); }}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1">Role Offered *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all"
                placeholder="e.g. Software Engineer"
                value={placementRole}
                onChange={(e) => setPlacementRole(e.target.value)}
              />
            </div>

            {/* Package */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-ink mb-1">Package Offered (LPA)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all"
                placeholder="e.g. 8.5"
                value={placementPackage}
                onChange={(e) => setPlacementPackage(e.target.value)}
              />
            </div>

            {placementError && (
              <p className="text-red-500 text-sm font-medium mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{placementError}</p>
            )}

            <button
              onClick={handleAddPlacement}
              className="w-full py-3 bg-ink text-paper rounded-xl font-bold text-sm hover:bg-ink-soft transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Confirm Placement
            </button>
          </div>
        </div>
      )}

      {/* ===== View Placements Modal ===== */}
      {viewPlacementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewPlacementsModal(null)}>
          <div className="bg-paper rounded-2xl shadow-2xl border border-line w-full max-w-2xl p-6 sm:p-8 animate-fade-in max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                <Users size={22} className="text-purple-500" /> Placed Students
              </h2>
              <button onClick={() => setViewPlacementsModal(null)} className="p-2 rounded-lg hover:bg-surface transition-colors">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-5">
              Company: <span className="font-semibold text-ink">{getCompanyName(viewPlacementsModal)}</span>
            </p>

            {placementsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-line border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : placements.length === 0 ? (
              <div className="text-center py-10 text-ink-soft">
                <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No placement records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {placements.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-line hover:border-purple-200 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-ink">{p.student?.name || "Unknown"}</span>
                        <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded-full border border-line">{p.student?.branch}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-soft">
                        <span>{p.student?.email}</span>
                        <span>•</span>
                        <span className="font-semibold text-purple-600">{p.role}</span>
                        {p.packageOffered > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald">₹{p.packageOffered} LPA</span>
                          </>
                        )}
                        <span>•</span>
                        <span>CGPA: {p.student?.cgpa}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        className="p-2 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors border border-coral/20 ml-3"
                        onClick={() => handleRemovePlacement(p._id)}
                        title="Remove placement"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTracker;
