"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    getAdminPosts,
    deleteAdminPost,
    AdminPostRecord,
    AdminPostPaginationMeta,
} from "@/lib/api/admin-posts";

const FILTER_OPTIONS = [
    { key: "all", label: "All Posts", icon: "feed" },
    { key: "map", label: "With Map", icon: "travel_explore" },
    { key: "images", label: "With Images", icon: "image_search" },
    { key: "edited", label: "Edited", icon: "edit_note" },
] as const;

type FilterKey = (typeof FILTER_OPTIONS)[number]["key"];

const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<AdminPostRecord[]>([]);
    const [meta, setMeta] = useState<AdminPostPaginationMeta>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterKey>("all");
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<AdminPostRecord | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchPosts = useCallback(
        async (p: number, s: string, f: FilterKey) => {
            setLoading(true);
            setError(null);
            try {
                const res = await getAdminPosts({ page: p, limit: 10, search: s, filter: f });
                setPosts(res.data);
                setMeta(res.meta);
            } catch (e: any) {
                setError(e.message || "Failed to load posts");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchPosts(page, search, filter);
    }, [page, filter, fetchPosts]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setPage(1);
            fetchPosts(1, val, filter);
        }, 400);
    };

    const handleFilterChange = (f: FilterKey) => {
        setFilter(f);
        setPage(1);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteAdminPost(deleteTarget._id);
            setDeleteTarget(null);
            fetchPosts(page, search, filter);
        } catch (e: any) {
            setDeleteError(e.message || "Failed to delete post");
        } finally {
            setDeleting(false);
        }
    };

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">feed</span>
                    <div>
                        <h1 className="admin-panel__title">Posts Management</h1>
                        <p className="admin-panel__subtitle">
                            Search, filter, and moderate user trail posts
                        </p>
                    </div>
                </div>
                <div className="admin-toolbar__meta">
                    <span className="admin-toolbar__count">{meta.total} posts total</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-banner">
                    <span className="material-symbols-outlined">error_outline</span>
                    {error}
                    <button
                        className="admin-error-banner__retry"
                        onClick={() => fetchPosts(page, search, filter)}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="admin-bento">
                {/* Search & Filter Bento Card */}
                <div className="bento-card bc-6" style={{ gap: 16 }}>
                    <div className="admin-toolbar">
                        <div className="admin-search">
                            <span className="material-symbols-outlined admin-search__icon">search</span>
                            <input
                                id="admin-posts-search"
                                className="admin-search__input"
                                placeholder="Search trails by title…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {search && (
                                <button
                                    className="admin-search__clear"
                                    onClick={() => handleSearchChange("")}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                        close
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="admin-filter-chips">
                        {FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                id={`filter-${opt.key}`}
                                className={`admin-chip ${filter === opt.key ? "admin-chip--active" : ""}`}
                                onClick={() => handleFilterChange(opt.key)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    {opt.icon}
                                </span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Table Bento Card */}
                <div className="bento-card bc-6">
                    <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none" }}>
                        {loading ? (
                            <div className="admin-loading-overlay">
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        fontSize: 36,
                                        animation: "spin 1.5s linear infinite",
                                        color: "var(--color-primary)",
                                    }}
                                >
                                    progress_activity
                                </span>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="admin-empty-state">
                                <span className="material-symbols-outlined admin-empty-state__icon">
                                    inbox
                                </span>
                                <p>No matching posts found</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Post</th>
                                        <th>Author</th>
                                        <th>Engagement</th>
                                        <th>Tags</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post) => (
                                        <tr key={post._id} id={`post-row-${post._id}`}>
                                            {/* Post cell */}
                                            <td>
                                                <div className="admin-posts-post-cell">
                                                    {post.imageUrls?.[0] ? (
                                                        <img
                                                            src={`${apiBase}${post.imageUrls[0]}`}
                                                            alt={post.title}
                                                            className="admin-posts-thumb"
                                                        />
                                                    ) : (
                                                        <div className="admin-posts-thumb admin-posts-thumb--placeholder">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>
                                                                landscape
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="admin-posts-info">
                                                        <span className="admin-posts-title">{post.title}</span>
                                                        <span className="admin-posts-desc">
                                                            {post.description?.slice(0, 60)}
                                                            {post.description?.length > 60 ? "…" : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Author */}
                                            <td>
                                                <div className="admin-posts-author">
                                                    <div className="admin-user-avatar admin-user-avatar--sm">
                                                        {post.author?.imageUrl ? (
                                                            <img
                                                                src={`${apiBase}${post.author.imageUrl}`}
                                                                alt={post.author.username}
                                                            />
                                                        ) : (
                                                            (post.author?.firstName?.[0] ?? "") +
                                                            (post.author?.lastName?.[0] ?? "")
                                                        )}
                                                    </div>
                                                    <span className="admin-posts-author-name">
                                                        @{post.author?.username ?? "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Engagement */}
                                            <td>
                                                <div className="admin-posts-engage">
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                                            favorite_border
                                                        </span>
                                                        {post.upvoteCount}
                                                    </span>
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                                            heart_broken
                                                        </span>
                                                        {post.downvoteCount}
                                                    </span>
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                                            chat_bubble_outline
                                                        </span>
                                                        {post.commentCount}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Tags */}
                                            <td>
                                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                    {post.hasMap && (
                                                        <span className="admin-tag admin-tag--map">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>travel_explore</span>
                                                            Map
                                                        </span>
                                                    )}
                                                    {post.imageUrls?.length > 0 && (
                                                        <span className="admin-tag admin-tag--img">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>image_search</span>
                                                            {post.imageUrls.length}
                                                        </span>
                                                    )}
                                                    {post.isEdited && (
                                                        <span className="admin-tag admin-tag--edited">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>edit_note</span>
                                                            Edited
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Date */}
                                            <td>
                                                <span className="admin-date-cell">{fmt(post.createdAt)}</span>
                                            </td>
                                            {/* Actions */}
                                            <td>
                                                <button
                                                    id={`delete-post-${post._id}`}
                                                    className="admin-btn admin-btn--danger admin-btn--sm"
                                                    onClick={() => setDeleteTarget(post)}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                                        delete_outline
                                                    </span>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Pagination (Bento span 6) */}
                {!loading && meta.totalPages > 1 && (
                    <div className="bc-6" style={{ display: "flex", justifyContent: "center" }}>
                        <div className="admin-pagination">
                            <button
                                id="pagination-prev"
                                className="admin-btn admin-btn--ghost admin-btn--sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    chevron_left
                                </span>
                                Prev
                            </button>
                            <span className="admin-pagination__info">
                                Page {meta.page} of {meta.totalPages}
                            </span>
                            <button
                                id="pagination-next"
                                className="admin-btn admin-btn--ghost admin-btn--sm"
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    chevron_right
                                </span>
                            </button>
                        </div>
                    </div>
                )}
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
                        <h2 className="admin-modal__title">Delete Post?</h2>
                        <p className="admin-modal__body">
                            <strong>"{deleteTarget.title}"</strong> and all its comments will be
                            permanently removed. This action cannot be undone.
                        </p>
                        {deleteError && (
                            <div className="admin-error-banner" style={{ marginTop: 12 }}>
                                {deleteError}
                            </div>
                        )}
                        <div className="admin-modal__actions">
                            <button
                                className="admin-btn admin-btn--ghost"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                id="confirm-delete-post-btn"
                                className="admin-btn admin-btn--danger"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting…" : "Delete Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
