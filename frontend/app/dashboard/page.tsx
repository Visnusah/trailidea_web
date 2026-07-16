"use client";

import { useEffect, useState } from "react";
import { getFeed, toggleVote, PostRecord, getComments, createComment, CommentRecord } from "@/lib/api/posts";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Mock Data for Right Sidebar
const TRENDING_TRAILS = [
  { name: "Everest Base Camp", saves: "1.2k saves this week", image: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=200&q=70" },
  { name: "Mardi Himal Trek", saves: "842 saves this week", image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=200&q=70" },
  { name: "Tilicho Lake Trail", saves: "620 saves this week", image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=200&q=70" },
];

const TOP_EXPLORERS = [
  { name: "Ram Bahadur", initials: "RB", trails: 24, distance: "180mi", color: "#173124" },
  { name: "Sujata Thapa", initials: "ST", trails: 19, distance: "142mi", color: "#725a41" },
  { name: "Manish Sherpa", initials: "MS", trails: 15, distance: "98mi", color: "#590f00" },
];

// Helper to format date
const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return "recently";
  }
};

// ── ReadMore Component ──
const ReadMoreText = ({ text, maxLength = 150 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className="post-card__desc">{text}</p>;
  }

  return (
    <p className="post-card__desc">
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="read-more-btn"
      >
        {isExpanded ? "Show less" : "See more"}
      </button>
    </p>
  );
};

// ── Comment Modal Component ──
const CommentModal = ({ postId, onClose }: { postId: string; onClose: () => void }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getComments(postId);
        setComments(res.data);
      } catch (error: any) {
        toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createComment(postId, text);
      setComments([...comments, res.data]);
      setText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-modal__overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal__header">
          <h3 className="text-headline-md">Comments</h3>
          <button className="comment-modal__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="comment-modal__body">
          {loading ? (
            <div className="community-feed__loading">
              <span className="material-symbols-outlined community-feed__loading-spinner">progress_activity</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="comment-modal__empty">No comments yet. Be the first!</div>
          ) : (
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.author.imageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.author.username}`} 
                    alt={comment.author.username} 
                    className="comment-item__avatar"
                  />
                  <div className="comment-item__content">
                    <div className="comment-item__meta">
                      <span className="comment-item__author">{comment.author.firstName} {comment.author.lastName}</span>
                      <span className="comment-item__time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <div className="comment-item__text">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="comment-modal__footer">
          <form onSubmit={handleSubmit} className="comment-form">
            <input 
              type="text" 
              className="post-form__input" 
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className="comment-submit-btn" disabled={submitting || !text.trim()}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Comment Modal state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const fetchFeed = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const response = await getFeed({ page: pageNum, limit: 10 });
      if (isInitial) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      toast.error(error.message || "Failed to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id !== postId) return post;
        
        const userId = user._id;
        const hasUpvoted = post.upvotes.includes(userId);
        const hasDownvoted = post.downvotes.includes(userId);
        
        let newUpvotes = [...post.upvotes];
        let newDownvotes = [...post.downvotes];
        
        if (type === "upvote") {
          if (hasUpvoted) {
            newUpvotes = newUpvotes.filter(id => id !== userId);
          } else {
            newUpvotes.push(userId);
            newDownvotes = newDownvotes.filter(id => id !== userId);
          }
        } else {
          if (hasDownvoted) {
            newDownvotes = newDownvotes.filter(id => id !== userId);
          } else {
            newDownvotes.push(userId);
            newUpvotes = newUpvotes.filter(id => id !== userId);
          }
        }
        
        return { ...post, upvotes: newUpvotes, downvotes: newDownvotes };
      })
    );

    try {
      const res = await toggleVote(postId, type);
      setPosts(prevPosts => prevPosts.map(p => 
        p._id === postId ? { ...p, upvotes: res.data.post.upvotes, downvotes: res.data.post.downvotes } : p
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
      fetchFeed(1, true); 
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/dashboard/post/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const getMediaGridClass = (count: number) => {
    if (count === 1) return "";
    if (count === 2) return "post-card__media-grid post-card__media-grid--2";
    if (count >= 3) return "post-card__media-grid post-card__media-grid--3";
    return "";
  };

  return (
    <>
      <div className="feed-grid" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* ═══ CENTER — Main Feed ═══ */}
        <section className="community-feed">
          <div className="community-feed__header">
            <h2 className="text-headline-xl">Global Feed</h2>
          </div>

          {loading ? (
            <div className="community-feed__loading">
              <span className="material-symbols-outlined community-feed__loading-spinner">
                progress_activity
              </span>
              <p>Loading community feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="community-feed__empty">
              <span className="material-symbols-outlined community-feed__empty-icon">
                post_add
              </span>
              <h3 className="text-headline-md">No posts yet</h3>
              <p style={{ marginTop: "8px", marginBottom: "24px" }}>Be the first to share your trail experience!</p>
              <Link href="/dashboard/post" className="promo-card__btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Create Post
              </Link>
            </div>
          ) : (
            <div className="community-feed__list">
              {posts.map((post) => {
                const netVotes = post.upvotes.length - post.downvotes.length;
                const hasUpvoted = user ? post.upvotes.includes(user._id) : false;
                const hasDownvoted = user ? post.downvotes.includes(user._id) : false;

                return (
                  <article key={post._id} className="post-card">
                    {/* Voting Panel */}
                    <div className="post-card__vote-panel">
                      <button
                        className={`post-card__vote-btn post-card__vote-btn--upvote ${hasUpvoted ? "post-card__vote-btn--active" : ""}`}
                        onClick={() => handleVote(post._id, "upvote")}
                        aria-label="Upvote"
                      >
                        <span className="material-symbols-outlined">arrow_upward</span>
                      </button>
                      
                      <span className={`post-card__vote-count ${hasUpvoted ? "post-card__vote-count--up" : ""} ${hasDownvoted ? "post-card__vote-count--down" : ""}`}>
                        {netVotes}
                      </span>
                      
                      <button
                        className={`post-card__vote-btn post-card__vote-btn--downvote ${hasDownvoted ? "post-card__vote-btn--active" : ""}`}
                        onClick={() => handleVote(post._id, "downvote")}
                        aria-label="Downvote"
                      >
                        <span className="material-symbols-outlined">arrow_downward</span>
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="post-card__content">
                      <div className="post-card__meta">
                        <img 
                          src={post.author.imageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author.username}`} 
                          alt={post.author.username} 
                          className="post-card__avatar"
                        />
                        <span className="post-card__author">{post.author.firstName} {post.author.lastName}</span>
                        <span className="post-card__time">• {formatTimeAgo(post.createdAt)}</span>
                      </div>

                      <h3 className="text-headline-md post-card__title">{post.title}</h3>
                      {post.subtitle && <p className="post-card__subtitle">{post.subtitle}</p>}
                      
                      {/* Truncated Text using ReadMoreText component */}
                      <ReadMoreText text={post.description} />

                      {post.links && post.links.length > 0 && (
                        <div className="post-card__links">
                          {post.links.map((link, idx) => (
                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="post-card__link">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span>
                              {new URL(link).hostname.replace('www.', '')}
                            </a>
                          ))}
                        </div>
                      )}

                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className={`post-card__media ${getMediaGridClass(post.imageUrls.length)}`}>
                          {post.imageUrls.slice(0, 3).map((url, idx) => (
                            <img key={idx} src={`http://localhost:8089${url}`} alt="Post media" className="post-card__image" />
                          ))}
                          {post.imageUrls.length > 3 && (
                            <div style={{ position: "relative" }}>
                              <img src={`http://localhost:8089${post.imageUrls[3]}`} alt="More media" className="post-card__image" style={{ filter: "brightness(0.5)" }} />
                              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white", fontSize: "24px", fontWeight: "bold" }}>
                                +{post.imageUrls.length - 3}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Toolbar */}
                      <div className="post-card__toolbar">
                        <button className="post-card__action" onClick={() => setActiveCommentPostId(post._id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat_bubble_outline</span>
                          Comment
                        </button>
                        <button className="post-card__action" onClick={() => handleShare(post._id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
                          Share
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {page < totalPages && (
                <button 
                  className="community-feed__load-more" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More Posts"}
                </button>
              )}
            </div>
          )}
        </section>

        {/* ═══ RIGHT SIDEBAR — Trending & Explorers ═══ */}
        <aside className="feed-sidebar-right">
          {/* Trending Trails */}
          <div className="sidebar-card">
            <h3>Trending Trails</h3>
            {TRENDING_TRAILS.map((t, i) => (
              <div key={i} className="trending-item">
                <img src={t.image} alt={t.name} className="trending-item__img" />
                <div className="trending-item__info">
                  <h4>{t.name}</h4>
                  <p>{t.saves}</p>
                </div>
              </div>
            ))}
            <a className="sidebar-view-all">View All Trending</a>
          </div>

          {/* Top Explorers */}
          <div className="sidebar-card">
            <h3>Top Explorers</h3>
            {TOP_EXPLORERS.map((e, i) => (
              <div key={i} className="explorer-item">
                <div
                  className="explorer-item__avatar"
                  style={{ background: e.color }}
                >
                  {e.initials}
                </div>
                <div className="explorer-item__info">
                  <div className="explorer-item__name">{e.name}</div>
                  <div className="explorer-item__stats">
                    {e.trails} Trails • {e.distance}
                  </div>
                </div>
                <button className="explorer-item__follow" aria-label={`Follow ${e.name}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    person_add
                  </span>
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {activeCommentPostId && (
        <CommentModal 
          postId={activeCommentPostId} 
          onClose={() => setActiveCommentPostId(null)} 
        />
      )}
    </>
  );
}