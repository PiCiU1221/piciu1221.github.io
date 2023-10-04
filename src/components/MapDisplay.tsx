import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  showMarker?: boolean;
  fireDepartments: FireDepartment[];
  selectedFireDepartments: FireDepartment[];
  onMarkerClick: (department: FireDepartment | null) => void;
}

interface FireDepartment {
  departmentId: number;
  departmentName: string;
  departmentCity: string;
  departmentStreet: string;
  departmentLatitude: number;
  departmentLongitude: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  latitude,
  longitude,
  zoom = 6,
  showMarker = false,
  fireDepartments,
  selectedFireDepartments,
  onMarkerClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const geocodedMarkerRef = useRef<L.Marker | null>(null);
  const markers: Record<number, L.Marker> = {};

  const fireIcon = L.icon({
    iconUrl: "/fire-truck-mark-available.png",
    iconSize: [30, 44],
    iconAnchor: [15, 44],
  });

  const selectedFireIcon = L.icon({
    iconUrl: "/fire-truck-mark-selected.png",
    iconSize: [30, 44],
    iconAnchor: [15, 44],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!mapRef.current) {
        mapRef.current = L.map("map").setView([latitude, longitude], zoom);
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
            iconUrl: "/fire-icon-mark.png",
            iconSize: [36, 48],
            iconAnchor: [18, 48],
          }),
        }).addTo(mapRef.current);

        if (selectedFireDepartments.length === 0) {
          mapRef.current.setView([latitude, longitude], zoom);
        }

        geocodedMarker.on("click", () => {
          onMarkerClick(null);
        });

        geocodedMarkerRef.current = geocodedMarker;
      }

      if (fireDepartments.length > 0) {
        if (!markerGroupRef.current) {
          markerGroupRef.current = L.layerGroup().addTo(mapRef.current);
        } else {
          markerGroupRef.current.clearLayers();
        }

        fireDepartments.forEach((department) => {
          const {
            departmentId,
            departmentCity,
            departmentStreet,
            departmentLatitude,
            departmentLongitude,
          } = department;

          const isSelected = selectedFireDepartments.some(
            (selectedDep) => selectedDep.departmentId === departmentId
          );

          const marker = L.marker([departmentLatitude, departmentLongitude], {
            icon: isSelected ? selectedFireIcon : fireIcon,
          }).addTo(markerGroupRef.current!);

          marker.on("click", () => {
            onMarkerClick(department);
          });

          markers[departmentId] = marker;
        });
      }
    }
  }, [
    latitude,
    longitude,
    zoom,
    showMarker,
    fireDepartments,
    selectedFireDepartments,
    onMarkerClick,
  ]);

  useEffect(() => {
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    const selectedDepartment =
      selectedFireDepartments[selectedFireDepartments.length - 1];
    if (selectedDepartment && typeof window !== "undefined") {
      const marker = L.marker(
        [
          selectedDepartment.departmentLatitude,
          selectedDepartment.departmentLongitude,
        ],
        {
          icon: selectedFireIcon,
        }
      ).addTo(markerGroupRef.current!);

      marker.on("click", () => {
        onMarkerClick(selectedDepartment);
      });

      markers[selectedDepartment.departmentId] = marker;
      selectedMarkerRef.current = marker;
    }
  }, [selectedFireDepartments]);

  return <div id="map" style={{ width: "100%", height: "100%" }} />;
};

export default MapDisplay;
