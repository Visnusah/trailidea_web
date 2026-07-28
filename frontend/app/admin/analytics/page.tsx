"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAnalyticsGrowth,
    getAnalyticsEngagement,
    GrowthData,
    EngagementData,
} from "@/lib/api/admin-analytics";

function BarChart({
    data,
    labelKey,
    valueKey,
    color,
    maxOverride,
}: {
    data: Record<string, any>[];
    labelKey: string;
    valueKey: string;
    color: string;
    maxOverride?: number;
}) {
    if (!data.length)
        return <div className="admin-chart-empty">No data available yet</div>;
    const max = maxOverride ?? Math.max(...data.map((d) => d[valueKey] || 0), 1);
    return (
        <div className="admin-chart-outer">
            <div className="admin-chart-bars">
                {data.map((d, i) => (
                    <div key={i} className="admin-chart-bar-col">
                        <span className="admin-chart-bar-value">{d[valueKey]}</span>
                        <div
                            className="admin-chart-bar"
                            style={{
                                height: `${Math.max(4, (d[valueKey] / max) * 100)}%`,
                                background: color,
                            }}
                        />
                        <span className="admin-chart-bar-label">{d[labelKey]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminAnalyticsPage() {
    const [growth, setGrowth] = useState<GrowthData | null>(null);
    const [engagement, setEngagement] = useState<EngagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [gRes, eRes] = await Promise.all([
                getAnalyticsGrowth(),
                getAnalyticsEngagement(),
            ]);
            setGrowth(gRes.data);
            setEngagement(eRes.data);
        } catch (e: any) {
            setError(e.message || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Summary stats from growth data
    const totalNewUsers = growth?.userGrowth?.reduce((s, d) => s + d.count, 0) ?? 0;
    const totalNewPosts = growth?.postGrowth?.reduce((s, d) => s + d.count, 0) ?? 0;
    const peakUserWeek = growth?.userGrowth?.reduce((best, d) => (!best || d.count > best.count ? d : best), null as any);
    const peakPostWeek = growth?.postGrowth?.reduce((best, d) => (!best || d.count > best.count ? d : best), null as any);

    const totalUpvotes = engagement?.weeklyEngagement?.reduce((s, d) => s + d.upvotes, 0) ?? 0;
    const totalDownvotes = engagement?.weeklyEngagement?.reduce((s, d) => s + d.downvotes, 0) ?? 0;
    const approvalRate = totalUpvotes + totalDownvotes === 0 ? 0 : Math.round((totalUpvotes / (totalUpvotes + totalDownvotes)) * 100);
    const avgPostsPerWeek = engagement?.weeklyEngagement?.length
        ? Math.round(engagement.weeklyEngagement.reduce((s, d) => s + d.posts, 0) / engagement.weeklyEngagement.length)
        : 0;

    const growthMax = Math.max(
        ...(growth?.userGrowth?.map((d) => d.count) ?? [0]),
        ...(growth?.postGrowth?.map((d) => d.count) ?? [0]),
        1
    );

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">insights</span>
                    <div>
                        <h1 className="admin-panel__title">Analytics Center</h1>
                        <p className="admin-panel__subtitle">Growth patterns and time-series engagement trends</p>
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
                        Analyzing database telemetry…
                    </span>
                </div>
            )}

            {!loading && (
                <div className="admin-bento">
                    {/* Bento Highlights (6 cards, each bc-2) */}
                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary)" }}>person_add</span>
                            New Users
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md">{totalNewUsers}</div>
                        <div className="bento-kpi__sub">Last 12 weeks registrations</div>
                    </div>

                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#2e7d32" }}>feed</span>
                            New Posts
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md">{totalNewPosts}</div>
                        <div className="bento-kpi__sub">Last 12 weeks submissions</div>
                    </div>

                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#1565c0" }}>trending_up</span>
                            Peak User Week
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md" style={{ fontSize: 18, fontWeight: 800 }}>
                            {peakUserWeek ? `${peakUserWeek.count} users` : "—"}
                        </div>
                        <div className="bento-kpi__sub">{peakUserWeek ? `Week of ${peakUserWeek.weekStart}` : "No data"}</div>
                    </div>

                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#00695c" }}>thumb_up</span>
                            Content Approval
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md">{approvalRate}%</div>
                        <div className="bento-kpi__sub">Ratio of upvotes to downvotes</div>
                    </div>

                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-secondary)" }}>bar_chart</span>
                            Velocity
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md">{avgPostsPerWeek} / wk</div>
                        <div className="bento-kpi__sub">Average posts published weekly</div>
                    </div>

                    <div className="bento-card bc-2">
                        <div className="bento-kpi__eyebrow">
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#e65100" }}>workspace_premium</span>
                            Peak Post Week
                        </div>
                        <div className="bento-kpi__value bento-kpi__value--md" style={{ fontSize: 18, fontWeight: 800 }}>
                            {peakPostWeek ? `${peakPostWeek.count} posts` : "—"}
                        </div>
                        <div className="bento-kpi__sub">{peakPostWeek ? `Week of ${peakPostWeek.weekStart}` : "No data"}</div>
                    </div>

                    {/* User Growth Chart (Bento span 3) */}
                    <div className="bento-card bc-3">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">person_add</span>
                            User Growth — 12 Wks
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Weekly new user registrations</p>
                        <BarChart
                            data={growth?.userGrowth ?? []}
                            labelKey="weekStart"
                            valueKey="count"
                            color="var(--color-primary)"
                            maxOverride={growthMax}
                        />
                    </div>

                    {/* Post Growth Chart (Bento span 3) */}
                    <div className="bento-card bc-3">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">feed</span>
                            Post Volume — 12 Wks
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Weekly new post submissions</p>
                        <BarChart
                            data={growth?.postGrowth ?? []}
                            labelKey="weekStart"
                            valueKey="count"
                            color="#2e7d32"
                            maxOverride={growthMax}
                        />
                    </div>

                    {/* Upvote & Downvote Side-by-Side (Bento spans) */}
                    <div className="bento-card bc-3">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">favorite_border</span>
                            Upvote Activity
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Positive engagements per week</p>
                        <BarChart
                            data={engagement?.weeklyEngagement ?? []}
                            labelKey="label"
                            valueKey="upvotes"
                            color="var(--color-primary)"
                        />
                    </div>

                    <div className="bento-card bc-3">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">heart_broken</span>
                            Downvote Activity
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Negative engagements per week</p>
                        <BarChart
                            data={engagement?.weeklyEngagement ?? []}
                            labelKey="label"
                            valueKey="downvotes"
                            color="var(--color-tertiary)"
                        />
                    </div>

                    {/* Most Bookmarked Table (Bento bc-6) */}
                    <div className="bento-card bc-6">
                        <h3 className="bento-card__title">
                            <span className="material-symbols-outlined">collections_bookmark</span>
                            Most Bookmarked Trails
                        </h3>
                        <p className="bento-card__sub" style={{ marginTop: -8 }}>Posts saved the most by trail seekers</p>
                        <div className="admin-table-wrap" style={{ marginTop: 8 }}>
                            {engagement?.mostSavedPosts?.length ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Post Title</th>
                                            <th>Author</th>
                                            <th>Bookmarks</th>
                                            <th>Upvotes</th>
                                            <th>Downvotes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {engagement.mostSavedPosts.map((post, i) => (
                                            <tr key={post._id}>
                                                <td><span className="admin-contrib-rank">{i + 1}</span></td>
                                                <td><span className="admin-posts-title">{post.title}</span></td>
                                                <td>@{post.author.username}</td>
                                                <td>
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bookmark</span>
                                                        {post.savedCount}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>favorite_border</span>
                                                        {post.upvoteCount}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="admin-contrib-stat">
                                                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>heart_broken</span>
                                                        {post.downvoteCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="admin-chart-empty">No bookmarked posts yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
