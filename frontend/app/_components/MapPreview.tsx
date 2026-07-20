"use client";

import dynamic from "next/dynamic";

const MapPreviewInner = dynamic(() => import("./MapPreviewInner"), {
  ssr: false,
  loading: () => (
    <div className="map-picker__loading">
      <span className="material-symbols-outlined" style={{ fontSize: 24, animation: "spin 1s linear infinite" }}>
        progress_activity
      </span>
    </div>
  ),
});

interface MapPreviewProps {
  coordinates: [number, number]; // [lng, lat] from GeoJSON
  placeName?: string;
}

export default function MapPreview({ coordinates, placeName }: MapPreviewProps) {
  return (
    <div className="map-preview">
      <div className="map-preview__map">
        <MapPreviewInner coordinates={coordinates} />
      </div>
      {placeName && (
        <div className="map-preview__label">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
          {placeName}
        </div>
      )}
    </div>
  );
}
