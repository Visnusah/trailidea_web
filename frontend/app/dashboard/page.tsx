"use client";

import { useEffect, useState, useRef } from "react";
import { getFeed, toggleVote, PostRecord, getComments, createComment, CommentRecord, toggleSavePost, deletePost } from "@/lib/api/posts";
import { suggestComment } from "@/lib/api/ai";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import MapPreview from "@/app/_components/MapPreview";
import { getSidebarData, toggleFollow, UserProfile } from "@/lib/api/users";

// Helper to format date
const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return "recently";
  }
};

// Helper to safely get hostname from a URL string
const safeHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url.length > 30 ? url.slice(0, 30) + "…" : url;
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
const CommentModal = ({
  postId,
  postTitle,
  onClose,
  onCommentAdded,
}: {
  postId: string;
  postTitle?: string;
  onClose: () => void;
  onCommentAdded?: (comment: CommentRecord) => void;
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiChips, setAiChips] = useState<string[]>([]);
  const [loadingChips, setLoadingChips] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getComments(postId);
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
    // Fetch AI comment suggestions when modal opens
    const fetchChips = async () => {
      setLoadingChips(true);
      try {
        const chips = await suggestComment(postTitle || "trail post");
        setAiChips(chips);
      } catch {
        // Silently skip if AI is unavailable
      } finally {
        setLoadingChips(false);
      }
    };
    fetchChips();
  }, [postId, postTitle]);

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
      setComments((prev) => [...prev, res.data]);
      setText("");
      if (onCommentAdded) {
        onCommentAdded(res.data);
      }
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
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <img
                    src={
                      comment.author?.imageUrl
                        ? `http://localhost:8089${comment.author.imageUrl}`
                        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.author?.username || "user"}`
                    }
                    alt={comment.author?.username || "user"}
                    className="comment-item__avatar"
                  />
                  <div className="comment-item__content">
                    <div className="comment-item__meta">
                      <span className="comment-item__author">
                        {comment.author?.firstName || ""} {comment.author?.lastName || ""}
                      </span>
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
          {/* AI Quick Reply Chips */}
          {(aiChips.length > 0 || loadingChips) && (
            <div className="ai-chips-row">
              <span className="ai-chips-label">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                Quick replies
              </span>
              {loadingChips ? (
                <span className="ai-chip ai-chip--loading">...</span>
              ) : (
                aiChips.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    className="ai-chip"
                    onClick={() => setText(chip)}
                  >
                    {chip}
                  </button>
                ))
              )}
            </div>
          )}

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
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sidebar State
  const [trendingPosts, setTrendingPosts] = useState<(PostRecord & { upvoteCount: number; engagement: number })[]>([]);
  const [whoToFollow, setWhoToFollow] = useState<(UserProfile & { followerCount: number })[]>([]);

  // Comment Modal state
  const [activeCommentPost, setActiveCommentPost] = useState<{ id: string; title: string } | null>(null);
  const [deleteMenuPostId, setDeleteMenuPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

    getSidebarData()
      .then((res) => {
        setTrendingPosts(res.data.trendingPosts);
        setWhoToFollow(res.data.whoToFollow);
      })
      .catch((err) => {
        console.error("Failed to load sidebar data", err);
      });
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

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post;

        const userId = user._id;
        const hasUpvoted = post.upvotes.includes(userId);
        const hasDownvoted = post.downvotes.includes(userId);

        let newUpvotes = [...post.upvotes];
        let newDownvotes = [...post.downvotes];

        if (type === "upvote") {
          if (hasUpvoted) {
            newUpvotes = newUpvotes.filter((id) => id !== userId);
          } else {
            newUpvotes.push(userId);
            newDownvotes = newDownvotes.filter((id) => id !== userId);
          }
        } else {
          if (hasDownvoted) {
            newDownvotes = newDownvotes.filter((id) => id !== userId);
          } else {
            newDownvotes.push(userId);
            newUpvotes = newUpvotes.filter((id) => id !== userId);
          }
        }

        return { ...post, upvotes: newUpvotes, downvotes: newDownvotes };
      })
    );

    try {
      const res = await toggleVote(postId, type);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId ? { ...p, upvotes: res.data.post.upvotes, downvotes: res.data.post.downvotes } : p
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
      fetchFeed(1, true);
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) {
      toast.error("Please login to save posts");
      return;
    }
    try {
      const res = await toggleSavePost(postId);
      toast.success(res.data.isSaved ? "Post saved successfully" : "Post unsaved successfully");
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/dashboard/post/${postId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const getMediaGridClass = (count: number) => {
    if (count === 1) return "";
    if (count === 2) return "post-card__media-grid post-card__media-grid--2";
    if (count >= 3) return "post-card__media-grid post-card__media-grid--3";
    return "";
  };

  const handleFollowToggle = async (userId: string) => {
    if (!user) {
      toast.error("Please login to follow");
      return;
    }

    setWhoToFollow((prev) => prev.filter((u) => u._id !== userId));
    toast.success("Following user");

    try {
      await toggleFollow(userId);
      refreshUser();
    } catch (error: any) {
      toast.error(error.message || "Failed to follow");
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete);
      toast.success("Post deleted successfully");
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
      setPostToDelete(null);
      setDeleteMenuPostId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    }
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

                const isSaved = user?.savedPosts?.some((id: any) => {
                  const targetId = typeof id === "string" ? id : id?._id?.toString() || id?.toString();
                  return targetId === post._id;
                });

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
                      <div className="post-card__meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Link href={`/dashboard/profile?username=${post.author.username}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                            <img
                              src={post.author.imageUrl ? `http://localhost:8089${post.author.imageUrl}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author.username}`}
                              alt={post.author.username}
                              className="post-card__avatar"
                            />
                            <span className="post-card__author" style={{ color: "var(--color-on-surface)", fontWeight: 600 }}>{post.author.firstName} {post.author.lastName}</span>
                          </Link>
                          <span className="post-card__time">• {formatTimeAgo(post.createdAt)}</span>
                        </div>

                        {(user?._id === post.author._id || user?.role === "admin") && (
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => setDeleteMenuPostId(post._id === deleteMenuPostId ? null : post._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", display: "flex", alignItems: "center" }}
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            {deleteMenuPostId === post._id && (
                              <div style={{
                                position: "absolute", right: 0, top: "100%", zIndex: 10,
                                background: "var(--color-surface)", border: "1px solid var(--color-outline)",
                                borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "4px 0",
                                minWidth: "120px"
                              }}>
                                <button
                                  onClick={() => { setPostToDelete(post._id); setDeleteMenuPostId(null); }}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                                    width: "100%", background: "none", border: "none", cursor: "pointer",
                                    color: "var(--color-error)", fontSize: "14px"
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <h3 className="text-headline-md post-card__title">{post.title}</h3>
                      {post.subtitle && <p className="post-card__subtitle">{post.subtitle}</p>}

                      <ReadMoreText text={post.description} />

                      {post.mapData?.coordinates && (
                        <div style={{ marginTop: "12px", marginBottom: "12px", height: "200px" }}>
                          <MapPreview
                            coordinates={post.mapData.coordinates}
                            placeName={post.mapData.placeName}
                          />
                        </div>
                      )}

                      {/* Links — safe URL parsing */}
                      {post.links && post.links.length > 0 && (
                        <div className="post-card__links">
                          {post.links.map((link, idx) => (
                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="post-card__link">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span>
                              {safeHostname(link)}
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

                      {/* Inline Comment Snippet */}
                      {post.latestComment && (
                        <div
                          className="post-card__comment-snippet"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            background: "var(--color-surface-container-low)",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            marginTop: "12px",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                          onClick={() => setActiveCommentPost({ id: post._id, title: post.title })}
                        >
                          <img
                            src={post.latestComment.author?.imageUrl ? `http://localhost:8089${post.latestComment.author.imageUrl}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.latestComment.author?.username || "user"}`}
                            alt={post.latestComment.author?.username}
                            style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <span style={{ fontWeight: "700", marginRight: "6px", color: "var(--color-on-surface)" }}>
                              {post.latestComment.author?.username || "explorer"}:
                            </span>
                            <span style={{ color: "var(--color-on-surface-variant)" }}>
                              {post.latestComment.text}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Toolbar */}
                      <div className="post-card__toolbar">
                        <button className="post-card__action" onClick={() => setActiveCommentPost({ id: post._id, title: post.title })}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat_bubble_outline</span>
                          {post.commentCount || 0} Comments
                        </button>
                        <button className="post-card__action" onClick={() => handleShare(post._id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
                          Share
                        </button>
                        <button
                          className={`post-card__action ${isSaved ? "post-card__action--saved" : ""}`}
                          onClick={() => handleSave(post._id)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {isSaved ? "bookmark" : "bookmark_border"}
                          </span>
                          {isSaved ? "Saved" : "Save"}
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
            {trendingPosts.length > 0 ? trendingPosts.map((t) => (
              <Link href={`/dashboard/post/${t._id}`} key={t._id} style={{ textDecoration: "none" }}>
                <div className="trending-item">
                  {t.imageUrls && t.imageUrls.length > 0 ? (
                    <img src={`http://localhost:8089${t.imageUrls[0]}`} alt={t.title} className="trending-item__img" />
                  ) : (
                    <div className="trending-item__img" style={{ background: "var(--color-surface-container-high)" }}></div>
                  )}
                  <div className="trending-item__info">
                    <h4 className="text-label-md">{t.title}</h4>
                    <p className="text-body-sm">{t.upvoteCount} upvotes this week</p>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>No trending posts yet.</p>
            )}
            {trendingPosts.length > 0 && <a className="sidebar-view-all">View All Trending</a>}
          </div>

          {/* Top Explorers */}
          <div className="sidebar-card">
            <h3>Who to Follow</h3>
            {whoToFollow.length > 0 ? whoToFollow.map((u) => (
              <div key={u._id} className="explorer-item">
                <Link href={`/dashboard/profile?username=${u.username}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flex: 1 }}>
                  <img
                    src={u.imageUrl ? `http://localhost:8089${u.imageUrl}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`}
                    alt={u.username}
                    className="explorer-item__avatar"
                  />
                  <div className="explorer-item__info">
                    <span className="explorer-item__name text-label-md" style={{ color: "var(--color-on-surface)" }}>
                      {u.firstName} {u.lastName}
                    </span>
                    <div className="explorer-item__stats text-body-sm">
                      {u.followerCount} Followers
                    </div>
                  </div>
                </Link>
                <button
                  className="btn-outline-small"
                  onClick={() => handleFollowToggle(u._id)}
                  style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: "600", borderColor: "var(--color-primary)", color: "var(--color-primary)", flexShrink: 0 }}
                >
                  Follow
                </button>
              </div>
            )) : (
              <p className="text-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>No suggestions right now.</p>
            )}
          </div>
        </aside>
      </div>

      {activeCommentPost && (
        <CommentModal
          postId={activeCommentPost.id}
          postTitle={activeCommentPost.title}
          onClose={() => setActiveCommentPost(null)}
          onCommentAdded={(newComment) => {
            setPosts((prevPosts) =>
              prevPosts.map((post) => {
                if (post._id !== activeCommentPost.id) return post;
                return {
                  ...post,
                  commentCount: (post.commentCount || 0) + 1,
                  latestComment: newComment,
                };
              })
            );
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--color-surface)", padding: "24px", borderRadius: "16px",
            maxWidth: "400px", width: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 12px 0", color: "var(--color-on-surface)" }}>Delete Post?</h3>
            <p style={{ margin: "0 0 24px 0", color: "var(--color-on-surface-variant)", fontSize: "14px", lineHeight: "1.5" }}>
              Are you sure you want to delete this post? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setPostToDelete(null)}
                style={{
                  padding: "8px 16px", border: "1px solid var(--color-outline)", borderRadius: "8px",
                  background: "transparent", color: "var(--color-on-surface)", cursor: "pointer", fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                style={{
                  padding: "8px 16px", border: "none", borderRadius: "8px",
                  background: "var(--color-error)", color: "var(--color-on-error)", cursor: "pointer", fontWeight: 600
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}