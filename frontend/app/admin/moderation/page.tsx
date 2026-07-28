"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/api/axios-instance";
import { deleteAdminPost } from "@/lib/api/admin-posts";

interface FlaggedPost {
    _id: string;
    title: string;
    description: string;
    imageUrls: string[];
    isEdited: boolean;
    hasMap: boolean;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    createdAt: string;
    score: number; // controversy score
    author: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
        imageUrl?: string;
    };
}

interface UnverifiedUser {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUrl?: string;
    email: string;
    createdAt: string;
    isVerified: boolean;
}

const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export default function AdminModerationPage() {
    const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FlaggedPost | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Flagged posts: high downvote ratio (posts with downvotes > upvotes)
            const postsRes = await axiosInstance.get("/api/v1/admin/analytics/engagement");
            // Fetch all posts with controversy score
            const allPostsRes = await axiosInstance.get("/api/v1/admin/posts", {
                params: { page: 1, limit: 50 },
            });
            const allPosts = allPostsRes.data?.data ?? [];
            // Score = downvotes / (upvotes + 1) — higher = more controversial
            const scored = allPosts
                .map((p: any) => ({
                    ...p,
                    score: p.downvoteCount / (p.upvoteCount + 1),
                }))
                .filter((p: any) => p.downvoteCount > 0 || p.isEdited)
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 20);
            setFlaggedPosts(scored);

            // Unverified users
            const usersRes = await axiosInstance.get("/api/v1/admin/users", {
                params: { page: 1, limit: 50 },
            });
            const unverified = (usersRes.data?.data ?? []).filter(
                (u: any) => !u.isVerified
            );
            setUnverifiedUsers(unverified);
        } catch (e: any) {
            setError(e.message || "Failed to load moderation data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeletePost = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteAdminPost(deleteTarget._id);
            setDeleteTarget(null);
            loadData();
        } catch (e: any) {
            setError(e.message || "Failed to delete post");
        } finally {
            setDeleting(false);
        }
    };

    const handleVerifyUser = async (userId: string) => {
        setVerifyingId(userId);
        try {
            await axiosInstance.put(`/api/v1/admin/users/${userId}`, {
                isVerified: true,
            });
            setUnverifiedUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, isVerified: true } : u
                )
            );
        } catch (e: any) {
            setError(e.message || "Failed to verify user");
        } finally {
            setVerifyingId(null);
        }
    };

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">policy</span>
                    <div>
                        <h1 className="admin-panel__title">Moderation Queue</h1>
                        <p className="admin-panel__subtitle">
                            Review controversial trail content and pending user verifications
                        </p>
                    </div>
                </div>
                <button
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={loadData}
                    disabled={loading}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sync</span>
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-banner">
                    <span className="material-symbols-outlined">error_outline</span>
                    {error}
                    <button className="admin-error-banner__retry" onClick={loadData}>Retry</button>
                </div>
            )}

            <div className="admin-bento">
                {/* Tabs Bento Card */}
                <div className="bento-card bc-6" style={{ padding: "16px 20px" }}>
                    <div className="admin-moderation-tabs">
                        <button
                            id="tab-posts"
                            className={`admin-mod-tab ${activeTab === "posts" ? "admin-mod-tab--active" : ""}`}
                            onClick={() => setActiveTab("posts")}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>feed</span>
                            Controversial Posts
                            {flaggedPosts.length > 0 && (
                                <span className="admin-mod-badge">{flaggedPosts.length}</span>
                            )}
                        </button>
                        <button
                            id="tab-users"
                            className={`admin-mod-tab ${activeTab === "users" ? "admin-mod-tab--active" : ""}`}
                            onClick={() => setActiveTab("users")}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_cancel</span>
                            Unverified Users
                            {unverifiedUsers.length > 0 && (
                                <span className="admin-mod-badge">{unverifiedUsers.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Queue Bento Card */}
                <div className="bento-card bc-6">
                    {/* Loading */}
                    {loading ? (
                        <div className="admin-loading-overlay">
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 36, animation: "spin 1.5s linear infinite", color: "var(--color-primary)" }}
                            >
                                progress_activity
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* Controversial Posts Tab */}
                            {activeTab === "posts" && (
                                <div className="admin-mod-list">
                                    {flaggedPosts.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <span className="material-symbols-outlined admin-empty-state__icon">
                                                verified_user
                                            </span>
                                            <p>No controversial posts detected</p>
                                            <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                                                Posts with downvotes or flagged modifications will show up here.
                                            </span>
                                        </div>
                                    ) : (
                                        flaggedPosts.map((post) => {
                                            const ratio = post.upvoteCount + post.downvoteCount === 0
                                                ? 0
                                                : Math.round((post.downvoteCount / (post.upvoteCount + post.downvoteCount)) * 100);
                                            const severity = ratio >= 70 ? "high" : ratio >= 40 ? "medium" : "low";
                                            return (
                                                <div key={post._id} className={`admin-mod-card admin-mod-card--${severity}`}>
                                                    <div className="admin-mod-card__severity">
                                                        <span className={`admin-severity-dot admin-severity-dot--${severity}`} />
                                                        <span className="admin-severity-label">
                                                            {severity} Priority
                                                        </span>
                                                    </div>
                                                    {post.imageUrls?.[0] && (
                                                        <img
                                                            src={`${apiBase}${post.imageUrls[0]}`}
                                                            alt={post.title}
                                                            className="admin-mod-card__thumb"
                                                        />
                                                    )}
                                                    <div className="admin-mod-card__content">
                                                        <h3 className="admin-mod-card__title">{post.title}</h3>
                                                        <p className="admin-mod-card__desc">
                                                            {post.description?.slice(0, 100)}
                                                            {post.description?.length > 100 ? "…" : ""}
                                                        </p>
                                                        <div className="admin-mod-card__meta">
                                                            <span>by @{post.author?.username}</span>
                                                            <span>·</span>
                                                            <span>{fmt(post.createdAt)}</span>
                                                            {post.isEdited && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span className="admin-tag admin-tag--edited">Edited</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="admin-mod-card__stats">
                                                        <div className="admin-mod-vote-bar">
                                                            <div
                                                                className="admin-mod-vote-bar__fill admin-mod-vote-bar__fill--up"
                                                                style={{ flex: post.upvoteCount + 1 }}
                                                            />
                                                            <div
                                                                className="admin-mod-vote-bar__fill admin-mod-vote-bar__fill--down"
                                                                style={{ flex: post.downvoteCount }}
                                                            />
                                                        </div>
                                                        <span className="admin-mod-ratio">
                                                            {ratio}% downvoted
                                                        </span>
                                                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                                            <div className="admin-contrib-stat">
                                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>favorite_border</span>
                                                                {post.upvoteCount}
                                                            </div>
                                                            <div className="admin-contrib-stat">
                                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>heart_broken</span>
                                                                {post.downvoteCount}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="admin-mod-card__actions">
                                                        <button
                                                            id={`mod-delete-${post._id}`}
                                                            className="admin-btn admin-btn--danger admin-btn--sm"
                                                            onClick={() => setDeleteTarget(post)}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete_outline</span>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Unverified Users Tab */}
                            {activeTab === "users" && (
                                <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none" }}>
                                    {unverifiedUsers.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <span className="material-symbols-outlined admin-empty-state__icon">verified_user</span>
                                            <p>All user accounts are verified!</p>
                                        </div>
                                    ) : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Email</th>
                                                    <th>Joined</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {unverifiedUsers.map((u) => (
                                                    <tr key={u._id} id={`user-row-${u._id}`}>
                                                        <td>
                                                            <div className="admin-user-cell">
                                                                <div className="admin-user-avatar admin-user-avatar--sm">
                                                                    {u.imageUrl ? (
                                                                        <img src={`${apiBase}${u.imageUrl}`} alt={u.username} />
                                                                    ) : (
                                                                        (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="admin-user-name">
                                                                        {u.firstName} {u.lastName}
                                                                    </div>
                                                                    <div className="admin-user-username">@{u.username}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="admin-date-cell">{u.email}</span>
                                                        </td>
                                                        <td>
                                                            <span className="admin-date-cell">{fmt(u.createdAt)}</span>
                                                        </td>
                                                        <td>
                                                            <span className="admin-verified-pill admin-verified-pill--no">
                                                                Unverified
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                id={`verify-user-${u._id}`}
                                                                className="admin-btn admin-btn--primary admin-btn--sm"
                                                                disabled={verifyingId === u._id || u.isVerified}
                                                                onClick={() => handleVerifyUser(u._id)}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                                                    verified_user
                                                                </span>
                                                                {verifyingId === u._id ? "Verifying…" : "Verify"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__icon admin-modal__icon--danger">
                            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                                delete_forever
                            </span>
                        </div>
                        <h2 className="admin-modal__title">Remove Post?</h2>
                        <p className="admin-modal__body">
                            <strong>"{deleteTarget.title}"</strong> and all its comments will be
                            permanently removed. This cannot be undone.
                        </p>
                        <div className="admin-modal__actions">
                            <button
                                className="admin-btn admin-btn--ghost"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-mod-delete-btn"
                                className="admin-btn admin-btn--danger"
                                onClick={handleDeletePost}
                                disabled={deleting}
                            >
                                {deleting ? "Removing…" : "Remove Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
