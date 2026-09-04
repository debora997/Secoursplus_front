"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { connectWebSocket } from "@/services/websocket";

import DashboardLayout from "../layout/DashboardLayout";
import StatGrid from "./StatGrid";
import AlertList from "./AlertList";
import LiveMap from "./LiveMap";
import AlertDetailDrawer from "./AlertDetailDrawer";
import NewAlertPopup from "./NewAlertPopup";

import { EmergencyAlert } from "@/types/alert";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const API_URL = "http://localhost:8080/api/alerts";

// =========================================================
// UTILITAIRE : VÉRIFIER SI LA DATE CORRESPOND À AUJOURD'HUI
// =========================================================
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

export default function Dashboard() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Alerte entrante affichée dans le popup
  const [incomingAlert, setIncomingAlert] = useState<EmergencyAlert | null>(null);

  // Sirène
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  // Références des cartes d'alertes
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Référence pour suivre la date du jour courante
  const lastCheckedDateRef = useRef<string>(new Date().toDateString());

  // =========================================================
  // ARRÊTER LA SIRÈNE
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
  // FERMER LE POPUP
  // =========================================================
  const handleClosePopup = useCallback(() => {
    stopSiren();
    setIncomingAlert(null);
  }, [stopSiren]);

  // =========================================================
  // NORMALISER LA GRAVITÉ
  // =========================================================
  function normalizeSeverity(severity: any): string {
    return String(severity ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // =========================================================
  // TRANSFORMER LA GRAVITÉ BACKEND EN PRIORITÉ FRONTEND
  // =========================================================
  function mapSeverityToPriority(severity: any): EmergencyAlert["priority"] {
    const normalizedSeverity = normalizeSeverity(severity);

    switch (normalizedSeverity) {
      case "modere":
        return "moyen";
      case "grave":
      case "critique":
        return "eleve";
      default:
        return "moyen";
    }
  }

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
    } else if (
      alert.status === "TERMINATED" ||
      alert.status === "REJECTED" ||
      alert.status === "REFUSED"
    ) {
      mappedStatus = "terminee";
    }

    const priority = mapSeverityToPriority(alert.severity);

    return {
      id: alert.id,
      type: alert.type ? alert.type.toLowerCase() : "accident",
      status: mappedStatus,
      priority,
      date: alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : "",
      time: alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : "",
      createdAt: alert.createdAt ?? new Date().toISOString(),
      location: "Position GPS",
      latitude: alert.latitude ?? null,
      longitude: alert.longitude ?? null,
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
  // CHARGEMENT INITIAL (FILTRAGE STRICT DU JOUR)
  // =========================================================
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Impossible de récupérer les alertes");
        }
        return response.json();
      })
      .then((data: any[]) => {
        // Ne conserve que les alertes dont la date de création est AUJOURD'HUI
        const todayAlerts = data
          .filter((item) => isToday(item.createdAt))
          .map(formatAlert);

        setAlerts(todayAlerts);
      })
      .catch((error) => {
        console.error("❌ Erreur chargement alertes :", error);
      });
  }, []);

  // =========================================================
  // DETECTEUR DU BASCULEMENT DE MINUIT
  // =========================================================
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDateStr = new Date().toDateString();
      if (currentDateStr !== lastCheckedDateRef.current) {
        console.log("🌙 Changement de jour détecté ! Réinitialisation du Dashboard pour le nouveau jour.");
        lastCheckedDateRef.current = currentDateStr;

        // Purge automatique des alertes qui ne datent plus d'aujourd'hui
        setAlerts((prevAlerts) =>
          prevAlerts.filter((alert) => isToday(alert.createdAt))
        );
      }
    }, 30000); // Vérification légère toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // WEBSOCKET (RECEPTION ET VERIFICATION DU JOUR)
  // =========================================================
  useEffect(() => {
    const unsubscribe: (() => void) | void = connectWebSocket((nouvelleAlerte) => {
      // 1. Vérification : l'alerte provient-elle d'aujourd'hui ?
      if (!isToday(nouvelleAlerte.createdAt)) {
        console.log("ℹ️ Alerte ignorée par le Dashboard car elle ne date pas d'aujourd'hui :", nouvelleAlerte.id);
        return;
      }

      // 2. Formater l'alerte du jour
      const alertFormatted = formatAlert(nouvelleAlerte);

      // 3. Mettre à jour la liste des alertes
      setAlerts((prev) => {
        const exists = prev.some((alert) => alert.id === alertFormatted.id);
        if (exists) {
          return prev.map((alert) => (alert.id === alertFormatted.id ? alertFormatted : alert));
        }
        return [alertFormatted, ...prev];
      });

      // 4. Déclencher Popup et Sirène uniquement pour les nouvelles alertes
      if (nouvelleAlerte.status === "RECEIVED" || alertFormatted.status === "nouvelle") {
        setIncomingAlert(alertFormatted);
        stopSiren();

        const audio = new Audio("/sounds/siren.mp3");
        audio.loop = true;
        sirenRef.current = audio;

        audio.play()
          .then(() => console.log("🔊 Sirène démarrée"))
          .catch((error) => console.warn("⚠️ Impossible de démarrer la sirène :", error));
      }
    });

    return () => {
      stopSiren();
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [stopSiren]);

  // =========================================================
  // CLEANUP AU DÉMONTAGE
  // =========================================================
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, [stopSiren]);

  // =========================================================
  // MODIFIER LE STATUT
  // =========================================================
  async function updateStatus(id: number, status: "encours" | "terminee" | "nouvelle") {
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(null);

    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, status } : alert))
    );

    try {
      let backendStatus = "RECEIVED";
      if (status === "encours") backendStatus = "IN_PROGRESS";
      if (status === "terminee") backendStatus = "TERMINATED";

      const response = await fetch(`${API_URL}/${id}/status?status=${backendStatus}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("❌ Erreur modification statut :", error);
    }
  }

  // =========================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // =========================================================
  function handleAccept(id: number) {
    updateStatus(id, "encours");
  }

  function handleReject(id: number) {
    updateStatus(id, "terminee");
  }

  function handleTransfer(id: number) {
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(null);
  }

  function handleTerminate(id: number) {
    updateStatus(id, "terminee");
  }

  function handleDetails(id: number) {
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(id);
  }

  function focusAlertFromMap(id: number) {
    const element = cardRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 1100);
    }
  }

  const selectedAlert = alerts.find((alert) => alert.id === selectedId) ?? null;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-7">
          {/* STATISTIQUES (Basées uniquement sur les alertes du jour) */}
          <StatGrid alerts={alerts} availableFirefighters={8} totalFirefighters={14} />

          {/* ALERTES + CARTE */}
          <div className="grid grid-cols-[1fr_410px] gap-6 max-[1180px]:grid-cols-1">
            {/* LISTE ALERTES DU JOUR */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow">
              <div className="flex justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold">Alertes & Interventions du jour</h2>
                  <p className="text-sm text-gray-500">Alertes reçues en temps réel aujourd'hui</p>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                  {alerts.filter((alert) => alert.status !== "terminee").length} actives
                </span>
              </div>
              <div className="p-6">
                <AlertList
                  alerts={alerts}
                  searchQuery={searchQuery}
                  onViewDetails={(id) => {
                    stopSiren();
                    setIncomingAlert(null);
                    setSelectedId(id);
                  }}
                  onTerminate={handleTerminate}
                  highlightedId={highlightedId}
                  cardRefs={cardRefs}
                />
              </div>
            </section>

            {/* CARTE (Affiche uniquement les positions des alertes du jour) */}
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

        {/* POPUP FLOTTANT DE NOUVELLE ALERTE */}
        <NewAlertPopup
          alert={incomingAlert}
          onClose={handleClosePopup}
          onDetails={handleDetails}
        />

        {/* DRAWER DÉTAILS */}
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => {
            stopSiren();
            setSelectedId(null);
          }}
          onAccept={handleAccept}
          onRefuse={handleReject}
          onTransfer={handleTransfer}
          onTerminate={handleTerminate}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}