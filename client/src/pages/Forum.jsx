import { useState, useEffect } from "react";
import { getForumPosts, createForumPost, upvoteForumPost, addForumReply, deleteForumPost } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LinkPreview from "../components/common/LinkPreview";
import { 
  ClipboardList, Target, Building2, HelpCircle, BookOpen, 
  MessageSquare, Edit3, Send, Search, Eye, Pin, ChevronUp, Trash2, X, Hash
} from "lucide-react";

// Updated Categories with Lucide Icons
const CATEGORIES = [
  { key: "", label: "All Posts", icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100" },
  { key: "placement-tips", label: "Placement Tips", icon: Target, color: "text-emerald-600", bg: "bg-emerald-100" },
  { key: "company-reviews", label: "Company Reviews", icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
  { key: "doubt-clearing", label: "Doubt Clearing", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "resources", label: "Resources", icon: BookOpen, color: "text-violet-600", bg: "bg-violet-100" },
  { key: "general", label: "General", icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-100" },
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
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try { await deleteForumPost(id); fetchPosts(); }
    catch (err) { alert("Failed to delete post."); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-surface pb-20 animate-fade-in">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-bold text-3xl md:text-4xl text-ink tracking-tight mb-2">Discussion Forum</h1>
          <p className="text-ink-soft text-lg font-medium max-w-2xl">Share interview experiences, ask doubts, and collaborate with your peers.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Feed Column */}
          <div className="flex-1 w-full order-2 lg:order-1">
            
            {/* Create Post Form (Inline) */}
            {showCreate && (
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-floating border border-line mb-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
                  <h2 className="flex items-center gap-2 font-bold text-xl text-ink tracking-tight">
                    <Edit3 className="w-5 h-5 text-indigo-500" /> Start a Discussion
                  </h2>
                  <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Post Title</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" placeholder="What do you want to discuss?" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required maxLength={200} />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Details</label>
                    <textarea className="w-full px-4 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium resize-y min-h-[120px]" placeholder="Provide more context..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} required maxLength={5000} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Category</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                        {CATEGORIES.slice(1).map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Tags (Comma separated)</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" placeholder="TCS, Interview, HR" value={newPost.tags} onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed" disabled={creating}>
                      {creating ? "Posting..." : <><Send size={16} /> Post Discussion</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-line">
                <div className="w-10 h-10 border-4 border-line border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-ink-soft font-medium">Loading discussions...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-line border-dashed rounded-[2rem] p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare size={40} />
                </div>
                <h3 className="font-bold text-xl text-ink tracking-tight mb-2">No posts found</h3>
                <p className="text-ink-soft font-medium mb-6 max-w-md mx-auto">It's quiet here. Be the first to share your thoughts, tips, or questions with the community!</p>
                <button onClick={() => setShowCreate(true)} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">Start a Discussion</button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const PostCategory = CATEGORIES.find((c) => c.key === post.category) || CATEGORIES[5];
                  const isExpanded = expandedId === post._id;
                  const isAuthor = post.userId?._id === user?._id || user?.role === "admin";
                  const hasUpvoted = post.upvotes?.includes(user?._id);

                  return (
                    <div key={post._id} className={`bg-white rounded-[2rem] p-6 sm:p-8 transition-all border ${post.isPinned ? "border-amber-300 shadow-md shadow-amber-500/5 bg-amber-50/10" : "border-line shadow-card hover:border-indigo-200"}`}>
                      
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          {/* Gradient Avatar */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xl shadow-inner shadow-white/20">
                            {post.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-bold text-ink tracking-tight">{post.userId?.name || "Unknown Author"}</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted mt-0.5">
                              {formatDate(post.createdAt)} 
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                              <span className="flex items-center gap-1"><Eye size={12} /> {post.views} views</span>
                            </div>
                          </div>
                        </div>
                        {post.isPinned && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                            <Pin size={12} className="fill-current" /> Pinned
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="mb-6">
                        <h3 className="font-bold text-xl sm:text-2xl text-ink tracking-tight mb-3 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setExpandedId(isExpanded ? null : post._id)}>
                          {post.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-3 py-1 ${PostCategory.bg} ${PostCategory.color} text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5`}>
                            <PostCategory.icon size={12} strokeWidth={3} />
                            {PostCategory.label}
                          </span>
                          {post.tags?.map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-surface text-ink-soft text-xs font-bold uppercase tracking-wider rounded-lg border border-line flex items-center gap-1">
                              <Hash size={12} className="text-muted" /> {t}
                            </span>
                          ))}
                        </div>

                        {/* Collapsed view snippet or Expanded content */}
                        <div 
                          className={`text-ink-soft text-[15px] font-medium leading-relaxed transition-all ${!isExpanded ? "line-clamp-3 overflow-hidden cursor-pointer hover:text-ink group-hover:text-ink" : ""}`}
                          onClick={() => !isExpanded && setExpandedId(post._id)}
                        >
                          <div className={`prose prose-sm sm:prose-base max-w-none prose-indigo prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-img:rounded-xl ${!isExpanded ? "prose-p:m-0 prose-pre:m-0 prose-headings:m-0 pointer-events-none" : ""}`}>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
                              }}
                            >
                              {post.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        
                        {/* Link Preview (Extract first URL) */}
                        {isExpanded && post.content.match(/(https?:\/\/[^\s]+)/) && (
                          <LinkPreview url={post.content.match(/(https?:\/\/[^\s]+)/)[0]} />
                        )}
                      </div>

                      {/* Action Bar (Always visible) */}
                      <div className="flex items-center gap-3 pt-4 border-t border-line">
                        <button 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${hasUpvoted ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-surface text-ink-soft hover:bg-slate-200 hover:text-ink"}`} 
                          onClick={() => handleUpvote(post._id)}
                        >
                          <ChevronUp size={18} strokeWidth={hasUpvoted ? 3 : 2.5} /> {post.upvotes?.length || 0}
                        </button>
                        
                        <button 
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isExpanded ? "bg-slate-200 text-ink" : "bg-surface text-ink-soft hover:bg-slate-200 hover:text-ink"}`} 
                          onClick={() => setExpandedId(isExpanded ? null : post._id)}
                        >
                          <MessageSquare size={18} strokeWidth={2.5} /> {post.replies?.length || 0}
                        </button>
                        
                        {isAuthor && (
                          <button 
                            className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
                            onClick={() => handleDelete(post._id)} title="Delete Discussion"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      {/* Expanded Replies Section */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-line animate-fade-in pl-4 sm:pl-8 border-l-2 border-l-slate-100">
                          {/* Replies List */}
                          {post.replies?.length > 0 ? (
                            <div className="mb-6 space-y-5">
                              {post.replies.map((reply, i) => (
                                <div key={i} className="group">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                      {reply.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                      <div className="font-bold text-ink text-sm tracking-tight">{reply.userId?.name || "Unknown"}</div>
                                      <div className="text-[11px] font-medium text-muted">{formatDate(reply.createdAt)}</div>
                                    </div>
                                  </div>
                                  <div className="pl-11 pr-4">
                                    <div className="text-sm text-ink font-medium leading-relaxed bg-surface inline-block p-4 rounded-2xl rounded-tl-sm prose prose-sm max-w-none prose-indigo prose-a:text-indigo-600 hover:prose-a:text-indigo-800">
                                      <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                        }}
                                      >
                                        {reply.content}
                                      </ReactMarkdown>
                                    </div>
                                    {reply.content.match(/(https?:\/\/[^\s]+)/) && (
                                      <div className="pl-11 mt-1">
                                        <LinkPreview url={reply.content.match(/(https?:\/\/[^\s]+)/)[0]} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mb-6 text-sm font-medium text-muted bg-surface p-4 rounded-xl inline-block">
                              No replies yet. Be the first to share your thoughts!
                            </div>
                          )}

                          {/* Reply Input Box */}
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <input 
                                type="text" 
                                className="w-full px-5 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                                placeholder="Add to the discussion..." 
                                value={replyText} 
                                onChange={(e) => setReplyText(e.target.value)} 
                                onKeyDown={(e) => e.key === "Enter" && handleReply(post._id)} 
                              />
                            </div>
                            <button 
                              onClick={() => handleReply(post._id)} 
                              disabled={!replyText.trim()}
                              className="px-5 py-3 bg-ink text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:bg-slate-400"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.total > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-5 py-2.5 rounded-xl border border-line bg-white text-sm font-bold text-ink hover:bg-surface disabled:opacity-40 transition-colors">← Prev</button>
                <span className="text-sm font-bold text-muted uppercase tracking-wider">Page {pagination.current} of {pagination.total}</span>
                <button disabled={filters.page >= pagination.total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-5 py-2.5 rounded-xl border border-line bg-white text-sm font-bold text-ink hover:bg-surface disabled:opacity-40 transition-colors">Next →</button>
              </div>
            )}

          </div>

          {/* Right Sticky Sidebar */}
          <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2 space-y-6 lg:sticky lg:top-24">
            
            {/* Primary Action */}
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className={`w-full py-4 rounded-[1.25rem] font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${showCreate ? 'bg-white text-ink border border-line hover:bg-surface' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-600/20'}`}
            >
              {showCreate ? "Cancel Posting" : <><Edit3 size={20} /> Start Discussion</>}
            </button>

            {/* Search Widget */}
            <div className="bg-white rounded-3xl p-6 border border-line shadow-sm">
              <h3 className="font-bold text-ink mb-4 tracking-tight">Search Discussions</h3>
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-surface focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm font-medium" 
                  placeholder="e.g. TCS Ninja, React..." 
                  value={filters.search} 
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <button type="submit" className="hidden">Search</button>
              </form>
            </div>

            {/* Categories Widget */}
            <div className="bg-white rounded-3xl p-6 border border-line shadow-sm">
              <h3 className="font-bold text-ink mb-4 tracking-tight">Categories</h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isActive = filters.category === c.key;
                  return (
                    <button 
                      key={c.key}
                      onClick={() => setFilters({ ...filters, category: c.key, page: 1 })}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-ink-soft hover:bg-surface hover:text-ink'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-100 text-indigo-700' : `${c.bg} ${c.color}`}`}>
                        <Icon size={16} strokeWidth={2.5} />
                      </div>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Forum;
