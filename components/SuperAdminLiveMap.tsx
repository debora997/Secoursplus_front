"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, ShieldAlert } from "lucide-react";

// Icônes personnalisées
const createCustomIcon = (color: string, iconHtml: string) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${iconHtml}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

const caserneIcon = createCustomIcon(
  "#2563eb", 
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`
);

const alerteUrgentIcon = createCustomIcon(
  "#ef4444", 
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
);

const alerteEncoursIcon = createCustomIcon(
  "#f59e0b", 
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
);

const INITIAL_CASERNES = [
  { id: 1, nom: "Caserne Centrale Alpha", lat: 12.6392, lng: -8.0029, chefs: "Capt. Touré", pompiers: 24, vehicules: 6 },
  { id: 2, nom: "Caserne Sud Rivage", lat: 12.6150, lng: -7.9850, chefs: "Lt. Coulibaly", pompiers: 18, vehicules: 4 },
  { id: 3, nom: "Poste Avancé Nord", lat: 12.6600, lng: -8.0200, chefs: "Sgt. Diarra", pompiers: 12, vehicules: 2 },
];

const INITIAL_ALERTES = [
  { id: 101, type: "Incendie Commercial", adresse: "Marché Central", lat: 12.6450, lng: -7.9980, statut: "URGENT", citoyen: "Moussa Keita", heure: "Il y a 5 min" },
  { id: 102, type: "Accident de la Route", adresse: "Pont Fahd", lat: 12.6280, lng: -8.0050, statut: "EN_COURS", citoyen: "Awa Sidibé", heure: "Il y a 14 min" },
  { id: 103, type: "Fuite de Gaz", adresse: "Quartier du Fleuve", lat: 12.6310, lng: -7.9910, statut: "URGENT", citoyen: "Oumar Traoré", heure: "Il y a 22 min" },
];

export default function LiveMapClient() {
  const [casernes] = useState(INITIAL_CASERNES);
  const [alertes] = useState(INITIAL_ALERTES);
  const [filter, setFilter] = useState<"ALL" | "CASERNES" | "ALERTES">("ALL");

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-2xl border border-gray-800 bg-[#14171d] shadow-2xl">
      
      {/* Filtres de la carte */}
      <div className="absolute left-4 top-4 z-[1000] flex flex-wrap items-center gap-2 rounded-xl border border-gray-800 bg-[#14171d]/90 p-2 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filter === "ALL" ? "bg-red-500 text-white" : "bg-gray-800/80 text-gray-400 hover:text-white"
          }`}
        >
          Tout afficher ({casernes.length + alertes.length})
        </button>
        <button
          onClick={() => setFilter("CASERNES")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filter === "CASERNES" ? "bg-blue-600 text-white" : "bg-gray-800/80 text-gray-400 hover:text-white"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Casernes ({casernes.length})
        </button>
        <button
          onClick={() => setFilter("ALERTES")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filter === "ALERTES" ? "bg-red-600 text-white" : "bg-gray-800/80 text-gray-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Alertes actives ({alertes.length})
        </button>
      </div>

      {/* Carte Leaflet */}
      <MapContainer
        center={[12.6392, -8.0029]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        {/* TILELAYER SANS FILIGRANE NI CLÉ API */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* Marqueurs des Casernes */}
        {(filter === "ALL" || filter === "CASERNES") &&
          casernes.map((c) => (
            <Marker key={`caserne-${c.id}`} position={[c.lat, c.lng]} icon={caserneIcon}>
              <Popup>
                <div className="p-1 space-y-1 text-gray-900">
                  <h4 className="font-bold text-sm">{c.nom}</h4>
                  <p className="text-xs">Responsable : {c.chefs}</p>
                  <p className="text-xs">Pompiers : {c.pompiers}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Marqueurs des Alertes */}
        {(filter === "ALL" || filter === "ALERTES") &&
          alertes.map((a) => (
            <div key={`alerte-${a.id}`}>
              <CircleMarker
                center={[a.lat, a.lng]}
                radius={24}
                pathOptions={{
                  color: a.statut === "URGENT" ? "#ef4444" : "#f59e0b",
                  fillColor: a.statut === "URGENT" ? "#ef4444" : "#f59e0b",
                  fillOpacity: 0.2,
                }}
              />
              <Marker
                position={[a.lat, a.lng]}
                icon={a.statut === "URGENT" ? alerteUrgentIcon : alerteEncoursIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-gray-900">
                    <h4 className="font-bold text-sm text-red-600">{a.type}</h4>
                    <p className="text-xs">Lieu : {a.adresse}</p>
                    <p className="text-xs">Signalé par : {a.citoyen}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
      </MapContainer>
    </div>
  );
}