import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface FireDepartmentGeocodingMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  showMarker?: boolean;
}

const FireDepartmentGeocodingMap: React.FC<FireDepartmentGeocodingMapProps> = ({
  latitude,
  longitude,
  zoom = 6,
  showMarker = false,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const geocodedMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!mapRef.current) {
        mapRef.current = L.map("fireDepartmentGeocodingMap").setView(
          [latitude, longitude],
          zoom
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          mapRef.current
        );
      }

      if (showMarker) {
        if (geocodedMarkerRef.current) {
          geocodedMarkerRef.current.remove();
          geocodedMarkerRef.current = null;
        }

        const geocodedMarker = L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: "/fire-truck-mark-available.png",
            iconSize: [36, 48],
            iconAnchor: [18, 48],
          }),
        }).addTo(mapRef.current);

        mapRef.current.setView([latitude, longitude], zoom);

        geocodedMarkerRef.current = geocodedMarker;
      }
    }
  });

  return (
    <div
      id="fireDepartmentGeocodingMap"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default FireDepartmentGeocodingMap;
