import { useState, useEffect } from "react";
import { getCompanies, checkEligibility, createCompany, deleteCompanyApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";
import { Building2, IndianRupee, Calendar, GraduationCap, Target, ChevronRight, Plus, Trash2, Globe, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCompany({
        ...newCompany,
        roles: newCompany.roles.split(",").map((r) => r.trim()).filter(Boolean),
        selectionProcess: newCompany.selectionProcess.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowAdd(false);
      fetchCompanies();
    } catch (err) { alert("Failed to add company."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try { await deleteCompanyApi(id); fetchCompanies(); }
    catch (err) { alert("Failed to delete."); }
  };

  const statusColors = {
    upcoming: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
    ongoing: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    completed: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
    cancelled: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 pt-8 sm:pt-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-8 rounded-2xl bg-gradient-to-br from-amber-deep/10 to-emerald/5 border border-line shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-deep to-amber-500 text-white flex items-center justify-center shadow-md">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl mb-1 text-ink">Company Tracker</h1>
              <p className="text-muted font-body text-sm font-medium">Track placement drives, check eligibility, and stay informed</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${showAdd ? 'bg-paper border border-line text-ink hover:bg-surface' : 'bg-ink text-paper hover:bg-ink-soft'}`}
              onClick={() => setShowAdd(!showAdd)}
            >
              {showAdd ? "Cancel" : <><Plus size={18} /> Add Company</>}
            </button>
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
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all" value={newCompany.name} onChange={(e) => setNewCompany({...newCompany, name: e.target.value})} required />
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
                  <label className="block text-sm font-medium text-ink mb-1">Visit Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.visitDate} onChange={(e) => setNewCompany({...newCompany, visitDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Status</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.status} onChange={(e) => setNewCompany({...newCompany, status: e.target.value})}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Roles (comma-separated)</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.roles} onChange={(e) => setNewCompany({...newCompany, roles: e.target.value})} placeholder="SDE, Data Analyst, QA" />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Selection Process (comma-separated)</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newCompany.selectionProcess} onChange={(e) => setNewCompany({...newCompany, selectionProcess: e.target.value})} placeholder="Online Test, Technical, HR" />
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
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <div className="text-purple-500"><GraduationCap size={16} /></div>
                      <span className="font-semibold">{company.studentsPlaced} placed</span>
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

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-line">
                  {/* Hide Check Eligibility button for Admin */}
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
                    <div className="flex-1"></div>
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
    </div>
  );
};

export default CompanyTracker;
