"use client";

import { useState } from "react";

/* ── Nepali Trekking Dummy Data ── */
const TRAIL_FEED = [
  {
    id: 1,
    title: "Annapurna Base Camp Trek",
    location: "Annapurna Region, Nepal",
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80",
    distance: "7.2 miles",
    time: "4h 15m",
    elevation: "1,240 ft",
    rating: 4.8,
    verified: true,
    author: { name: "Aarav Gurung", initials: "AG", role: "Lead Explorer" },
  },
  {
    id: 2,
    title: "Poon Hill Sunrise Trail",
    location: "Ghorepani, Myagdi",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    distance: "5.4 miles",
    time: "2h 45m",
    elevation: "450 ft",
    rating: 4.5,
    verified: true,
    author: { name: "Sita Rai", initials: "SR", role: "Pathfinder" },
  },
  {
    id: 3,
    title: "Langtang Valley Trek",
    location: "Langtang National Park, Nepal",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    distance: "9.1 miles",
    time: "5h 30m",
    elevation: "2,100 ft",
    rating: 4.7,
    verified: false,
    difficulty: "Hard",
    author: { name: "Bikram Tamang", initials: "BT", role: "Mountain Guide" },
  },
];

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

export default function FeedPage() {
  const [difficulty, setDifficulty] = useState<string[]>(["Easy", "Moderate"]);
  const [lengthVal, setLengthVal] = useState(25);
  const [rating, setRating] = useState("4.5");

  const toggleDifficulty = (d: string) => {
    setDifficulty((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="feed-grid">
      {/* ═══ LEFT SIDEBAR — Filters ═══ */}
      <aside className="feed-sidebar-left">
        <div className="filter-card">
          <h3>Filters</h3>

          {/* Difficulty */}
          <div className="filter-section">
            <span className="filter-section__label">Difficulty</span>
            <div className="filter-pills">
              {["Easy", "Moderate", "Hard"].map((d) => (
                <button
                  key={d}
                  className={`filter-pill ${difficulty.includes(d) ? "filter-pill--active" : ""}`}
                  onClick={() => toggleDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="filter-section">
            <span className="filter-section__label">Length (Miles)</span>
            <input
              type="range"
              min={0}
              max={50}
              value={lengthVal}
              onChange={(e) => setLengthVal(Number(e.target.value))}
              className="filter-range"
            />
            <div className="filter-range-labels">
              <span>0</span>
              <span>50+</span>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-section">
            <span className="filter-section__label">Rating</span>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={rating === "4.5"}
                onChange={() => setRating("4.5")}
              />
              4.5+ Stars
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={rating === "4.0"}
                onChange={() => setRating("4.0")}
              />
              4.0+ Stars
            </label>
          </div>

          <button className="filter-reset-btn">Reset All Filters</button>
        </div>

        {/* Promo Card */}
        <div className="promo-card">
          <h4>Explorer Pro</h4>
          <p>Unlock offline maps and exclusive trail guides.</p>
          <button className="promo-card__btn">Go Premium</button>
        </div>
      </aside>

      {/* ═══ CENTER — Feed ═══ */}
      <section>
        <div className="feed-header">
          <h2>Global Feed</h2>
          <button className="feed-sort-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              tune
            </span>
            Latest
          </button>
        </div>

        {TRAIL_FEED.map((trail) => (
          <article key={trail.id} className="trail-card">
            <div className="trail-card__image-wrap">
              <img src={trail.image} alt={trail.title} className="trail-card__image" />
              <div className="trail-card__badges">
                {trail.verified && (
                  <span className="trail-badge trail-badge--verified">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      verified
                    </span>
                    Verified
                  </span>
                )}
                <span className="trail-badge trail-badge--rating">{trail.rating}</span>
                {trail.difficulty && (
                  <span className="trail-badge trail-badge--difficulty">{trail.difficulty}</span>
                )}
              </div>
              <button className="trail-card__bookmark" aria-label="Bookmark trail">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  bookmark
                </span>
              </button>
            </div>

            <div className="trail-card__body">
              <h3 className="trail-card__title">{trail.title}</h3>
              <p className="trail-card__location">{trail.location}</p>

              <div className="trail-card__stats">
                <span className="trail-stat">
                  <span className="material-symbols-outlined">hiking</span>
                  {trail.distance}
                </span>
                <span className="trail-stat">
                  <span className="material-symbols-outlined">schedule</span>
                  {trail.time}
                </span>
                <span className="trail-stat">
                  <span className="material-symbols-outlined">trending_up</span>
                  {trail.elevation}
                </span>
              </div>

              <div className="trail-card__author">
                <div className="trail-card__author-avatar">{trail.author.initials}</div>
                <div className="trail-card__author-info">
                  <div className="trail-card__author-name">{trail.author.name}</div>
                  <div className="trail-card__author-role">{trail.author.role}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
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
  );
}