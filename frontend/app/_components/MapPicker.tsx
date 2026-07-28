"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaflet map to avoid SSR issues
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="map-picker__loading">
      <span className="material-symbols-outlined" style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>
        progress_activity
      </span>
      <p>Loading map...</p>
    </div>
  ),
});

interface MapPickerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  onPlaceNameChange?: (name: string) => void;
}

export default function MapPicker({ position, onPositionChange, onPlaceNameChange }: MapPickerProps) {
  return (
    <div className="map-picker__container">
      <MapPickerInner position={position} onPositionChange={onPositionChange} onPlaceNameChange={onPlaceNameChange} />
    </div>
  );
}
