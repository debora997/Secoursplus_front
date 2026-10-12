"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Crosshair, ExternalLink } from "lucide-react";
import { EmergencyAlert } from "@/types/alert";

// Fix pour les chemins d'images d'icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =========================================================
// ICÔNE PERSONNALISÉE SELON LE STATUT
// =========================================================
const createCustomIcon = (status: EmergencyAlert["status"]) => {
  const isNew = status === "nouvelle";
  const color = isNew ? "#dc2626" : "#f59e0b"; // 🔴 Rouge pour Nouvelle, 🟠 Orange pour En cours

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        position: relative;
        background-color: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px ${color}bb;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${
          isNew
            ? `<div style="
                position: absolute;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: ${color};
                opacity: 0.5;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ""
        }
        <div style="
          position: relative;
          z-index: 10;
          background-color: white;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

// =========================================================
// RECENTRAGE DYNAMIQUE DE LA CARTE
// =========================================================
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);

  return null;
}

// =========================================================
// PROPS
// =========================================================
interface RealLiveMapProps {
  alerts: EmergencyAlert[];
  onSelectAlert: (id: number) => void;
  defaultCenter?: [number, number];
}

// =========================================================
// COMPOSANT PRINCIPAL
// =========================================================
export default function RealLiveMap({
  alerts,
  onSelectAlert,
  defaultCenter = [12.6392, -8.0029],
}: RealLiveMapProps) {
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // =========================================================
  // GÉOLOCALISATION DU POSTE
  // =========================================================
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

  // =========================================================
  // ALERTES VISIBLES AVEC COORDONNÉES VALIDES (NOUVELLES & EN COURS)
  // =========================================================
  const visibleAlerts = alerts.filter(
    (alert) =>
      (alert.status === "nouvelle" || alert.status === "encours") &&
      alert.latitude != null &&
      alert.longitude != null &&
      !isNaN(Number(alert.latitude)) &&
      !isNaN(Number(alert.longitude))
  );

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm z-0">
      
      {/* BOUTON MA POSITION EN SUPERPOSITION */}
      <button
        onClick={handleGeolocate}
        className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95"
      >
        <span>Ma position</span>
        <Crosshair className="h-3.5 w-3.5 text-red-600" />
      </button>

      {/* LÉGENDE STATUT */}
      <div className="absolute right-3 top-3 z-[400] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
          Statut des interventions
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow-sm" />
            <span className="text-[10px] font-semibold text-slate-700">
              Nouvelle alerte
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow-sm" />
            <span className="text-[10px] font-semibold text-slate-700">
              En cours
            </span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap coords={center} />

        {/* MARQUEURS DES ALERTES */}
        {visibleAlerts.map((alert) => {
          const lat = Number(alert.latitude);
          const lng = Number(alert.longitude);
          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          return (
            <Marker
              key={alert.id}
              position={[lat, lng]}
              icon={createCustomIcon(alert.status)}
              eventHandlers={{
                click: () => onSelectAlert(alert.id),
              }}
            >
              <Popup>
                <div className="min-w-[180px] p-1 font-sans text-xs">
                  <p className="font-bold text-slate-900">
                    #{alert.id} — <span className="capitalize">{alert.type}</span>
                  </p>

                  <div className="mt-2">
                    {alert.status === "nouvelle" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Nouvelle alerte
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Intervention en cours
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-slate-600">
                    {alert.location || "Position GPS"}
                  </p>

                  {/* BOUTON LIENT GOOGLE MAPS */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {/* BOUTON VOIR LE DOSSIER */}
                  <button
                    onClick={() => onSelectAlert(alert.id)}
                    className="mt-1.5 w-full rounded-lg bg-slate-900 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-slate-800"
                  >
                    Voir le dossier
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* MARQUEUR DE GéOLOCALISATION DU POSTE */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "custom-user-marker",
              html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px #2563eb;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>Votre position actuelle</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* COMPTEUR D'ALERTES ACTIVES */}
      {visibleAlerts.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[400] rounded-lg bg-slate-900/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
          {visibleAlerts.length}{" "}
          {visibleAlerts.length > 1
            ? "interventions actives"
            : "intervention active"}
        </div>
      )}
    </div>
  );
}