import { useState, useEffect } from "react";
import { getForumPosts, createForumPost, deleteForumPost, toggleForumPin } from "../services/api";
import { Globe, Trash2, Pin, Search, MessageSquare, Plus, X, Eye } from "lucide-react";
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
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display font-bold text-2xl text-ink mb-1">
              <Globe className="text-indigo-500" /> Forum Moderation
            </h1>
            <p className="text-muted text-sm font-medium">Manage discussions, delete inappropriate posts, and create announcements.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> New Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="bg-paper p-4 rounded-2xl border border-line shadow-sm flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line bg-surface text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-indigo-500 transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-paper rounded-2xl border border-line shadow-sm">
            <div className="w-10 h-10 border-4 border-line border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-muted font-medium">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="bg-paper rounded-2xl border border-line shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface/50 border-b border-line text-xs uppercase tracking-wider text-muted font-semibold">
                      <th className="p-4">Post Title</th>
                      <th className="p-4">Author</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Stats</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {posts.map((post) => (
                      <tr key={post._id} className={`hover:bg-surface/50 transition-colors ${post.isPinned ? "bg-amber-50/30" : ""}`}>
                        <td className="p-4 max-w-xs">
                          <div className="flex items-start gap-2">
                            {post.isPinned && <Pin size={14} className="text-amber-500 mt-1 shrink-0" fill="currentColor" />}
                            <div>
                              <p className="font-bold text-ink truncate" title={post.title}>{post.title}</p>
                              <p className="text-xs text-muted truncate">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px] font-bold">
                              {post.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm font-medium text-ink-soft">{post.userId?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-xs font-medium text-muted">
                            <span className="flex items-center gap-1" title="Views"><Eye size={12} /> {post.views || 0}</span>
                            <span className="flex items-center gap-1" title="Replies"><MessageSquare size={12} /> {post.replies?.length || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className={`p-2 rounded-lg transition-colors ${post.isPinned ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}
                              onClick={() => handleTogglePin(post._id)} 
                              title={post.isPinned ? "Unpin Post" : "Pin as Announcement"}
                            >
                              <Pin size={16} className={post.isPinned ? "fill-current" : ""} />
                            </button>
                            <button 
                              className="p-2 text-coral hover:bg-coral/10 rounded-lg transition-colors" 
                              onClick={() => handleDelete(post._id)} 
                              title="Delete Post"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-muted">
                          <div className="flex flex-col items-center gap-3 opacity-50">
                            <MessageSquare size={48} />
                            <p className="text-sm font-medium">No posts found.</p>
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
              <div className="flex items-center justify-between bg-paper p-4 rounded-2xl border border-line shadow-sm">
                <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 text-sm font-bold bg-surface border border-line rounded-xl text-ink hover:bg-line disabled:opacity-50 transition-colors">
                  ← Prev
                </button>
                <span className="text-sm font-medium text-muted">
                  Page <span className="text-ink font-bold">{pagination.current}</span> of {pagination.total} ({pagination.count} total)
                </span>
                <button disabled={filters.page >= pagination.total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 text-sm font-bold bg-surface border border-line rounded-xl text-ink hover:bg-line disabled:opacity-50 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Announcement Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-paper rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface/50">
                <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                  <Globe className="text-indigo-500" /> New Announcement
                </h2>
                <button className="p-2 text-muted hover:text-ink hover:bg-line rounded-xl transition-colors" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Title</label>
                  <input type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="E.g., Platform Maintenance Update" required className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Announcement Details</label>
                  <textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="Details of the announcement..." required className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all min-h-[120px] resize-y" />
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl mt-2">
                  <input 
                    type="checkbox" 
                    id="priorityToggle" 
                    checked={isPriority} 
                    onChange={(e) => setIsPriority(e.target.checked)}
                    className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <label htmlFor="priorityToggle" className="text-sm font-bold text-ink cursor-pointer">
                      High Priority (Pin to top)
                    </label>
                    <p className="text-xs text-muted">This will stick the post to the top of the student forum with a highlight.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-line mt-6">
                  <button type="button" className="px-5 py-2.5 text-sm font-bold text-ink bg-surface hover:bg-line border border-line rounded-xl transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-70" disabled={saving}>
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
