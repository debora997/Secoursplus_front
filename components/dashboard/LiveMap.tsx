"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Maximize2, Crosshair, Flame, MapPin } from "lucide-react";
import { EmergencyAlert } from "@/types/alert";

// Icône personnalisée Pompiers / Urgence pour Leaflet
const createCustomIcon = (status: string) => {
  const color =
    status === "nouvelle"
      ? "#dc2626" // Rouge pour nouvelle alerte
      : status === "encours"
      ? "#f59e0b" // Orange pour en cours
      : "#10b981"; // Vert pour terminée

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.4);
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
};

// Composant interne pour recentrer la carte dynamiquement
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

interface RealLiveMapProps {
  alerts: EmergencyAlert[];
  onSelectAlert: (id: number) => void;
  // Position par défaut (Ex: Bamako)
  defaultCenter?: [number, number];
}

export default function RealLiveMap({
  alerts,
  onSelectAlert,
  defaultCenter = [12.6392, -8.0029],
}: RealLiveMapProps) {
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Géolocalisation réelle du poste / utilisateur
  const handleGeolocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(newCoords);
          setCenter(newCoords);
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
        }
      );
    }
  };

  return (
    <div className="sticky top-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Carte Réelle GPS</h3>
            <p className="text-[10px] text-slate-500">OpenStreetMap Live</p>
          </div>
        </div>

        <button
          onClick={handleGeolocate}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors"
        >
          <span>Ma position</span>
          <Crosshair className="h-3 w-3" />
        </button>
      </div>

      {/* Cadre de la Carte Leaflet */}
      <div className="h-[350px] w-full z-0">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Fond de carte OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap coords={center} />

          {/* Marqueurs d'Alertes Reçues */}
          {alerts.map((a) => {
            // Vérifie qu'on a bien des coordonnées GPS réelles
            const lat = (a as any).latitude ?? defaultCenter[0];
            const lng = (a as any).longitude ?? defaultCenter[1];

            return (
              <Marker
                key={a.id}
                position={[lat, lng]}
                icon={createCustomIcon(a.status)}
                eventHandlers={{
                  click: () => onSelectAlert(a.id),
                }}
              >
                <Popup>
                  <div className="text-xs font-sans p-1">
                    <p className="font-bold text-slate-900">#{a.id} - {a.type}</p>
                    <p className="text-slate-600 mt-1">{a.location}</p>
                    <button
                      onClick={() => onSelectAlert(a.id)}
                      className="mt-2 w-full rounded bg-red-600 py-1 text-[10px] font-bold text-white"
                    >
                      Voir dossier
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}