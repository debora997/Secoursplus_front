"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

import { connectWebSocket } from "@/services/websocket";
import DashboardLayout from "../layout/DashboardLayout";
import StatGrid from "./StatGrid";
import AlertList from "./AlertList";
import AlertDetailDrawer from "./AlertDetailDrawer";
import NewAlertPopup from "./NewAlertPopup";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { EmergencyAlert, AlertStatus, EmergencyType } from "@/types/alert";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/alerts`;

/**
 * Normalise et convertit tout format de date (String ISO, Timestamp, Array Jackson)
 * en un objet Date JavaScript valide.
 */
function parseBackendDate(dateInput?: any): Date | null {
  if (!dateInput) return null;

  try {
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
      return new Date(year, month - 1, day, hour, minute, second);
    }

    if (typeof dateInput === "number") {
      return new Date(dateInput);
    }

    if (typeof dateInput === "string") {
      const normalizedStr = dateInput.includes("T")
        ? dateInput
        : dateInput.replace(" ", "T");
      const parsed = new Date(normalizedStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (e) {
    console.warn("⚠️ Impossible de parser la date :", dateInput);
    return null;
  }
}

/**
 * Vérifie si l'alerte a été créée au cours des dernières 24 heures (86 400 000 ms).
 */
function isWithinLast24Hours(dateInput?: any): boolean {
  const alertDate = parseBackendDate(dateInput);
  if (!alertDate) return false;

  const now = Date.now();
  const alertTime = alertDate.getTime();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  const diff = now - alertTime;
  return diff >= 0 && diff <= TWENTY_FOUR_HOURS_MS;
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [incomingAlert, setIncomingAlert] = useState<EmergencyAlert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sirenRef = useRef<HTMLAudioElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Récupération de la caserne active depuis localStorage
  const userString =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userString ? JSON.parse(userString) : null;
  const currentCaserne: string = user?.caserne || user?.caserneName || "";

  const LiveMap = dynamic(() => import("./LiveMap"), {
    ssr: false,
    loading: () => (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
        Chargement de la carte...
      </div>
    ),
  });

  const stopSiren = useCallback(() => {
    if (sirenRef.current) {
      sirenRef.current.pause();
      sirenRef.current.currentTime = 0;
      sirenRef.current = null;
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    stopSiren();
    setIncomingAlert(null);
  }, [stopSiren]);

  function normalizeSeverity(severity: any): string {
    return String(severity ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

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

  const formatAlert = useCallback((alert: any): EmergencyAlert => {
    let mappedStatus: AlertStatus = "nouvelle";
    const rawStatus = String(alert.status || "PENDING").toUpperCase();

    if (
      rawStatus === "IN_PROGRESS" ||
      rawStatus === "ACCEPTED" ||
      rawStatus === "ENGAGED" ||
      rawStatus === "ENCOURS" ||
      rawStatus === "EN_COURS"
    ) {
      mappedStatus = "encours";
    } else if (
      rawStatus === "TERMINATED" ||
      rawStatus === "REJECTED" ||
      rawStatus === "REFUSED" ||
      rawStatus === "TERMINEE"
    ) {
      mappedStatus = "terminee";
    } else if (
      rawStatus === "TRANSFERRED" ||
      rawStatus === "TRANSFEREE" ||
      rawStatus === "TRANSFER"
    ) {
      mappedStatus = "TRANSFERRED";
    }

    const priority = mapSeverityToPriority(alert.severity);
    const parsedDate = parseBackendDate(alert.createdAt);

    // Formate et caste le type d'urgence pour correspondre à EmergencyType
    const alertType = alert.type
      ? (String(alert.type).toLowerCase() as EmergencyType)
      : ("accident" as EmergencyType);

    return {
      id: alert.id,
      type: alertType,
      status: mappedStatus,
      priority,
      date: parsedDate ? parsedDate.toLocaleDateString() : "",
      time: parsedDate
        ? parsedDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      createdAt: alert.createdAt ?? new Date().toISOString(),
      location: alert.location || "Position GPS",
      latitude: alert.latitude ?? null,
      longitude: alert.longitude ?? null,
      position: { x: 50, y: 50 },
      description: alert.description ?? "",
      caserne: alert.caserne,
      caserneTransfertPar: alert.caserneTransfertPar,
      caserneTransfertA: alert.caserneTransfertA || alert.caserneDestinataire,
      reporterName: alert.citoyenNom ?? "Citoyen",
      reporterPhone: alert.citoyenTelephone ?? "Non disponible",
      gps:
        alert.latitude != null && alert.longitude != null
          ? `${alert.latitude}, ${alert.longitude}`
          : "Position non disponible",
      photosCount: alert.photoPaths?.length ?? 0,
      photoPaths: alert.photoPaths ?? [],
      victims: alert.victims ?? alert.victimsCount ?? alert.nombreVictimes ?? 0,
    };
  }, []);

  // =========================================================
  // RÉCUPÉRER TOUTES LES ALERTES DEPUIS MYSQL
  // =========================================================
  const fetchAlerts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const role = currentUser?.role || "CHEF_CASERNE";

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "X-Admin-Role": role,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Impossible de récupérer les alertes (${response.status})`
        );
      }

      const data: any = await response.json();

      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      // Filtrage local : Ne garde que les alertes des dernières 24 heures
      const activeAlerts = rawList
        .filter((item) => isWithinLast24Hours(item.createdAt))
        .map(formatAlert);

      setAlerts(activeAlerts);
    } catch (error) {
      console.error("❌ Erreur chargement alertes :", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [formatAlert]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Purge périodique : Supprime dynamiquement les alertes qui dépassent 24h
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => isWithinLast24Hours(alert.createdAt))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket : Réception des alertes en temps réel
  useEffect(() => {
    const unsubscribe = connectWebSocket((nouvelleAlerte) => {
      if (!isWithinLast24Hours(nouvelleAlerte.createdAt)) return;

      const alertFormatted = formatAlert(nouvelleAlerte);

      setAlerts((prev) => {
        const exists = prev.some((alert) => alert.id === alertFormatted.id);
        if (exists) {
          return prev.map((alert) =>
            alert.id === alertFormatted.id ? alertFormatted : alert
          );
        }
        return [alertFormatted, ...prev];
      });

      if (String(nouvelleAlerte.status).toUpperCase() === "RECEIVED") {
        setIncomingAlert(alertFormatted);
        stopSiren();

        const audioInstance = new Audio("/sounds/siren.mp3");
        audioInstance.loop = true;
        sirenRef.current = audioInstance;

        audioInstance.play().catch((error) => {
          console.warn("⚠️ Sirène bloquée par le navigateur :", error);
        });
      }
    });

    return () => {
      stopSiren();
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [formatAlert, stopSiren]);

  // Modification du statut
  async function updateStatus(
    id: number,
    status: "encours" | "terminee" | "nouvelle"
  ) {
    stopSiren();
    setIncomingAlert(null);
    setSelectedId(null);

    const caserneNom = currentCaserne;
    const role = user?.role || "CHEF_CASERNE";

    let backendStatus = "RECEIVED";
    if (status === "encours") backendStatus = "IN_PROGRESS";
    if (status === "terminee") backendStatus = "TERMINATED";

    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, status } : alert))
    );

    try {
      const url = `${API_URL}/${id}/status?status=${backendStatus}&caserne=${encodeURIComponent(
        caserneNom
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Role": role,
        },
      });

      if (response.status === 409) {
        const errorText = await response.text();
        alert(`⚠️ Intervention déjà prise en charge : ${errorText}`);
        await fetchAlerts();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      await fetchAlerts();
    } catch (error) {
      console.error("❌ Erreur modification statut :", error);
      await fetchAlerts();
    }
  }

  // Fonction de transfert vers une autre caserne
  const handleTransfer = async (id: number, targetCaserne: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/transfer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Role": localStorage.getItem("role") || "CHEF_CASERNE",
        },
        body: JSON.stringify({
          caserneTransfertPar: currentCaserne,
          caserneDestinataire: targetCaserne,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur réseau lors du transfert de l'alerte");
      }

      stopSiren();
      setIncomingAlert(null);
      setSelectedId(null);
      await fetchAlerts();
    } catch (error) {
      console.error("Erreur transfert :", error);
    }
  };

  function handleAccept(id: number) {
    updateStatus(id, "encours");
  }
  function handleReject(id: number) {
    updateStatus(id, "terminee");
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

  // Filtrage selon l'émetteur et le destinataire du transfert
  const visibleAlerts = alerts.filter((alert) => {
    const isTransferred =
      alert.status === "TRANSFERRED" || alert.status === "transferee";

    // Si l'alerte n'est pas transférée, on la conserve
    if (!isTransferred) {
      return true;
    }

    const isEmetteur =
      alert.caserneTransfertPar &&
      alert.caserneTransfertPar.toLowerCase() === currentCaserne.toLowerCase();

    const isRecepteur =
      alert.caserneTransfertA &&
      (alert.caserneTransfertA === "TOUTES" ||
        alert.caserneTransfertA.toLowerCase() === currentCaserne.toLowerCase());

    // Conserver si la caserne est à l'origine du transfert OU destinataire
    if (isEmetteur || isRecepteur) {
      return true;
    }

    return false;
  });

  const selectedAlert =
    visibleAlerts.find((alert) => alert.id === selectedId) ?? null;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-7">
          <StatGrid
            alerts={visibleAlerts}
            availableFirefighters={8}
            totalFirefighters={14}
          />

          <div className="grid grid-cols-[1fr_410px] gap-6 max-[1180px]:grid-cols-1">
            <section className="rounded-2xl border border-gray-200 bg-white shadow">
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    Alertes & Interventions des dernières 24h
                  </h2>
                  <p className="text-sm text-gray-500">
                    Alertes reçues en temps réel au cours des dernières 24 heures
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchAlerts}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <span className={isRefreshing ? "animate-spin" : ""}>
                      🔄
                    </span>
                    {isRefreshing ? "Chargement..." : "Actualiser"}
                  </button>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600">
                    {
                      visibleAlerts.filter((alert) => alert.status !== "terminee")
                        .length
                    }{" "}
                    actives
                  </span>
                </div>
              </div>

              <div className="p-6">
                <AlertList
                  alerts={visibleAlerts}
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

            <section className="rounded-2xl border border-gray-200 bg-white shadow">
              <div className="border-b px-6 py-5">
                <h2 className="text-lg font-semibold">
                  Carte des interventions
                </h2>
              </div>
              <div className="p-5">
                <LiveMap
                  alerts={visibleAlerts}
                  onSelectAlert={focusAlertFromMap}
                />
              </div>
            </section>
          </div>
        </div>

        <NewAlertPopup
          alert={incomingAlert}
          onClose={handleClosePopup}
          onDetails={handleDetails}
        />

        <AlertDetailDrawer
          alert={selectedAlert}
          isOpen={!!selectedId}
          onClose={() => {
            stopSiren();
            setSelectedId(null);
          }}
          onAccept={handleAccept}
          onRefuse={handleReject}
          onTransfer={handleTransfer}
          onTerminate={handleTerminate}
          currentCaserne={currentCaserne}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}