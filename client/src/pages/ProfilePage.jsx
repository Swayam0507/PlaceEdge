import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import { BRANCHES, SEMESTERS } from "../utils/helpers";
import { 
  FiEdit2, FiCheckSquare, FiBarChart2, FiFileText, FiTrendingUp, 
  FiPhone, FiGithub, FiLinkedin, FiCalendar, FiBook, FiUser, FiStar,
  FiAward, FiSettings, FiGlobe, FiBriefcase
} from "react-icons/fi";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "", branch: "", semester: 1, cgpa: 0,
    bio: "", phone: "", linkedin: "", github: "", skills: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.profile);
      setFormData({
        name: data.profile.name || "",
        branch: data.profile.branch || "",
        semester: data.profile.semester || 1,
        cgpa: data.profile.cgpa || 0,
        bio: data.profile.bio || "",
        phone: data.profile.phone || "",
        linkedin: data.profile.linkedin || "",
        github: data.profile.github || "",
        skills: (data.profile.skills || []).join(", "),
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        cgpa: parseFloat(formData.cgpa) || 0,
        semester: parseInt(formData.semester) || 1,
      };
      await updateProfile(payload);
      setMessage("Profile updated successfully! 🎉");
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in font-body pb-12">
      {message && (
        <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 shadow-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message}
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-8 sm:p-10 mb-6 border border-white shadow-xl shadow-indigo-900/10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-[2rem] bg-white/10 backdrop-blur-xl border-4 border-white/20 p-2 shadow-2xl shrink-0 overflow-hidden group">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.name || 'User'}&backgroundColor=transparent`} 
              alt="Avatar" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
              <div>
                <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mb-2 drop-shadow-sm">{profile?.name}</h1>
                <p className="text-indigo-100 font-medium text-lg flex items-center justify-center md:justify-start gap-2 mb-4">
                  <FiGlobe className="text-indigo-300" /> {profile?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${isAdmin ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' : 'bg-blue-500/20 text-blue-200 border-blue-500/30'}`}>
                    <FiUser className="inline mr-1 mb-0.5" /> {isAdmin ? 'Admin' : 'Student'}
                  </span>
                  {!isAdmin && profile?.branch && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-sm">
                      <FiBook className="inline mr-1 mb-0.5" /> {profile.branch}
                    </span>
                  )}
                  {!isAdmin && profile?.semester && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-sm">
                      <FiCalendar className="inline mr-1 mb-0.5" /> Sem {profile.semester}
                    </span>
                  )}
                  {!isAdmin && profile?.cgpa > 0 && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-sm flex items-center gap-1">
                      <FiStar className="text-amber-300" /> {profile.cgpa} CGPA
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setEditing(!editing)}
                className="px-6 py-3 bg-white text-indigo-700 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-black/10 flex items-center gap-2 shrink-0 border border-transparent hover:border-indigo-100"
              >
                {editing ? "Cancel Edit" : <><FiEdit2 /> Edit Profile</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Stats & Socials) */}
        <div className="xl:col-span-1 space-y-6">
          {!isAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiCheckSquare size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-display font-black text-3xl text-slate-800">{profile?.stats?.totalTests || 0}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Tests Taken</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiBarChart2 size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-display font-black text-3xl text-slate-800">{profile?.stats?.avgScore || 0}%</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Score</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiTrendingUp size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-display font-black text-3xl text-slate-800">{profile?.streak?.current || 0}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Day Streak</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiFileText size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-display font-black text-3xl text-slate-800">{profile?.stats?.resumeCount || 0}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Resumes</p>
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl border border-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <h3 className="font-display font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
              <FiUser className="text-indigo-500" /> Contact & Socials
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"><FiPhone /></div>
                <div className="flex-1 truncate">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-slate-800 truncate">{profile?.phone || <span className="text-slate-400 italic">Not added</span>}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] shrink-0"><FiLinkedin /></div>
                <div className="flex-1 truncate">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn</p>
                  {profile?.linkedin ? (
                    <a href={`https://${profile.linkedin.replace('https://', '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block">{profile.linkedin}</a>
                  ) : <span className="text-slate-400 italic font-medium">Not added</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0"><FiGithub /></div>
                <div className="flex-1 truncate">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GitHub</p>
                  {profile?.github ? (
                    <a href={`https://${profile.github.replace('https://', '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:underline truncate block">{profile.github}</a>
                  ) : <span className="text-slate-400 italic font-medium">Not added</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Bio, Skills, Edit Form) */}
        <div className="xl:col-span-2">
          {editing ? (
            <div className="bg-white/90 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[2rem] shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
              
              <h2 className="font-display font-black text-2xl text-slate-800 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><FiSettings /></div> Update Profile
              </h2>
              
              <form onSubmit={handleSave} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" placeholder="+91 98765 43210" />
                  </div>
                </div>

                {!isAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
                      <select value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 appearance-none">
                        <option value="">Select Branch</option>
                        {BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                      <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700 appearance-none">
                        {SEMESTERS.map((s) => (<option key={s} value={s}>Semester {s}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">CGPA</label>
                      <input type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" placeholder="e.g. 8.5" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                    <input type="text" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" placeholder="linkedin.com/in/username" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">GitHub URL</label>
                    <input type="text" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" placeholder="github.com/username" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / Summary</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="4" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none custom-scrollbar" placeholder="Tell recruiters about your goals and passions..."></textarea>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Skills <span className="normal-case font-normal text-slate-400">(Comma separated)</span></label>
                  <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700" placeholder="React, Node.js, Python, AWS" />
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditing(false)} className="px-8 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Bio Cell */}
              <div className="bg-white/90 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <h3 className="font-display font-black text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><FiBriefcase /></div> Professional Bio
                </h3>
                {profile?.bio ? (
                  <p className="text-slate-600 font-medium leading-relaxed text-lg">{profile.bio}</p>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 font-semibold mb-2">No bio added yet.</p>
                    <button onClick={() => setEditing(true)} className="text-indigo-600 font-bold hover:underline text-sm">Write something about yourself</button>
                  </div>
                )}
              </div>

              {/* Skills Cell */}
              <div className="bg-white/90 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[2rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <h3 className="font-display font-black text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><FiAward /></div> Skills & Expertise
                </h3>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-white hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 font-semibold mb-2">No skills added yet.</p>
                    <button onClick={() => setEditing(true)} className="text-indigo-600 font-bold hover:underline text-sm">Add your top skills</button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
