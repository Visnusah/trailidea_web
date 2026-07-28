"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PostRecord } from "@/lib/api/posts";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface GlobalMapProps {
  posts: PostRecord[];
}

export default function GlobalMap({ posts }: GlobalMapProps) {
  // Default center: Nepal (28.3949, 84.1240) if no posts
  const defaultCenter: [number, number] = posts.length > 0 
    ? [posts[0].mapData.coordinates[1], posts[0].mapData.coordinates[0]] // first post location
    : [28.3949, 84.1240];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {posts.map((post) => {
        if (!post.mapData?.coordinates || post.mapData.coordinates.length !== 2) return null;
        
        // GeoJSON [lng, lat] -> Leaflet [lat, lng]
        const position: [number, number] = [post.mapData.coordinates[1], post.mapData.coordinates[0]];
        
        return (
          <Marker key={post._id} position={position}>
            <Popup className="custom-popup">
              <div style={{ padding: "4px", minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <img 
                    src={post.author.imageUrl ? `https://trailidea-web.onrender.com${post.author.imageUrl}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author.username}`} 
                    alt={post.author.username} 
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>{post.author.firstName} {post.author.lastName}</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
                
                <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold" }}>{post.title}</h3>
                {post.mapData.placeName && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#444", marginBottom: "8px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    {post.mapData.placeName}
                  </div>
                )}
                
                <Link 
                  href={`/dashboard/post/${post._id}`}
                  style={{ 
                    display: "block", 
                    textAlign: "center", 
                    background: "var(--color-primary)", 
                    color: "white", 
                    textDecoration: "none",
                    padding: "6px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginTop: "8px"
                  }}
                >
                  View Post
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
