import { useState, useEffect } from "react";
import { getForumPosts, createForumPost, upvoteForumPost, addForumReply, deleteForumPost } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";
import { ClipboardList, Target, Building2, HelpCircle, BookOpen, MessageSquare, Edit3, Send, Search, Eye, Pin, ChevronUp, Trash2 } from "lucide-react";

const CATEGORIES = [
  { key: "", label: "All Posts", icon: "📋" },
  { key: "placement-tips", label: "Placement Tips", icon: "🎯" },
  { key: "company-reviews", label: "Company Reviews", icon: "🏢" },
  { key: "doubt-clearing", label: "Doubt Clearing", icon: "❓" },
  { key: "resources", label: "Resources", icon: "📚" },
  { key: "general", label: "General", icon: "💬" },
];

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "", page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general", tags: "" });
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { fetchPosts(); }, [filters.category, filters.page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await getForumPosts(filters);
      setPosts(data.posts || []);
      setPagination(data.pagination || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createForumPost({
        ...newPost,
        tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setNewPost({ title: "", content: "", category: "general", tags: "" });
      fetchPosts();
    } catch (err) { alert(err.response?.data?.message || "Failed to create post."); }
    finally { setCreating(false); }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await upvoteForumPost(id);
      setPosts(posts.map((p) => p._id === id ? { ...p, upvotes: data.upvoted ? [...(p.upvotes || []), user._id] : (p.upvotes || []).filter((u) => u !== user._id) } : p));
    } catch (err) { console.error(err); }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await addForumReply(id, replyText);
      setPosts(posts.map((p) => p._id === id ? data.post : p));
      setReplyText("");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try { await deleteForumPost(id); fetchPosts(); }
    catch (err) { alert("Failed to delete post."); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="flex items-center gap-2 font-display font-semibold text-3xl mb-1"><MessageSquare className="w-8 h-8 text-blue-500" /> Discussion Forum</h1>
            <p className="text-ink-soft font-body text-sm">Share tips, ask doubts, and connect with fellow placement aspirants</p>
          </div>
          <button 
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${showCreate ? 'bg-white border border-line text-ink hover:bg-gray-50' : 'bg-ink text-paper hover:bg-ink-soft'}`}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cancel" : <span className="flex items-center gap-2"><Edit3 size={16} /> New Post</span>}
          </button>
        </div>

        {/* Create Post Form */}
        {showCreate && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-card border border-line mb-8 animate-fade-in">
            <h2 className="flex items-center gap-2 font-display font-semibold text-xl mb-6 border-b border-line pb-4"><Edit3 className="w-5 h-5 text-indigo-500" /> Create New Post</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Post Title</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" placeholder="What's on your mind?" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required maxLength={200} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Details</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" placeholder="Share your thoughts..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} required rows={4} maxLength={5000} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Category</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                    {CATEGORIES.slice(1).map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Tags (Optional)</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-line bg-paper focus:outline-none focus:border-ink transition-all" placeholder="e.g. TCS, Interview, HR" value={newPost.tags} onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })} />
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-ink text-paper rounded-xl font-medium text-sm hover:bg-ink-soft transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed" disabled={creating}>
                  {creating ? "Posting..." : <span className="flex items-center justify-center gap-2"><Send size={16} /> Post</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.key}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.category === c.key ? "bg-ink text-paper shadow-sm" : "bg-white text-ink-soft border border-line hover:bg-paper hover:text-ink"}`}
                onClick={() => setFilters({ ...filters, category: c.key, page: 1 })}>
                <span className="flex items-center gap-2">{c.icon} {c.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <input type="text" className="w-full pl-10 pr-4 py-2 rounded-xl border border-line bg-white focus:outline-none focus:border-ink transition-all text-sm" placeholder="Search posts..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              <Search size={16} />
            </div>
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-line border-t-amber rounded-full animate-spin mb-4"></div>
            <p className="text-ink-soft font-medium">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-line border-dashed rounded-2xl p-12 text-center">
            <div className="flex justify-center text-4xl mb-4 text-slate-300"><MessageSquare size={48} /></div>
            <h3 className="font-display font-semibold text-lg text-ink mb-2">No posts found</h3>
            <p className="text-ink-soft text-sm">Be the first to share something or try a different search!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className={`bg-white rounded-2xl shadow-sm border p-5 sm:p-6 transition-all hover:shadow-md ${post.isPinned ? "border-amber/50 bg-amber/5" : "border-line"}`}>
                
                {/* Author Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {post.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-ink text-sm">{post.userId?.name || "Unknown"}</div>
                      <div className="flex items-center gap-1 text-xs text-ink-soft">{formatDate(post.createdAt)} · <Eye size={12} /> {post.views} views</div>
                    </div>
                  </div>
                  {post.isPinned && <span className="flex items-center gap-1 px-2.5 py-1 bg-amber/20 text-amber-deep text-xs font-bold rounded-md"><Pin size={12} /> Pinned</span>}
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ink mb-3 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setExpandedId(expandedId === post._id ? null : post._id)}>
                  {post.title}
                </h3>

                {/* Meta Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-md border border-indigo-100 flex items-center gap-1">
                    {CATEGORIES.find((c) => c.key === post.category)?.icon} <span className="capitalize">{post.category.replace("-", " ")}</span>
                  </span>
                  {post.tags?.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 bg-paper text-ink-soft text-xs font-medium rounded-md border border-line">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Expanded Body */}
                {expandedId === post._id && (
                  <div className="mt-4 pt-4 border-t border-line animate-fade-in">
                    <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

                    {/* Replies */}
                    {post.replies?.length > 0 && (
                      <div className="mb-6 space-y-4">
                        <h4 className="font-semibold text-ink text-sm flex items-center gap-2"><MessageSquare size={16} className="text-indigo-500" /> {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"}</h4>
                        <div className="space-y-3">
                          {post.replies.map((reply, i) => (
                            <div key={i} className="bg-paper p-4 rounded-xl border border-line">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs">
                                  {reply.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <span className="font-medium text-ink text-xs">{reply.userId?.name}</span>
                                <span className="text-[10px] text-ink-soft ml-auto">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-ink">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 px-4 py-2 rounded-xl border border-line bg-white focus:outline-none focus:border-ink transition-all text-sm" placeholder="Write a reply..." value={expandedId === post._id ? replyText : ""} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReply(post._id)} />
                      <button onClick={() => handleReply(post._id)} className="px-5 py-2 bg-ink text-paper rounded-xl text-sm font-medium hover:bg-ink-soft transition-all">Reply</button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-2">
                  <button 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${post.upvotes?.includes(user?._id) ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-paper text-ink-soft border border-line hover:bg-gray-100"}`} 
                    onClick={() => handleUpvote(post._id)}
                  >
                    <ChevronUp size={16} /> {post.upvotes?.length || 0}
                  </button>
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-paper text-ink-soft border border-line hover:bg-gray-100 transition-colors" 
                    onClick={() => setExpandedId(expandedId === post._id ? null : post._id)}
                  >
                    <MessageSquare size={16} /> {post.replies?.length || 0}
                  </button>
                  
                  {(post.userId?._id === user?._id || user?.role === "admin") && (
                    <button className="ml-auto p-1.5 text-ink-soft hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" onClick={() => handleDelete(post._id)} title="Delete Post">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 rounded-xl border border-line bg-white text-sm font-medium hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed transition-all">← Prev</button>
            <span className="text-sm font-medium text-ink-soft">Page {pagination.current} of {pagination.total}</span>
            <button disabled={filters.page >= pagination.total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 rounded-xl border border-line bg-white text-sm font-medium hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
