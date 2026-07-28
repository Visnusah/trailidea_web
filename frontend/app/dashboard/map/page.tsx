"use client";

import { useEffect, useState } from "react";
import { getFeed, PostRecord } from "@/lib/api/posts";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamically import the map to avoid SSR issues
const GlobalMap = dynamic(() => import("./GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="map-page__loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, animation: "spin 1s linear infinite", color: "var(--color-primary)" }}>
        progress_activity
      </span>
      <p style={{ marginTop: '16px', color: 'var(--color-on-surface-variant)' }}>Loading global map...</p>
    </div>
  ),
});

export default function MapPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        // Fetch a larger limit for the map view
        const response = await getFeed({ page: 1, limit: 100 });
        // Only keep posts that have valid mapData coordinates
        const postsWithLocation = response.data.filter(
          (p) => p.mapData && p.mapData.coordinates && p.mapData.coordinates.length === 2
        );
        setPosts(postsWithLocation);
      } catch (error: any) {
        toast.error(error.message || "Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <div className="map-page" style={{ display: "flex", flexDirection: "column" }}>
      <div className="map-page__header" style={{ marginBottom: "16px" }}>
        <h1 className="text-headline-xl">Global Trails Map</h1>
        <p className="text-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
          Explore treks and trails shared by the community around the world.
        </p>
      </div>

      <div className="map-page__content" style={{ flex: 1, borderRadius: "16px", overflow: "hidden", border: "1px solid var(--color-outline-variant)", position: "relative" }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--color-surface-container-low)' }}>
             <span className="material-symbols-outlined" style={{ fontSize: 48, animation: "spin 1s linear infinite", color: "var(--color-primary)" }}>
              progress_activity
            </span>
          </div>
        ) : (
          <GlobalMap posts={posts} />
        )}
      </div>
    </div>
  );
}
