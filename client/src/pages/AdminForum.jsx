import { useState, useEffect } from "react";
import { getForumPosts, createForumPost, deleteForumPost, toggleForumPin } from "../services/api";
import { Globe, Trash2, Pin, Search, MessageSquare, Plus, X, Eye, Sparkles } from "lucide-react";
import { formatDate } from "../utils/helpers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LinkPreview from "../components/common/LinkPreview";
import toast from "react-hot-toast";

const AdminForum = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", page: 1, limit: 20 });
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", category: "announcement", tags: "announcement, admin" });
  const [isPriority, setIsPriority] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filters.page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await getForumPosts(filters);
      setPosts(data.posts || []);
      setPagination(data.pagination || {});
    } catch (err) {
      toast.error("Failed to fetch forum posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await deleteForumPost(id);
      fetchPosts();
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const { data } = await toggleForumPin(id);
      setPosts(posts.map(p => p._id === id ? { ...p, isPinned: data.isPinned } : p));
      toast.success(data.isPinned ? "Post pinned as announcement" : "Post unpinned");
    } catch (err) {
      toast.error("Failed to toggle pin status");
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await createForumPost({
        ...newAnnouncement,
        tags: newAnnouncement.tags.split(",").map(t => t.trim()).filter(Boolean)
      });
      // Conditionally pin the new announcement based on priority checkbox
      if (isPriority) {
        await toggleForumPin(data.post._id);
      }
      
      setShowModal(false);
      setNewAnnouncement({ title: "", content: "", category: "announcement", tags: "announcement, admin" });
      setIsPriority(true);
      fetchPosts();
      toast.success(isPriority ? "High priority announcement created!" : "Announcement created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in font-body">
      <div className="flex flex-col space-y-8">
        
        {/* Header Section */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Globe size={14} className="text-blue-300 animate-pulse" /> moderation center
            </div>
            <h1 className="font-display font-black text-3xl tracking-tight mb-2">Forum Moderation</h1>
            <p className="text-slate-350 text-sm font-medium">Manage discussions, delete inappropriate posts, and create announcements.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="relative z-10 flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-950 rounded-2xl font-bold text-sm hover:scale-[1.02] hover:shadow-lg transition-all shadow-md shrink-0"
          >
            <Plus size={18} /> New Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-card">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-semibold text-sm">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                      <th className="p-4">Post Title</th>
                      <th className="p-4">Author</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Stats</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((post) => (
                      <tr key={post._id} className={`hover:bg-slate-50/30 transition-colors border-b border-slate-100 last:border-none ${post.isPinned ? "bg-amber-50/20" : ""}`}>
                        <td className="p-4 max-w-xs">
                          <div className="flex items-start gap-2.5">
                            {post.isPinned && <Pin size={14} className="text-amber-500 mt-1 shrink-0" fill="currentColor" />}
                            <div>
                              <p className="font-bold text-slate-800 text-sm truncate" title={post.title}>{post.title}</p>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {post.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{post.userId?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-xs font-bold text-slate-450">
                            <span className="flex items-center gap-1" title="Views"><Eye size={13} /> {post.views || 0}</span>
                            <span className="flex items-center gap-1" title="Replies"><MessageSquare size={13} /> {post.replies?.length || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className={`p-2 rounded-xl border transition-all ${
                                post.isPinned 
                                  ? "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100" 
                                  : "text-slate-450 border-slate-100 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100"
                              }`}
                              onClick={() => handleTogglePin(post._id)} 
                              title={post.isPinned ? "Unpin Post" : "Pin as Announcement"}
                            >
                              <Pin size={15} className={post.isPinned ? "fill-current" : ""} />
                            </button>
                            <button 
                              className="p-2 text-coral border border-slate-100 hover:bg-coral/10 hover:border-coral/20 rounded-xl transition-all" 
                              onClick={() => handleDelete(post._id)} 
                              title="Delete Post"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-450">
                          <div className="flex flex-col items-center gap-3 opacity-60">
                            <MessageSquare size={48} className="text-slate-300" />
                            <p className="text-sm font-semibold">No posts found.</p>
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
                  className="px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs font-bold text-slate-450">
                  Page <span className="text-slate-800 font-extrabold">{pagination.current}</span> of {pagination.total} ({pagination.count} total)
                </span>
                <button 
                  disabled={filters.page >= pagination.total} 
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })} 
                  className="px-4 py-2 text-xs font-bold bg-slate-50 border border-slate-100 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Announcement Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-floating w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-display font-black text-lg text-slate-800 flex items-center gap-2">
                  <Globe className="text-indigo-500" /> New Announcement
                </h2>
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    type="text" 
                    value={newAnnouncement.title} 
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} 
                    placeholder="E.g., Platform Maintenance Update" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Announcement Details</label>
                  <textarea 
                    value={newAnnouncement.content} 
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} 
                    placeholder="Details of the announcement..." 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all min-h-[120px] resize-y text-sm font-medium" 
                  />
                </div>
                
                <div className="flex items-center gap-3.5 p-4 bg-amber-50/30 border border-amber-100 rounded-2xl mt-2">
                  <input 
                    type="checkbox" 
                    id="priorityToggle" 
                    checked={isPriority} 
                    onChange={(e) => setIsPriority(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="priorityToggle" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                      High Priority (Pin to top)
                    </label>
                    <p className="text-xs text-slate-450 leading-relaxed mt-0.5">This will stick the post to the top of the student forum with a highlight.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/10 disabled:opacity-75" 
                    disabled={saving}
                  >
                    {saving ? "Posting..." : "Post Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminForum;
