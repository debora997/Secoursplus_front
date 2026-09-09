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
import { Crosshair, Flame } from "lucide-react";
import { EmergencyAlert } from "@/types/alert";

// =========================================================
// ICÔNE PERSONNALISÉE SELON LE STATUT
// =========================================================
const createCustomIcon = (status: EmergencyAlert["status"]) => {
  const color =
    status === "nouvelle"
      ? "#dc2626" // 🔴 Nouvelle
      : "#f59e0b"; // 🟠 En cours

      // Corrige le problème de chemin d'images par défaut Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 12px ${color}99;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background-color: white;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// =========================================================
// RECENTRAGE DYNAMIQUE DE LA CARTE
// =========================================================
function RecenterMap({
  coords,
}: {
  coords: [number, number];
}) {
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
  const [center, setCenter] =
    useState<[number, number]>(defaultCenter);

  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null);

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
          console.error(
            "Erreur de géolocalisation :",
            error
          );
        }
      );
    }
  };

  // =========================================================
  // IMPORTANT :
  // ON GARDE UNIQUEMENT LES ALERTES NOUVELLES ET EN COURS
  // =========================================================
  const visibleAlerts = alerts.filter(
    (alert) =>
      alert.status === "nouvelle" ||
      alert.status === "encours"
  );

  return (
    <div className="sticky top-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
            <Flame className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Carte des interventions
            </h3>

            <p className="text-[10px] text-slate-500">
              Alertes en temps réel
            </p>
          </div>
        </div>

        <button
          onClick={handleGeolocate}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100"
        >
          <span>Ma position</span>
          <Crosshair className="h-3 w-3" />
        </button>
      </div>

      {/* =====================================================
          CARTE
      ===================================================== */}
      <div className="relative h-[350px] w-full z-0">

        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >

          {/* OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap coords={center} />

          {/* =================================================
              MARQUEURS DES ALERTES VISIBLES
          ================================================= */}
          {visibleAlerts.map((alert) => {

            // Coordonnées GPS
            const lat =
              (alert as any).latitude ??
              defaultCenter[0];

            const lng =
              (alert as any).longitude ??
              defaultCenter[1];

            return (
              <Marker
                key={alert.id}
                position={[lat, lng]}
                icon={createCustomIcon(alert.status)}
                eventHandlers={{
                  click: () =>
                    onSelectAlert(alert.id),
                }}
              >
                <Popup>
                  <div className="min-w-[170px] p-1 font-sans text-xs">

                    {/* ID + TYPE */}
                    <p className="font-bold text-slate-900">
                      #{alert.id} —{" "}
                      {alert.type}
                    </p>

                    {/* STATUT */}
                    <div className="mt-2">
                      {alert.status === "nouvelle" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                          Nouvelle alerte
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          Intervention en cours
                        </span>
                      )}
                    </div>

                    {/* LOCALISATION */}
                    <p className="mt-2 text-slate-600">
                      {alert.location || "Position GPS"}
                    </p>

                    {/* BOUTON */}
                    <button
                      onClick={() =>
                        onSelectAlert(alert.id)
                      }
                      className="mt-3 w-full rounded-lg bg-slate-900 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-slate-800"
                    >
                      Voir le dossier
                    </button>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        {/* Marqueur de la position du casernement/poste */}
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

        {/* ===================================================
            LÉGENDE DE LA CARTE
        =================================================== */}
        <div className="absolute right-3 top-3 z-[400] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">

          <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-500">
            Statut des interventions
          </p>

          <div className="space-y-1.5">

            {/* Nouvelle */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow-sm" />
              <span className="text-[10px] font-semibold text-slate-700">
                Nouvelle
              </span>
            </div>

            {/* En cours */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow-sm" />
              <span className="text-[10px] font-semibold text-slate-700">
                En cours
              </span>
            </div>

          </div>
        </div>

        {/* ===================================================
            PETIT INDICATEUR DU NOMBRE D'ALERTES
        =================================================== */}
        {visibleAlerts.length > 0 && (
          <div className="absolute bottom-3 left-3 z-[400] rounded-lg bg-slate-900/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
            {visibleAlerts.length}{" "}
            {visibleAlerts.length > 1
              ? "interventions actives"
              : "intervention active"}
          </div>
        )}

      </div>
    </div>
  );
}