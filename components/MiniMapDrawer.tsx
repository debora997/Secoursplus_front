"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const redMarkerIcon = L.divIcon({
  className: "custom-leaflet-drawer-marker",
  html: `
    <div style="
      background-color: #dc2626;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 12px rgba(220,38,38,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function RecenterMiniMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 15);
  }, [coords, map]);
  return null;
}

export default function MiniMapDrawer({ coords }: { coords: [number, number] }) {
  return (
    <div className="h-40 w-full z-0">
      <MapContainer
        center={coords}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMiniMap coords={coords} />
        <Marker position={coords} icon={redMarkerIcon} />
      </MapContainer>
    </div>
  );
}