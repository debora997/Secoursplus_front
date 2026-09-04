"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AlertDetailDrawer from "@/components/dashboard/AlertDetailDrawer";
import { connectWebSocket } from "@/services/websocket";
import { EmergencyAlert } from "@/types/alert";
import { RefreshCw, Layers } from "lucide-react";

// Importation dynamique de votre composant RealLiveMap (SSR désactivé pour Leaflet)
const RealLiveMap = dynamic(
  () => import("@/components/dashboard/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[700px] w-full items-center justify-center bg-slate-900 rounded-xl text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-red-600 mr-3" />
        <span className="text-sm font-medium">Chargement de la carte des interventions...</span>
      </div>
    ),
  }
);

const API_URL = "http://localhost:8080/api/alerts";

function isToday(dateString?: string): boolean {
  if (!dateString) return false;
  const alertDate = new Date(dateString);
  if (isNaN(alertDate.getTime())) return false;
  const today = new Date();
  return (
    alertDate.getDate() === today.getDate() &&
    alertDate.getMonth() === today.getMonth() &&
    alertDate.getFullYear() === today.getFullYear()
  );
}

export default function MapPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"toutes" | "nouvelle" | "encours">("toutes");
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  // Normalisation des alertes backend -> EmergencyAlert
  const formatAlert = useCallback((alert: any): EmergencyAlert => {
    let mappedStatus: EmergencyAlert["status"] = "nouvelle";
    if (alert.status === "RECEIVED") mappedStatus = "nouvelle";
    else if (["IN_PROGRESS", "ACCEPTED", "ENGAGED"].includes(alert.status)) mappedStatus = "encours";
    else if (["TERMINATED", "REJECTED", "REFUSED"].includes(alert.status)) mappedStatus = "terminee";

    return {
      id: alert.id,
      type: alert.type ? alert.type.toLowerCase() : "accident",
      status: mappedStatus,
      priority: alert.severity === "CRITICAL" || alert.severity === "GRAVE" ? "eleve" : "moyen",
      date: alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("fr-FR") : "",
      time: alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "",
      createdAt: alert.createdAt ?? new Date().toISOString(),
      location: "Position GPS",
      latitude: alert.latitude ?? null,
      longitude: alert.longitude ?? null,
      position: { x: 50, y: 50 },
      description: alert.description ?? "",
      reporterName: alert.citoyenNom ?? "Citoyen",
      reporterPhone: alert.citoyenTelephone ?? "Non disponible",
      gps: alert.latitude != null && alert.longitude != null ? `${alert.latitude}, ${alert.longitude}` : "Position non disponible",
      photosCount: alert.photoPaths?.length ?? 0,
      photoPaths: alert.photoPaths ?? [],
    };
  }, []);

  // Chargement initial des alertes du jour
  const fetchMapAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();

      const filtered = data
        .filter((item: any) => isToday(item.createdAt))
        .map(formatAlert)
        .filter((a: EmergencyAlert) => a.status === "nouvelle" || a.status === "encours");

      setAlerts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formatAlert]);

  useEffect(() => {
    fetchMapAlerts();
  }, [fetchMapAlerts]);

  // Écoute WebSocket temps réel
  useEffect(() => {
    const unsubscribe = connectWebSocket((nouvelleAlerte) => {
      if (!isToday(nouvelleAlerte.createdAt)) return;
      const alertFormatted = formatAlert(nouvelleAlerte);

      setAlerts((prevAlerts) => {
        if (alertFormatted.status === "terminee") {
          return prevAlerts.filter((a) => a.id !== alertFormatted.id);
        }

        const exists = prevAlerts.some((a) => a.id === alertFormatted.id);
        if (exists) {
          return prevAlerts.map((a) => (a.id === alertFormatted.id ? alertFormatted : a));
        }

        if (alertFormatted.status === "nouvelle" || alertFormatted.status === "encours") {
          return [alertFormatted, ...prevAlerts];
        }

        return prevAlerts;
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [formatAlert]);

  // Filtrage local selon le bouton sélectionné
  const displayedAlerts = useMemo(() => {
    if (activeFilter === "toutes") return alerts;
    return alerts.filter((a) => a.status === activeFilter);
  }, [alerts, activeFilter]);

  const stats = useMemo(() => {
    const nouvelles = alerts.filter((a) => a.status === "nouvelle").length;
    const encours = alerts.filter((a) => a.status === "encours").length;
    return { total: alerts.length, nouvelles, encours };
  }, [alerts]);

  // Sélection d'une alerte à partir de son ID (passé par RealLiveMap)
  const handleSelectAlertById = (id: number) => {
    const found = alerts.find((a) => a.id === id);
    if (found) {
      setSelectedAlert(found);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* HEADER DE LA PAGE */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Carte des Interventions</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  Live GPS
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Suivi cartographique Leaflet en temps réel des alertes du jour.
              </p>
            </div>

            <button
              onClick={fetchMapAlerts}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>

          {/* SÉLECTEURS DE FILTRES */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setActiveFilter("toutes")}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                activeFilter === "toutes"
                  ? "border-gray-900 bg-gray-900 text-white shadow-md"
                  : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${activeFilter === "toutes" ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"}`}>
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${activeFilter === "toutes" ? "text-gray-300" : "text-gray-500"}`}>
                    Toutes visibles
                  </p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveFilter("nouvelle")}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                activeFilter === "nouvelle"
                  ? "border-red-600 bg-red-600 text-white shadow-md"
                  : "border-red-200 bg-red-50/50 text-gray-900 hover:bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                </span>
                <div>
                  <p className={`text-xs font-medium ${activeFilter === "nouvelle" ? "text-red-100" : "text-red-800"}`}>
                    Nouvelles (Rouge)
                  </p>
                  <p className="text-xl font-bold text-red-950">{stats.nouvelles}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveFilter("encours")}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                activeFilter === "encours"
                  ? "border-orange-500 bg-orange-500 text-white shadow-md"
                  : "border-orange-200 bg-orange-50/50 text-gray-900 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <div>
                  <p className={`text-xs font-medium ${activeFilter === "encours" ? "text-orange-100" : "text-orange-800"}`}>
                    En cours (Orange)
                  </p>
                  <p className="text-xl font-bold text-orange-950">{stats.encours}</p>
                </div>
              </div>
            </button>
          </div>

          {/* CARTE LEAFLET EN PLEINE LARGEUR */}
          <div className="w-full">
            <RealLiveMap
              alerts={displayedAlerts}
              onSelectAlert={handleSelectAlertById}
            />
          </div>
        </div>

        {/* DRAWER DES DÉTAILS D'ALERTE */}
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAccept={() => fetchMapAlerts()}
          onRefuse={() => fetchMapAlerts()}
          onTransfer={() => setSelectedAlert(null)}
          onTerminate={() => fetchMapAlerts()}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}