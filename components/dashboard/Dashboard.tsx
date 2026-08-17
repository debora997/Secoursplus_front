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

  // Alerte entrante affichée dans le modal
  const [incomingAlert, setIncomingAlert] =
    useState<EmergencyAlert | null>(null);

  // Sirène
  const sirenRef = useRef<HTMLAudioElement | null>(null);

  // Références des cartes d'alertes
  const cardRefs =
    useRef<Record<number, HTMLDivElement | null>>({});

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
  // NORMALISER LA GRAVITÉ
  // =========================================================
  //
  // Accepte :
  // "modere"
  // "modéré"
  // "MODERE"
  // "MODÉRÉ"
  // "grave"
  // "GRAVE"
  // "critique"
  // "CRITIQUE"
  //
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
  //
  // modéré / modere -> moyen
  // grave            -> eleve
  // critique         -> eleve
  //
  // =========================================================

  function mapSeverityToPriority(
    severity: any
  ): EmergencyAlert["priority"] {
    const normalizedSeverity =
      normalizeSeverity(severity);

    console.log(
      "🔥 Gravité reçue du backend :",
      severity
    );

    console.log(
      "🔥 Gravité normalisée :",
      normalizedSeverity
    );

    switch (normalizedSeverity) {
      case "modere":
        return "moyen";

      case "grave":
        return "eleve";

      case "critique":
        return "eleve";

      default:
        console.warn(
          "⚠️ Gravité inconnue :",
          severity
        );

        return "moyen";
    }
  }

  // =========================================================
  // FORMAT ALERT
  // Backend Java -> Frontend
  // =========================================================

  function formatAlert(alert: any): EmergencyAlert {
    console.log(
      "🚨 ALERTE À FORMATER :",
      alert
    );

    console.log(
      "🔥 GRAVITÉ REÇUE :",
      alert.severity
    );

    let mappedStatus: EmergencyAlert["status"] =
      "nouvelle";

    // -------------------------------------------------------
    // STATUT
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // PRIORITÉ / GRAVITÉ
    // -------------------------------------------------------

    const priority =
      mapSeverityToPriority(
        alert.severity
      );

    console.log(
      "🎯 PRIORITÉ FRONTEND :",
      priority
    );

    // -------------------------------------------------------
    // OBJET FINAL
    // -------------------------------------------------------

    return {
      id: alert.id,

      type: alert.type
        ? alert.type.toLowerCase()
        : "accident",

      status: mappedStatus,

      priority,

      date: alert.createdAt
        ? new Date(
            alert.createdAt
          ).toLocaleDateString()
        : "",

      time: alert.createdAt
        ? new Date(
            alert.createdAt
          ).toLocaleTimeString()
        : "",

      location: "Position GPS",

      position: {
        x: 50,
        y: 50,
      },

      description:
        alert.description ?? "",

      reporterName:
        alert.citoyenNom ??
        "Citoyen",

      reporterPhone:
        alert.citoyenTelephone ??
        "Non disponible",

      gps:
        alert.latitude != null &&
        alert.longitude != null
          ? `${alert.latitude}, ${alert.longitude}`
          : "Position non disponible",

      photosCount:
        alert.photoPaths?.length ?? 0,

      photoPaths:
        alert.photoPaths ?? [],
    };
  }

  // =========================================================
  // CHARGEMENT INITIAL
  // =========================================================

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les alertes"
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "📥 Alertes récupérées :",
          data
        );

        const formatted =
          data.map(formatAlert);

        console.log(
          "📊 Alertes formatées :",
          formatted
        );

        setAlerts(formatted);
      })
      .catch((error) => {
        console.error(
          "❌ Erreur chargement alertes :",
          error
        );
      });
  }, []);

  // =========================================================
  // WEBSOCKET
  // =========================================================

  useEffect(() => {
    const unsubscribe =
      connectWebSocket(
        (nouvelleAlerte) => {
          console.log(
            "🚨 ALERTE TEMPS RÉEL REÇUE :",
            nouvelleAlerte
          );

          // -----------------------------------------------
          // FORMATAGE
          // -----------------------------------------------

          const alertFormatted =
            formatAlert(
              nouvelleAlerte
            );

          console.log(
            "📊 ALERTE FORMATÉE :",
            alertFormatted
          );

          // -----------------------------------------------
          // AJOUT / MISE À JOUR DANS LA LISTE
          // -----------------------------------------------

          setAlerts((prev) => {
            const exists =
              prev.some(
                (alert) =>
                  alert.id ===
                  alertFormatted.id
              );

            if (exists) {
              console.log(
                "🔄 Alerte déjà présente : mise à jour"
              );

              return prev.map(
                (alert) =>
                  alert.id ===
                  alertFormatted.id
                    ? alertFormatted
                    : alert
              );
            }

            console.log(
              "➕ Nouvelle alerte ajoutée"
            );

            return [
              alertFormatted,
              ...prev,
            ];
          });

          // -----------------------------------------------
          // MODAL + SIRÈNE
          // -----------------------------------------------

          if (
            nouvelleAlerte.status ===
              "RECEIVED" ||
            alertFormatted.status ===
              "nouvelle"
          ) {
            console.log(
              "🚨 Nouvelle alerte RECEIVED : démarrage sirène"
            );

            setIncomingAlert(
              alertFormatted
            );

            // Sécurité : arrêter une éventuelle
            // ancienne sirène
            stopSiren();

            const audio =
              new Audio(
                "/sounds/siren.mp3"
              );

            audio.loop = true;

            sirenRef.current =
              audio;

            audio
              .play()
              .then(() => {
                console.log(
                  "🔊 Sirène démarrée"
                );
              })
              .catch((error) => {
                console.warn(
                  "⚠️ Impossible de démarrer la sirène :",
                  error
                );
              });
          }
        }
      );

    // -----------------------------------------------
    // CLEANUP WEBSOCKET
    // -----------------------------------------------

    return () => {
      stopSiren();

      if (
        typeof unsubscribe ===
        "function"
      ) {
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

  async function updateStatus(
    id: number,
    status:
      | "encours"
      | "terminee"
      | "nouvelle"
  ) {
    console.log(
      `📡 Modification alerte ${id} -> ${status}`
    );

    // -------------------------------------------------------
    // COUPER IMMÉDIATEMENT LA SIRÈNE
    // -------------------------------------------------------

    stopSiren();

    // -------------------------------------------------------
    // FERMER LES PANNEAUX
    // -------------------------------------------------------

    setIncomingAlert(null);
    setSelectedId(null);

    // -------------------------------------------------------
    // MISE À JOUR OPTIMISTE
    // -------------------------------------------------------

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status,
            }
          : alert
      )
    );

    try {
      let backendStatus =
        "RECEIVED";

      if (
        status === "encours"
      ) {
        backendStatus =
          "IN_PROGRESS";
      }

      if (
        status === "terminee"
      ) {
        backendStatus =
          "TERMINATED";
      }

      console.log(
        "📡 Statut envoyé au backend :",
        backendStatus
      );

      const response =
        await fetch(
          `${API_URL}/${id}/status?status=${backendStatus}`,
          {
            method: "PUT",
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText
        );
      }

      console.log(
        "✅ Statut enregistré"
      );
    } catch (error) {
      console.error(
        "❌ Erreur modification statut :",
        error
      );
    }
  }

  // =========================================================
  // ENGAGER
  // =========================================================

  function handleAccept(
    id: number
  ) {
    console.log(
      "🚒 Intervention engagée :",
      id
    );

    updateStatus(
      id,
      "encours"
    );
  }

  // =========================================================
  // REFUSER
  // =========================================================

  function handleReject(
    id: number
  ) {
    console.log(
      "❌ Intervention refusée :",
      id
    );

    updateStatus(
      id,
      "terminee"
    );
  }

  // =========================================================
  // TRANSFÉRER
  // =========================================================

  function handleTransfer(
    id: number
  ) {
    console.log(
      "🔄 Intervention transférée :",
      id
    );

    // Pour le moment on ferme
    // et coupe la sirène.
    stopSiren();

    setIncomingAlert(null);
    setSelectedId(null);

    // Tu pourras ensuite connecter
    // ici ton endpoint de transfert.
  }

  // =========================================================
  // TERMINER
  // =========================================================

  function handleTerminate(
    id: number
  ) {
    console.log(
      "🏁 Intervention terminée :",
      id
    );

    updateStatus(
      id,
      "terminee"
    );
  }

  // =========================================================
  // VOIR LES DÉTAILS
  // =========================================================

  function handleDetails(
    id: number
  ) {
    console.log(
      "👁️ Affichage détails :",
      id
    );

    stopSiren();

    setIncomingAlert(null);

    setSelectedId(id);
  }

  // =========================================================
  // RÉDUIRE LE MODAL
  // =========================================================

  function handleMinimize() {
    console.log(
      "🔽 Modal réduit"
    );

    stopSiren();

    setIncomingAlert(null);
  }

  // =========================================================
  // FOCUS DEPUIS LA CARTE
  // =========================================================

  function focusAlertFromMap(
    id: number
  ) {
    const element =
      cardRefs.current[id];

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightedId(id);

      setTimeout(() => {
        setHighlightedId(null);
      }, 1100);
    }
  }

  // =========================================================
  // ALERTE SÉLECTIONNÉE
  // =========================================================

  const selectedAlert =
    alerts.find(
      (alert) =>
        alert.id === selectedId
    ) ?? null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <ProtectedRoute>
      <DashboardLayout>

        <div className="space-y-7">

          {/* =================================================
              STATISTIQUES
          ================================================= */}

          <StatGrid
            alerts={alerts}
            availableFirefighters={8}
            totalFirefighters={14}
          />

          {/* =================================================
              ALERTES + CARTE
          ================================================= */}

          <div
            className="
              grid
              grid-cols-[1fr_410px]
              gap-6
              max-[1180px]:grid-cols-1
            "
          >

            {/* =================================================
                LISTE ALERTES
            ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow
              "
            >

              <div
                className="
                  flex
                  justify-between
                  border-b
                  px-6
                  py-5
                "
              >

                <div>

                  <h2 className="text-lg font-semibold">
                    Alertes & Interventions
                  </h2>

                  <p className="text-sm text-gray-500">
                    Alertes reçues en temps réel
                  </p>

                </div>

                <span
                  className="
                    rounded-full
                    bg-red-50
                    px-3
                    py-1
                    text-xs
                    text-red-600
                  "
                >
                  {
                    alerts.filter(
                      (alert) =>
                        alert.status !==
                        "terminee"
                    ).length
                  }{" "}
                  actives
                </span>

              </div>

              <div className="p-6">

                <AlertList
                  alerts={alerts}
                  searchQuery={
                    searchQuery
                  }

                  onViewDetails={(
                    id
                  ) => {
                    stopSiren();

                    setIncomingAlert(
                      null
                    );

                    setSelectedId(
                      id
                    );
                  }}

                  onTerminate={
                    handleTerminate
                  }

                  highlightedId={
                    highlightedId
                  }

                  cardRefs={
                    cardRefs
                  }
                />

              </div>

            </section>

            {/* =================================================
                CARTE
            ================================================= */}

            <section
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow
              "
            >

              <div
                className="
                  border-b
                  px-6
                  py-5
                "
              >

                <h2 className="text-lg font-semibold">
                  Carte des interventions
                </h2>

              </div>

              <div className="p-5">

                <LiveMap
                  alerts={alerts}
                  onSelectAlert={
                    focusAlertFromMap
                  }
                />

              </div>

            </section>

          </div>

        </div>

        {/* =====================================================
            MODAL NOUVELLE ALERTE
        ===================================================== */}

        <NewAlertModal
          alert={incomingAlert}

          onAccept={
            handleAccept
          }

          onReject={
            handleReject
          }

          onTransfer={
            handleTransfer
          }

          onDetails={
            handleDetails
          }

          onMinimize={
            handleMinimize
          }
        />

        {/* =====================================================
            DRAWER DÉTAILS
        ===================================================== */}

        <AlertDetailDrawer
          alert={selectedAlert}

          onClose={() => {
            stopSiren();
            setSelectedId(null);
          }}

          onAccept={
            handleAccept
          }

          onRefuse={
            handleReject
          }

          onTransfer={
            handleTransfer
          }

          onTerminate={
            handleTerminate
          }
        />

      </DashboardLayout>
    </ProtectedRoute>
  );
}