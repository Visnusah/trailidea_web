"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

/* ── Dummy Nepali profile data ── */
const PROFILE_TRAILS = [
  {
    id: 1,
    type: "Recent Log",
    title: "Annapurna Base Camp",
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80",
    difficulty: "Hard",
    distance: "12.4 miles",
    description:
      "The climb was intense but the inversion layer at the summit made every step worth it. Spent 4 hours capturing the light as it hit the surrounding peaks.",
    time: "2 days ago",
  },
  {
    id: 2,
    type: "Saved Trail",
    title: "Poon Hill Sunrise",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    time: "4h 30m",
    elevation: "1,200ft",
  },
  {
    id: 3,
    type: "Recent Review",
    title: "Mardi Himal Trek",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80",
    rating: 4,
  },
];

const TABS = ["Recent Logs", "Saved Trails", "Photos", "Reviews"];

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = () => {
    if (user?.imageUrl) return user.imageUrl;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || "explorer"}`;
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
    } catch (err) {
      console.error("Failed to upload:", err);
    } finally {
      setImgLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Explorer";

  return (
    <>
      {/* Cover Photo */}
      <div
        className="profile-cover"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80)",
        }}
      />

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header__top">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <img src={getAvatarUrl()} alt={displayName} className="profile-avatar" />
            <button
              className="profile-avatar-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={imgLoading}
              aria-label="Upload profile picture"
            >
              {imgLoading ? (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16, animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  photo_camera
                </span>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePicChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          {/* Info */}
          <div className="profile-header__info">
            <div className="profile-header__name-row">
              <h1 className="profile-header__name">{displayName}</h1>
              <span className="trust-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  verified
                </span>
                Trust Score: 98
              </span>
            </div>
            <p className="profile-header__bio">
              Alpine photographer and long-distance trekker. Exploring the hidden corners of Nepal one trail at a time. Leave no trace, only memories.
            </p>
          </div>

          {/* Actions */}
          <div className="profile-header__actions">
            <Link href="/dashboard/settings" className="profile-settings-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                settings
              </span>
              Settings
            </Link>
            <button className="profile-follow-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                person_add
              </span>
              Follow
            </button>
            <button
              onClick={logout}
              className="profile-settings-btn"
              style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                logout
              </span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content Grid */}
      <div className="profile-content">
        {/* ═══ Left Sidebar ═══ */}
        <aside>
          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat__value">142</div>
              <div className="profile-stat__label">Trails</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__value">2.8k</div>
              <div className="profile-stat__label">Followers</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__value">563</div>
              <div className="profile-stat__label">Photos</div>
            </div>
          </div>

          {/* About */}
          <div className="about-card">
            <h4>About Explorer</h4>
            <div className="about-card__item">
              <span className="material-symbols-outlined">location_on</span>
              Kathmandu, Nepal
            </div>
            <div className="about-card__item">
              <span className="material-symbols-outlined">calendar_month</span>
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "2024"}
            </div>
            <div className="about-card__item">
              <span className="material-symbols-outlined">hiking</span>
              Expert • 1,240 Miles
            </div>

            <p className="about-card__terrain-label">Preferred Terrain</p>
            <div className="terrain-tags">
              <span className="terrain-tag terrain-tag--alpine">High Alpine</span>
              <span className="terrain-tag terrain-tag--forest">Forest</span>
              <span className="terrain-tag terrain-tag--ridge">Ridge Walk</span>
              <span className="terrain-tag terrain-tag--glacier">Glacier</span>
            </div>
          </div>
        </aside>

        {/* ═══ Main Content — Tabs ═══ */}
        <section>
          <div className="profile-tabs">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`profile-tab ${i === activeTab ? "profile-tab--active" : ""}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="profile-trails-grid">
            {activeTab === 0 && (
              <>
                {/* Featured Log */}
                <div className="trail-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="trail-card__image-wrap">
                    <img
                      src={PROFILE_TRAILS[0].image}
                      alt={PROFILE_TRAILS[0].title}
                      className="trail-card__image"
                    />
                    <div className="trail-card__badges">
                      <span className="trail-badge trail-badge--difficulty">
                        {PROFILE_TRAILS[0].difficulty} • {PROFILE_TRAILS[0].distance}
                      </span>
                    </div>
                  </div>
                  <div className="trail-card__body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <h3 className="trail-card__title">{PROFILE_TRAILS[0].title}</h3>
                        <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", lineHeight: 1.6, marginTop: 8 }}>
                          {PROFILE_TRAILS[0].description}
                        </p>
                      </div>
                      <span style={{ fontSize: 13, color: "var(--color-outline)", whiteSpace: "nowrap", marginLeft: 16 }}>
                        {PROFILE_TRAILS[0].time}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>+12</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                        Read Log
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Saved / Other cards */}
            {activeTab === 1 && (
              <div className="profile-trail-card">
                <img
                  src={PROFILE_TRAILS[1].image}
                  alt={PROFILE_TRAILS[1].title}
                  className="profile-trail-card__img"
                />
                <div className="profile-trail-card__body">
                  <p className="profile-trail-card__type">Saved Trail</p>
                  <h4 className="profile-trail-card__name">{PROFILE_TRAILS[1].title}</h4>
                  <div className="profile-trail-card__meta">
                    <span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                      {PROFILE_TRAILS[1].time}
                    </span>
                    <span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
                      {PROFILE_TRAILS[1].elevation}
                    </span>
                  </div>
                  <button className="profile-trail-card__btn">View Details</button>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "var(--color-outline)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: "block" }}>photo_library</span>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Trail photos coming soon</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Upload photos from your latest adventures.</p>
              </div>
            )}

            {activeTab === 3 && (
              <div className="profile-trail-card">
                <img
                  src={PROFILE_TRAILS[2].image}
                  alt={PROFILE_TRAILS[2].title}
                  className="profile-trail-card__img"
                />
                <div className="profile-trail-card__body">
                  <p className="profile-trail-card__type">Recent Review</p>
                  <h4 className="profile-trail-card__name">{PROFILE_TRAILS[2].title}</h4>
                  <div className="profile-trail-card__stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 20,
                          color: s <= (PROFILE_TRAILS[2].rating || 0) ? "var(--color-gold)" : "var(--color-outline-variant)",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <button className="profile-trail-card__btn">Read Review</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
