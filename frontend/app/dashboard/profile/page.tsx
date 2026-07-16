"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getPublicProfile, toggleFollow, getSavedPosts, UserProfile } from "@/lib/api/users";
import { PostRecord, toggleVote, toggleSavePost, CommentRecord, updatePost } from "@/lib/api/posts";
import { getComments, createComment } from "@/lib/api/posts";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const TABS = ["My Posts", "Saved Posts"];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const resolveImage = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "recently";
  }
};

// ── Comment Modal Component ──
const CommentModal = ({ 
  postId, 
  onClose, 
  onCommentAdded 
}: { 
  postId: string; 
  onClose: () => void; 
  onCommentAdded?: (comment: CommentRecord) => void;
}) => {
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
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>progress_activity</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="comment-modal__empty">No comments yet. Be the first!</div>
          ) : (
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.author.imageUrl ? resolveImage(comment.author.imageUrl) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.author.username}`} 
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

// ── Edit Post Modal Component ──
interface ImageItem {
  id: string;
  type: "existing" | "new";
  url?: string;
  file?: File;
}

const EditPostModal = ({
  post,
  onClose,
  onPostUpdated,
}: {
  post: PostRecord;
  onClose: () => void;
  onPostUpdated: (updatedPost: PostRecord) => void;
}) => {
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(post.subtitle || "");
  const [description, setDescription] = useState(post.description);
  const [links, setLinks] = useState<string[]>(post.links || []);
  const [images, setImages] = useState<ImageItem[]>(
    (post.imageUrls || []).map((url, idx) => ({ id: `existing_${idx}`, type: "existing", url }))
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleLinkChange = (index: number, val: string) => {
    const updated = [...links];
    updated[index] = val;
    setLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newItems: ImageItem[] = Array.from(files).map((file, idx) => ({
      id: `new_${Date.now()}_${idx}`,
      type: "new",
      file,
    }));
    setImages([...images, ...newItems].slice(0, 5));
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === images.length - 1) return;
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and Description are required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      
      const validLinks = links.filter((l) => l.trim() !== "");
      formData.append("links", JSON.stringify(validLinks));

      // Build imageOrder array and append new files
      const imageOrder: string[] = [];
      let newFileCount = 0;

      images.forEach((img) => {
        if (img.type === "existing" && img.url) {
          imageOrder.push(img.url);
        } else if (img.type === "new" && img.file) {
          imageOrder.push(`new_${newFileCount}`);
          formData.append("images", img.file);
          newFileCount++;
        }
      });

      formData.append("imageOrder", JSON.stringify(imageOrder));

      const res = await updatePost(post._id, formData);
      toast.success("Post updated successfully!");
      onPostUpdated(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-detail-modal__overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="post-detail-modal__header">
          <h3 className="text-headline-md">Edit Post</h3>
          <button className="post-detail-modal__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="post-detail-modal__body form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="post-form__input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="post-form__input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="post-form__textarea"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manage & Rearrange Images</label>
            <div 
              className="post-form__dropzone" 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "16px", minHeight: "80px" }}
            >
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <p style={{ fontSize: "13px" }}>Click to add images (max 5 total)</p>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>

            {images.length > 0 && (
              <div className="reorder-container">
                {images.map((img, idx) => {
                  const src = img.type === "existing" ? resolveImage(img.url) : URL.createObjectURL(img.file!);
                  return (
                    <div key={img.id} className="reorder-item">
                      <img src={src} alt={`Preview ${idx + 1}`} />
                      <div className="reorder-item__controls">
                        <button
                          type="button"
                          className="reorder-item__btn"
                          onClick={() => moveImage(idx, "left")}
                          disabled={idx === 0}
                        >
                          <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <button
                          type="button"
                          className="reorder-item__btn"
                          onClick={() => removeImage(img.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                        <button
                          type="button"
                          className="reorder-item__btn"
                          onClick={() => moveImage(idx, "right")}
                          disabled={idx === images.length - 1}
                        >
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Links</label>
            {links.map((link, idx) => (
              <div key={idx} className="post-form__link-row">
                <input
                  type="url"
                  value={link}
                  placeholder="https://example.com"
                  onChange={(e) => handleLinkChange(idx, e.target.value)}
                  className="post-form__input"
                />
                <button
                  type="button"
                  className="post-form__link-remove"
                  onClick={() => handleRemoveLink(idx)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="post-form__add-link"
              onClick={handleAddLink}
            >
              <span className="material-symbols-outlined">add</span> Add Link
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Post Detail Modal Component ──
const PostDetailModal = ({
  post,
  onClose,
  isOwnProfile,
  onPostUpdated,
  onVoteToggled,
  onSaveToggled,
}: {
  post: PostRecord;
  onClose: () => void;
  isOwnProfile: boolean;
  onPostUpdated: (updatedPost: PostRecord) => void;
  onVoteToggled: (postId: string, type: "upvote" | "downvote") => void;
  onSaveToggled: (postId: string) => void;
}) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const author = post.author;
  const authorAvatar = author?.imageUrl
    ? resolveImage(author.imageUrl)
    : `https://api.dicebear.com/7.x/adventurer/svg?seed=${author?.username || "user"}`;

  const netVotes = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
  const hasUpvoted = user ? post.upvotes?.includes(user._id) : false;
  const hasDownvoted = user ? post.downvotes?.includes(user._id) : false;

  const isSaved = user?.savedPosts?.some((id: any) => {
    const targetId = typeof id === "string" ? id : id?._id?.toString() || id?.toString();
    return targetId === post._id;
  });

  return (
    <>
      <div className="post-detail-modal__overlay" onClick={onClose}>
        <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="post-detail-modal__header">
            <h3 className="text-headline-md">{post.title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isOwnProfile && (
                <button
                  className="profile-settings-btn"
                  style={{ padding: "6px 12px" }}
                  onClick={() => setShowEditModal(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  Edit
                </button>
              )}
              <button className="post-detail-modal__close" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div className="post-detail-modal__body">
            {/* Author details */}
            <div className="post-card__author" style={{ marginBottom: "16px" }}>
              <img src={authorAvatar} alt={author?.username} className="post-card__avatar" />
              <div>
                <span className="post-card__author-name">
                  {author?.firstName} {author?.lastName}
                </span>
                <span className="post-card__time">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Subtitle */}
            {post.subtitle && (
              <p className="post-card__subtitle" style={{ fontSize: "15px", marginBottom: "8px" }}>
                {post.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="post-card__desc" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.6" }}>
              {post.description}
            </p>

            {/* Edited tag indicator */}
            {post.isEdited && (
              <span className="edited-tag">(edited)</span>
            )}

            {/* Images Carousel list */}
            {post.imageUrls?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                {post.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={resolveImage(url)}
                    alt={`Post image ${i + 1}`}
                    style={{ width: "100%", borderRadius: "var(--radius-md)", objectFit: "contain", maxHeight: "450px" }}
                  />
                ))}
              </div>
            )}

            {/* Links */}
            {post.links && post.links.length > 0 && (
              <div className="post-card__links" style={{ marginTop: "16px" }}>
                {post.links.map((link, idx) => (
                  <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="post-card__link">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span>
                    {new URL(link).hostname.replace('www.', '')}
                  </a>
                ))}
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
                  marginTop: "16px",
                  fontSize: "13px",
                  cursor: "pointer"
                }} 
                onClick={() => setShowCommentModal(true)}
              >
                <img 
                  src={post.latestComment.author?.imageUrl ? resolveImage(post.latestComment.author.imageUrl) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.latestComment.author?.username || "user"}`} 
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

            {/* Action Bar */}
            <div className="post-card__toolbar" style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  className={`post-card__vote-btn post-card__vote-btn--upvote ${hasUpvoted ? "post-card__vote-btn--active" : ""}`}
                  onClick={() => onVoteToggled(post._id, "upvote")}
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
                <span className="post-card__vote-count" style={{ fontSize: "14px" }}>
                  {netVotes}
                </span>
                <button
                  className={`post-card__vote-btn post-card__vote-btn--downvote ${hasDownvoted ? "post-card__vote-btn--active" : ""}`}
                  onClick={() => onVoteToggled(post._id, "downvote")}
                >
                  <span className="material-symbols-outlined">arrow_downward</span>
                </button>
              </div>

              <button className="post-card__action" onClick={() => setShowCommentModal(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat_bubble_outline</span>
                {post.commentCount || 0} Comments
              </button>

              <button 
                className={`post-card__action ${isSaved ? "post-card__action--saved" : ""}`} 
                onClick={() => onSaveToggled(post._id)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {isSaved ? "bookmark" : "bookmark_border"}
                </span>
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={onPostUpdated}
        />
      )}

      {showCommentModal && (
        <CommentModal
          postId={post._id}
          onClose={() => setShowCommentModal(false)}
          onCommentAdded={(newComment) => {
            onPostUpdated({
              ...post,
              commentCount: (post.commentCount || 0) + 1,
              latestComment: newComment,
            });
          }}
        />
      )}
    </>
  );
};

export default function ProfilePage() {
  const { user, refreshUser, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data from API
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profilePosts, setProfilePosts] = useState<PostRecord[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostRecord[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Post Detail Modal State
  const [selectedPost, setSelectedPost] = useState<PostRecord | null>(null);

  const isOwnProfile = true; // currently only viewing own profile

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const res = await getPublicProfile(user.username);
      setProfileData(res.data.user);
      setProfilePosts(res.data.posts);
      setFollowersCount(res.data.followersCount);
      setFollowingCount(res.data.followingCount);

      if (res.data.user.followers && user?._id) {
        setIsFollowing(res.data.user.followers.some((id: string) => id === user._id));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.username, user?._id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch saved posts when tab switches
  useEffect(() => {
    if (activeTab === 1 && isOwnProfile) {
      getSavedPosts()
        .then((res) => setSavedPosts(res.data || []))
        .catch((err) => console.error("Failed to load saved posts:", err));
    }
  }, [activeTab, isOwnProfile]);

  const getAvatarUrl = () => {
    if (profileData?.imageUrl) return resolveImage(profileData.imageUrl);
    if (user?.imageUrl) return resolveImage(user.imageUrl);
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || "explorer"}`;
  };

  const getCoverUrl = () => {
    if (profileData?.coverImageUrl) return resolveImage(profileData.coverImageUrl);
    return "";
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setImgLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);
      await updateUserProfile(formData);
      await fetchProfile();
    } catch (err) {
      console.error("Failed to upload:", err);
    } finally {
      setImgLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFollowToggle = async () => {
    if (!profileData?._id) return;
    try {
      const res = await toggleFollow(profileData._id);
      setIsFollowing(res.data.isFollowing);
      setFollowersCount((prev) => (res.data.isFollowing ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    const updater = (prevPosts: PostRecord[]) =>
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
        const updated = { ...post, upvotes: newUpvotes, downvotes: newDownvotes };
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(updated);
        }
        return updated;
      });

    setProfilePosts(updater);
    setSavedPosts(updater);

    try {
      const res = await toggleVote(postId, type);
      const finalUpdater = (prevPosts: PostRecord[]) =>
        prevPosts.map((p) => {
          if (p._id !== postId) return p;
          const updated = { ...p, upvotes: res.data.post.upvotes, downvotes: res.data.post.downvotes };
          if (selectedPost && selectedPost._id === postId) {
            setSelectedPost(updated);
          }
          return updated;
        });
      setProfilePosts(finalUpdater);
      setSavedPosts(finalUpdater);
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
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
      
      if (activeTab === 1) {
        setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(null);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    }
  };

  const handlePostUpdated = (updatedPost: PostRecord) => {
    const updater = (prev: PostRecord[]) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p));
    setProfilePosts(updater);
    setSavedPosts(updater);
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  const displayName = profileData
    ? `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim()
    : user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Explorer";

  const coverUrl = getCoverUrl();

  // Render post preview item inside Instagram grid
  const renderGridItem = (post: PostRecord) => {
    const hasImage = post.imageUrls && post.imageUrls.length > 0;
    const firstImg = hasImage ? resolveImage(post.imageUrls[0]) : "";

    return (
      <div key={post._id} className="instagram-grid__item" onClick={() => setSelectedPost(post)}>
        {hasImage ? (
          <img src={firstImg} alt={post.title} className="instagram-grid__img" />
        ) : (
          <div className="instagram-grid__placeholder">
            <span className="material-symbols-outlined">feed</span>
            <p style={{ fontWeight: 600, fontSize: "14px" }}>{post.title}</p>
          </div>
        )}
        
        {/* Overlay showing stats on hover */}
        <div className="instagram-grid__overlay">
          <span className="instagram-grid__stat">
            <span className="material-symbols-outlined">thumb_up</span>
            {post.upvotes?.length || 0}
          </span>
          <span className="instagram-grid__stat">
            <span className="material-symbols-outlined">chat_bubble</span>
            {post.commentCount || 0}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, animation: "spin 1s linear infinite", color: "var(--color-primary)" }}>
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Cover Photo — LinkedIn-style 4:1 aspect ratio */}
      {coverUrl ? (
        <div
          className="profile-cover"
          style={{
            backgroundImage: `url(${coverUrl})`,
            aspectRatio: "4 / 1",
            maxHeight: 396,
            height: "auto",
          }}
        />
      ) : (
        <div
          className="profile-cover profile-cover--placeholder"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-secondary-container) 100%)",
            aspectRatio: "4 / 1",
            maxHeight: 396,
            height: "auto",
          }}
        />
      )}

      {/* Profile Header */}
      <div className="profile-header" style={{ display: 'flex', gap: '40px', padding: '20px 40px', alignItems: 'flex-start', maxWidth: '1000px', margin: '0 auto', marginTop: coverUrl ? '-40px' : '20px' }}>
        {/* Avatar */}
        <div className="profile-avatar-wrap" style={{ flexShrink: 0 }}>
          <img src={getAvatarUrl()} alt={displayName} className="profile-avatar" style={{ width: '150px', height: '150px', border: '4px solid var(--color-surface-container-lowest)' }} />
          {isOwnProfile && (
            <button
              className="profile-avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={imgLoading}
              aria-label="Upload profile picture"
              style={{ bottom: '10px', right: '10px' }}
            >
              {imgLoading ? (
                <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_camera</span>
              )}
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" style={{ display: "none" }} />
        </div>

        {/* Info & Stats Container */}
        <div className="profile-header__info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
          
          {/* Top Row: Username + Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 className="profile-header__username" style={{ fontSize: '20px', fontWeight: '400', color: 'var(--color-on-surface)', margin: 0 }}>
              {profileData?.username || user?.username}
            </h1>
            <div className="profile-header__actions">
              {isOwnProfile ? (
                <Link href="/dashboard/settings" className="profile-settings-btn" style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', fontSize: '14px', fontWeight: '600', textDecoration: 'none', border: 'none' }}>
                  Edit Profile
                </Link>
              ) : (
                <button className="profile-follow-btn" onClick={handleFollowToggle} style={{ padding: '6px 24px', borderRadius: '8px', background: isFollowing ? 'var(--color-surface-container-high)' : 'var(--color-primary)', color: isFollowing ? 'var(--color-on-surface)' : 'var(--color-on-primary)', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="profile-stats" style={{ display: 'flex', gap: '40px', padding: 0, border: 'none', background: 'transparent', margin: 0, justifyContent: 'flex-start' }}>
            <div className="profile-stat" style={{ flexDirection: 'row', gap: '6px', fontSize: '16px', border: 'none' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-on-surface)' }}>{profilePosts.length}</span>
              <span style={{ color: 'var(--color-on-surface)' }}>posts</span>
            </div>
            <div className="profile-stat" style={{ flexDirection: 'row', gap: '6px', fontSize: '16px', border: 'none' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-on-surface)' }}>{followersCount}</span>
              <span style={{ color: 'var(--color-on-surface)' }}>followers</span>
            </div>
            <div className="profile-stat" style={{ flexDirection: 'row', gap: '6px', fontSize: '16px', border: 'none' }}>
              <span style={{ fontWeight: '600', color: 'var(--color-on-surface)' }}>{followingCount}</span>
              <span style={{ color: 'var(--color-on-surface)' }}>following</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="profile-bio-section" style={{ fontSize: '14px', color: 'var(--color-on-surface)' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{displayName}</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {profileData?.bio || "No bio yet. Add one in settings!"}
            </div>
            
            {profileData?.preferredTerrains && profileData.preferredTerrains.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-outline)', marginBottom: '6px', fontWeight: '500' }}>Preferred Terrain</div>
                <div className="terrain-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {profileData.preferredTerrains.map((terrain) => (
                    <span key={terrain} className="terrain-tag" style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>{terrain}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content Grid */}
      <div className="profile-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {/* ═══ Main Content — Tabs ═══ */}
        <section style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
          <div className="profile-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '40px', borderBottom: 'none', marginBottom: '20px', marginTop: '-1px' }}>
            {TABS.map((tab, i) => {
              if (i === 1 && !isOwnProfile) return null;
              const isActive = i === activeTab;
              return (
                <button
                  key={tab}
                  className="profile-tab"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderTop: isActive ? '1px solid var(--color-on-surface)' : '1px solid transparent',
                    color: isActive ? 'var(--color-on-surface)' : 'var(--color-outline)',
                    padding: '16px 0 0',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setActiveTab(i)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {i === 0 ? 'grid_on' : 'bookmark_border'}
                  </span>
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Instagram Grid of posts */}
          <div className="instagram-grid">
            {activeTab === 0 && (
              <>
                {profilePosts.length > 0 ? (
                  profilePosts.map((post) => renderGridItem(post))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--color-outline)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: "block" }}>edit_note</span>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No posts yet</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 1 && isOwnProfile && (
              <>
                {savedPosts.length > 0 ? (
                  savedPosts.map((post) => renderGridItem(post))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--color-outline)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: "block" }}>bookmark_border</span>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No saved posts</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Selected Post Details Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isOwnProfile={selectedPost.author._id === user?._id}
          onPostUpdated={handlePostUpdated}
          onVoteToggled={handleVote}
          onSaveToggled={handleSave}
        />
      )}
    </>
  );
}
