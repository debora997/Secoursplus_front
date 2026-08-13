"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { connectWebSocket } from "@/services/websocket";

import DashboardLayout from "../layout/DashboardLayout";
import StatGrid from "./StatGrid";
import AlertList from "./AlertList";
import LiveMap from "./LiveMap";
import AlertDetailDrawer from "./AlertDetailDrawer";
import NewAlertModal from "./NewAlertModal";

import { EmergencyAlert } from "@/types/alert";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const API_URL = "http://localhost:8080/api/alerts";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal uniquement pour les nouvelles alertes entrantes
  const [incomingAlert, setIncomingAlert] = useState<EmergencyAlert | null>(null);

  // Ref audio pour stopper la sirène à tout moment
  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // =========================================================
  // FONCTION UNIFIÉE POUR ARRÊTER LA SIRÈNE
  // =========================================================
  const stopSiren = useCallback(() => {
    if (sirenRef.current) {
      sirenRef.current.pause();
      sirenRef.current.currentTime = 0;
      sirenRef.current = null;
      console.log("🔇 Sirène coupée");
    }
  }, []);

  // =========================================================
  // FORMAT ALERT (Backend Java -> Frontend)
  // =========================================================
  function formatAlert(alert: any): EmergencyAlert {
    let mappedStatus: EmergencyAlert["status"] = "nouvelle";

    if (alert.status === "RECEIVED") {
      mappedStatus = "nouvelle";
    } else if (
      alert.status === "IN_PROGRESS" ||
      alert.status === "ACCEPTED" ||
      alert.status === "ENGAGED"
    ) {
      mappedStatus = "encours";
    } else if (alert.status === "TRANSFERRED") {
      mappedStatus = "transferee";
    } else if (alert.status === "REJECTED" || alert.status === "REFUSED") {
      mappedStatus = "refusee";
    } else if (alert.status === "TERMINATED") {
      mappedStatus = "terminee";
    }

    return {
      id: alert.id,
      type: alert.type ? alert.type.toLowerCase() : "urgence",
      status: mappedStatus,
      priority:
        alert.severity === "HIGH"
          ? "eleve"
          : alert.severity === "LOW"
          ? "faible"
          : "moyen",
      date: alert.createdAt
        ? new Date(alert.createdAt).toLocaleDateString()
        : "",
      time: alert.createdAt
        ? new Date(alert.createdAt).toLocaleTimeString()
        : "",
      location: "Position GPS",
      position: { x: 50, y: 50 },
      description: alert.description ?? "",
      reporterName: alert.citoyenNom ?? "Citoyen",
      reporterPhone: alert.citoyenTelephone ?? "Non disponible",
      gps:
        alert.latitude != null && alert.longitude != null
          ? `${alert.latitude}, ${alert.longitude}`
          : "Position non disponible",
      photosCount: alert.photoPaths?.length ?? 0,
      photoPaths: alert.photoPaths ?? [],
    };
  }

  // =========================================================
  // CHARGEMENT INITIAL (Aucun son ne doit jouer ici)
  // =========================================================
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de récupérer les alertes");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map(formatAlert);
        setAlerts(formatted);
      })
      .catch((err) => console.error("❌ Erreur chargement alertes :", err));
  }, []);

  // =========================================================
  // WEBSOCKET (Seul endroit où le son et le modal démarrent)
  // =========================================================
  useEffect(() => {
    const unsubscribe = connectWebSocket((nouvelleAlerte) => {
      console.log("🚨 ALERTE TEMPS RÉEL REÇUE :", nouvelleAlerte);
      const alertFormatted = formatAlert(nouvelleAlerte);

      setAlerts((prev) => {
        const exists = prev.some((a) => a.id === alertFormatted.id);
        if (exists) {
          // Si l'alerte existe déjà, on met à jour la liste SANS relancer la sirène
          return prev.map((a) => (a.id === alertFormatted.id ? alertFormatted : a));
        }
        return [alertFormatted, ...prev];
      });

      // Condition : Ne faire sonner et ouvrir le modal QUE SI c'est une alerte reçue
      if (nouvelleAlerte.status === "RECEIVED" || alertFormatted.status === "nouvelle") {
        setIncomingAlert(alertFormatted);

        stopSiren();
        const audio = new Audio("/sounds/siren.mp3");
        audio.loop = true;
        sirenRef.current = audio;

        audio.play().catch((err) => {
          console.warn("⚠️ Lecture automatique bloquée par le navigateur :", err);
        });
      }
    });

    return () => {
      stopSiren();
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [stopSiren]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => stopSiren();
  }, [stopSiren]);

  // =========================================================
  // MODIFIER LE STATUT
  // =========================================================
  async function updateStatus(
    id: number,
    status: "encours" | "terminee" | "refusee" | "transferee" | "nouvelle"
  ) {
    // 🛑 COUPE IMMÉDIATEMENT LE SON ET TOUS LES PANNEAUX
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(null);

    // Mise à jour optimiste immédiate dans le state React
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    try {
      let backendStatus = "RECEIVED";
      if (status === "encours") backendStatus = "IN_PROGRESS";
      else if (status === "transferee") backendStatus = "TRANSFERRED";
      else if (status === "refusee") backendStatus = "REJECTED";
      else if (status === "terminee") backendStatus = "TERMINATED";

      const response = await fetch(`${API_URL}/${id}/status?status=${backendStatus}`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      console.error("❌ Erreur modification statut :", error);
    }
  }

  // =========================================================
  // HANDLERS D'ACTIONS
  // =========================================================
  function handleAccept(id: number) {
    updateStatus(id, "encours");
  }

  function handleReject(id: number) {
    updateStatus(id, "refusee");
  }

  function handleTransfer(id: number) {
    updateStatus(id, "transferee");
  }

  // 🟢 NOUVELLE FONCTION POUR TERMINER UNE INTERVENTION
  function handleTerminate(id: number) {
    updateStatus(id, "terminee");
  }

  function handleDetails(id: number) {
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(id);
  }

  function handleMinimize() {
    stopSiren();
    setIncomingAlert(null);
  }

  function focusAlertFromMap(id: number) {
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 1100);
    }
  }

  const selectedAlert = alerts.find((a) => a.id === selectedId) ?? null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-7">
          <StatGrid
            alerts={alerts}
            availableFirefighters={8}
            totalFirefighters={14}
          />

          <div className="grid grid-cols-[1fr_410px] gap-6 max-[1180px]:grid-cols-1">
            <section className="rounded-2xl border border-gray-200 bg-white shadow">
              <div className="flex justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold">Alertes & Interventions</h2>
                  <p className="text-sm text-gray-500">Alertes reçues en temps réel</p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                  {alerts.filter((a) => a.status !== "terminee").length} actives
                </span>
              </div>
              <div className="p-6">
                <AlertList
                  alerts={alerts}
                  searchQuery={searchQuery}
                  onViewDetails={(id) => {
                    stopSiren();
                    setSelectedId(id);
                  }}
                  onTerminate={handleTerminate} // 👈 TRANSMIS À ALERTLIST
                  highlightedId={highlightedId}
                  cardRefs={cardRefs}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow">
              <div className="border-b px-6 py-5">
                <h2 className="text-lg font-semibold">Carte des interventions</h2>
              </div>
              <div className="p-5">
                <LiveMap alerts={alerts} onSelectAlert={focusAlertFromMap} />
              </div>
            </section>
          </div>
        </div>

        {/* MODAL NOUVELLE ALERTE ENTRANTE */}
        <NewAlertModal
          alert={incomingAlert}
          onAccept={handleAccept}
          onReject={handleReject}
          onTransfer={handleTransfer}
          onDetails={handleDetails}
          onMinimize={handleMinimize}
        />

        {/* DRAWER DÉTAILS */}
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedId(null)}
          onAccept={handleAccept}
          onRefuse={handleReject}
          onTransfer={handleTransfer}
          onTerminate={handleTerminate} // 👈 OPTIONNEL : SI TU VEUX AUSSI LE BOUTON DANS LE DRAWER
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}