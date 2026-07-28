"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAnalyticsOverview,
    getAnalyticsContent,
    getAnalyticsEngagement,
    OverviewStats,
    ContentData,
    EngagementData,
} from "@/lib/api/admin-analytics";

/* ─── helpers ─── */
const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const pct = (part: number, total: number) =>
    total === 0 ? 0 : Math.round((part / total) * 100);

/* ─── Engagement Stacked Chart ─── */
function EngagementChart({ data }: { data: EngagementData["weeklyEngagement"] }) {
    if (!data.length) return <div className="admin-chart-empty">No data available yet</div>;
    const max = Math.max(...data.map((d) => d.upvotes + d.downvotes), 1);
    return (
        <div className="admin-chart-outer">
            <div className="admin-chart-bars">
                {data.map((d, i) => {
                    const totalH = Math.max(4, ((d.upvotes + d.downvotes) / max) * 100);
                    const upH = (d.upvotes / (d.upvotes + d.downvotes || 1)) * totalH;
                    const dnH = totalH - upH;
                    return (
                        <div key={i} className="admin-chart-bar-col">
                            <span className="admin-chart-bar-value">{d.upvotes + d.downvotes}</span>
                            <div className="admin-chart-stacked" style={{ height: `${totalH}%` }}>
                                <div style={{ flex: upH, background: "var(--color-primary)", borderRadius: "3px 3px 0 0" }} />
                                <div style={{ flex: dnH, background: "var(--color-tertiary)" }} />
                            </div>
                            <span className="admin-chart-bar-label">{d.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="admin-chart-legend">
                <div className="admin-chart-legend-item">
                    <span className="admin-chart-legend-dot" style={{ background: "var(--color-primary)" }} />
                    <span>Upvotes</span>
                </div>
                <div className="admin-chart-legend-item">
                    <span className="admin-chart-legend-dot" style={{ background: "var(--color-tertiary)" }} />
                    <span>Downvotes</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Terrain Bar ─── */
function TerrainBar({ terrain, count, max }: { terrain: string; count: number; max: number }) {
    return (
        <div className="admin-terrain-row">
            <span className="admin-terrain-label">{terrain}</span>
            <div className="admin-terrain-track">
                <div
                    className="admin-terrain-fill"
                    style={{ width: `${(count / max) * 100}%` }}
                />
            </div>
            <span className="admin-terrain-count">{count}</span>
        </div>
    );
}

/* ─── Main Page ─── */
export default function AdminOverviewPage() {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [content, setContent] = useState<ContentData | null>(null);
    const [engagement, setEngagement] = useState<EngagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ovRes, ctRes, enRes] = await Promise.all([
                getAnalyticsOverview(),
                getAnalyticsContent(),
                getAnalyticsEngagement(),
            ]);
            setOverview(ovRes.data);
            setContent(ctRes.data);
            setEngagement(enRes.data);
            setLastRefreshed(new Date());
        } catch (e: any) {
            setError(e.message || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const terrainMax = content?.terrainDistribution?.[0]?.count ?? 1;

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">
                        space_dashboard
                    </span>
                    <div>
                        <h1 className="admin-panel__title">Platform Overview</h1>
                        <p className="admin-panel__subtitle">
                            Live telemetry and insights from Trailidea
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                        Updated: {lastRefreshed.toLocaleTimeString()}
                    </span>
                    <button
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={loadAll}
                        disabled={loading}
                        id="refresh-analytics-btn"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            sync
                        </span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-banner">
                    <span className="material-symbols-outlined">error_outline</span>
                    {error}
                    <button className="admin-error-banner__retry" onClick={loadAll}>
                        Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="admin-loading-overlay">
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 40, animation: "spin 1.5s linear infinite", color: "var(--color-primary)" }}
                    >
                        progress_activity
                    </span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}>
                        Syncing dashboard metrics…
                    </span>
                </div>
            )}

            {/* Bento Grid */}
            {!loading && overview && (
                <div className="admin-bento">
                    {/* Hero Bento Card (4 cols, 2 rows span) */}
                    <div className="bento-card bento-card--hero bc-4 br-2">
                        <div className="bento-kpi__eyebrow bento-kpi__eyebrow--light">
                            <span className="material-symbols-outlined bento-kpi__icon bento-kpi__icon--light">
                                travel_explore
                            </span>
                            Live Platform Telemetry
                        </div>
                        <div style={{ marginTop: "auto" }}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Welcome to Trailidea Admin</h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "6px 0 20px", lineHeight: 1.4 }}>
                                You have {overview.totalUsers} registered trail seekers exploring {overview.totalPosts} user-contributed locations worldwide.
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div style={{ background: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 10 }}>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>USER ENGAGEMENT</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                                        {fmt(overview.totalUpvotes + overview.totalDownvotes)} votes
                                    </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 10 }}>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>MAP COVERAGE</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                                        {pct(overview.postsWithMap, overview.totalPosts)}% trails mapped
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Users */}
                    <div className="bento-card bento-card--accented bc-2" style={{ "--card-accent": "var(--color-primary)" } as any}>
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined bento-kpi__icon">
                                people_outline
                            </span>
                            Total Users
                        </div>
                        <div className="bento-kpi__value">{fmt(overview.totalUsers)}</div>
                        <div className="bento-kpi__sub">
                            +{overview.newUsersThisMonth} registered this month
                        </div>
                        {overview.newUsersThisMonth > 0 && (
                            <span className="bento-trend bento-trend--up">
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>trending_up</span>
                                {overview.newUsersThisMonth} new
                            </span>
                        )}
                    </div>

                    {/* KPI Posts */}
                    <div className="bento-card bento-card--accented bc-2" style={{ "--card-accent": "#2e7d32" } as any}>
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined bento-kpi__icon">
                                feed
                            </span>
                            Total Posts
                        </div>
                        <div className="bento-kpi__value">{fmt(overview.totalPosts)}</div>
                        <div className="bento-kpi__sub">
                            +{overview.newPostsThisMonth} published this month
                        </div>
                        {overview.newPostsThisMonth > 0 && (
                            <span className="bento-trend bento-trend--up" style={{ color: "#2e7d32", background: "rgba(46,125,50,0.1)" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>trending_up</span>
                                {overview.newPostsThisMonth} new
                            </span>
                        )}
                    </div>

                    {/* KPI Comments */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi-row">
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-secondary)" }}>
                                forum
                            </span>
                            <div>
                                <div className="bento-kpi__value bento-kpi__value--md">{fmt(overview.totalComments)}</div>
                                <div className="bento-kpi__label">Comments</div>
                            </div>
                        </div>
                        <div className="bento-kpi__sub">Community discussions</div>
                    </div>

                    {/* KPI Verified */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi-row">
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#1565c0" }}>
                                verified_user
                            </span>
                            <div>
                                <div className="bento-kpi__value bento-kpi__value--md">{pct(overview.verifiedUsers, overview.totalUsers)}%</div>
                                <div className="bento-kpi__label">Verified Members</div>
                            </div>
                        </div>
                        <div className="bento-kpi__sub">{overview.verifiedUsers} users verified</div>
                    </div>

                    {/* KPI Geo Posts */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi-row">
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#6a1b9a" }}>
                                travel_explore
                            </span>
                            <div>
                                <div className="bento-kpi__value bento-kpi__value--md">{fmt(overview.postsWithMap)}</div>
                                <div className="bento-kpi__label">Geo-tagged Trails</div>
                            </div>
                        </div>
                        <div className="bento-kpi__sub">{pct(overview.postsWithMap, overview.totalPosts)}% with GPX coordinate maps</div>
                    </div>

                    {/* KPI Image Posts */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi-row">
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#e65100" }}>
                                image_search
                            </span>
                            <div>
                                <div className="bento-kpi__value bento-kpi__value--md">{fmt(overview.postsWithImages)}</div>
                                <div className="bento-kpi__label">Visual Trails</div>
                            </div>
                        </div>
                        <div className="bento-kpi__sub">{pct(overview.postsWithImages, overview.totalPosts)}% with image galleries</div>
                    </div>

                    {/* KPI Admins */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi-row">
                            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#880e4f" }}>
                                shield_person
                            </span>
                            <div>
                                <div className="bento-kpi__value bento-kpi__value--md">{overview.adminCount}</div>
                                <div className="bento-kpi__label">Admins</div>
                            </div>
                        </div>
                        <div className="bento-kpi__sub">Active admin operators</div>
                    </div>

                    {/* Weekly Posts Created (Bento span 3) */}
                    <div className="bento-card bc-3 br-2">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">feed</span>
                            Weekly Submission Trend
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Latest posts and vote distributions</p>
                        <EngagementChart data={engagement?.weeklyEngagement ?? []} />
                    </div>

                    {/* Terrain Distribution (Bento span 3) */}
                    <div className="bento-card bc-3 br-2">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">landscape</span>
                            Terrain Preferences
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Top preferences tagged in user profiles</p>
                        {content?.terrainDistribution?.length ? (
                            <div className="admin-terrain-list" style={{ marginTop: 8 }}>
                                {content.terrainDistribution.map((t) => (
                                    <TerrainBar
                                        key={t.terrain}
                                        terrain={t.terrain}
                                        count={t.count}
                                        max={terrainMax}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="admin-chart-empty">No terrain preferences set yet</div>
                        )}
                    </div>

                    {/* Top Contributors (Bento span 3) */}
                    <div className="bento-card bc-3 br-2">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">workspace_premium</span>
                            Top Contributors
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Most active creators on Trailidea</p>
                        <div className="admin-contrib-list" style={{ marginTop: 4 }}>
                            {content?.topContributors?.map((c, i) => {
                                const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
                                return (
                                    <div key={c._id} className="admin-contrib-row">
                                        <span className={`admin-contrib-rank ${rankClass ? `admin-contrib-rank--${rankClass}` : ""}`}>{i + 1}</span>
                                        <div className="admin-contrib-avatar">
                                            {c.user.imageUrl ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${c.user.imageUrl}`}
                                                    alt={c.user.username}
                                                    className="admin-contrib-avatar__img"
                                                />
                                            ) : (
                                                <div className="admin-contrib-avatar__fallback">
                                                    {(c.user.firstName?.[0] ?? "") + (c.user.lastName?.[0] ?? "")}
                                                </div>
                                            )}
                                        </div>
                                        <div className="admin-contrib-info">
                                            <span className="admin-contrib-name">
                                                {c.user.firstName} {c.user.lastName}
                                                {c.user.isVerified && (
                                                    <span
                                                        className="material-symbols-outlined"
                                                        style={{ fontSize: 13, color: "#1565c0" }}
                                                    >
                                                        verified_user
                                                    </span>
                                                )}
                                            </span>
                                            <span className="admin-contrib-username">@{c.user.username}</span>
                                        </div>
                                        <div className="admin-contrib-stats">
                                            <span className="admin-contrib-stat">
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>feed</span>
                                                {c.postCount}
                                            </span>
                                            <span className="admin-contrib-stat">
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>favorite_border</span>
                                                {c.totalUpvotes}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {!content?.topContributors?.length && (
                                <div className="admin-chart-empty">No posts yet</div>
                            )}
                        </div>
                    </div>

                    {/* Most Saved Posts (Bento span 3) */}
                    <div className="bento-card bc-3 br-2">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">collections_bookmark</span>
                            Most Saved Trails
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Most bookmarked trails by users</p>
                        <div className="admin-activity-list" style={{ marginTop: 4 }}>
                            {engagement?.mostSavedPosts?.map((post, i) => (
                                <div key={post._id} className="admin-activity-row">
                                    <span className="admin-contrib-rank">{i + 1}</span>
                                    <div className="admin-activity-info">
                                        <span className="admin-activity-title">{post.title}</span>
                                        <span className="admin-activity-sub">by @{post.author.username}</span>
                                    </div>
                                    <div className="admin-activity-meta">
                                        <span className="admin-contrib-stat">
                                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bookmark</span>
                                            {post.savedCount}
                                        </span>
                                        <span className="admin-contrib-stat">
                                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>favorite_border</span>
                                            {post.upvoteCount}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {!engagement?.mostSavedPosts?.length && (
                                <div className="admin-chart-empty">No saved posts yet</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Signups (Bento span 6) */}
                    <div className="bento-card bc-6">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">how_to_reg</span>
                            New Registrations
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Recently joined trail explorers</p>
                        <div className="admin-signup-grid" style={{ marginTop: 4 }}>
                            {content?.recentSignups?.map((u) => (
                                <div key={u._id} className="admin-signup-card">
                                    <div className="admin-signup-avatar">
                                        {u.imageUrl ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${u.imageUrl}`}
                                                alt={u.username}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")
                                        )}
                                    </div>
                                    <div className="admin-signup-info">
                                        <div className="admin-signup-name">{u.firstName} {u.lastName}</div>
                                        <div className="admin-signup-date">@{u.username}</div>
                                    </div>
                                    <span className={`admin-role-badge admin-role-badge--${u.role}`}>
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                            {!content?.recentSignups?.length && (
                                <div className="admin-chart-empty">No new signups yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
