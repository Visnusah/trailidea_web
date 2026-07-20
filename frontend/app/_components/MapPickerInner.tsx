"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with webpack/next.js
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

interface MapPickerInnerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  onPlaceNameChange?: (name: string) => void;
}

function MapClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function MapPickerInner({ position, onPositionChange, onPlaceNameChange }: MapPickerInnerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.length < 3) {
      setSearchResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: val, format: "json", limit: 5 },
          headers: { "Accept-Language": "en" }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Nominatim search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce
  };

  const handleSelectLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    onPositionChange(lat, lon);
    if (onPlaceNameChange) onPlaceNameChange(result.display_name);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onPositionChange(lat, lng);

          // Reverse geocoding
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
              params: { lat, lon: lng, format: "json" },
              headers: { "Accept-Language": "en" }
            });
            if (res.data && res.data.display_name) {
              if (onPlaceNameChange) onPlaceNameChange(res.data.display_name);
              setSearchQuery(res.data.display_name);
            }
          } catch (err) {
            console.error("Reverse geocoding error", err);
          }
        },
        (err) => console.error(err)
      );
    }
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Search Bar Overlay */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10, zIndex: 1000,
        display: "flex", flexDirection: "column", gap: "4px"
      }}>
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-outline)",
            background: "var(--color-surface)", color: "var(--color-on-surface)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)", fontSize: "14px", width: "100%"
          }}
        />
        {searchResults.length > 0 && (
          <ul style={{
            background: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-outline)",
            maxHeight: "150px", overflowY: "auto", padding: "0", margin: "0", listStyle: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            {searchResults.map((res) => (
              <li
                key={res.place_id}
                onClick={() => handleSelectLocation(res)}
                style={{
                  padding: "8px 12px", cursor: "pointer", fontSize: "13px",
                  borderBottom: "1px solid var(--color-outline-variant)"
                }}
              >
                {res.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* My Location Button Overlay */}
      <button
        type="button"
        onClick={handleMyLocation}
        style={{
          position: "absolute", bottom: 20, right: 10, zIndex: 1000,
          background: "var(--color-surface)", color: "var(--color-primary)",
          border: "1px solid var(--color-outline)", borderRadius: "50%",
          width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)", cursor: "pointer"
        }}
        title="My Location"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>my_location</span>
      </button>

      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapClickHandler onPositionChange={onPositionChange} />
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}
