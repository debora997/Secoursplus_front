"use client";

import { useRef, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import StatGrid from "./StatGrid";
import AlertList from "./AlertList";
import LiveMap from "./LiveMap";
import AlertDetailDrawer from "./AlertDetailDrawer";
import { mockAlerts } from "@/data/mockAlerts";
import { EmergencyAlert } from "@/types/alert";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(mockAlerts);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const selectedAlert =
    alerts.find((a) => a.id === selectedId) ?? null;

  function updateStatus(
    id: number,
    status: EmergencyAlert["status"]
  ) {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );

    setSelectedId(null);
  }

  function focusAlertFromMap(id: number) {
    const el = cardRefs.current[id];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightedId(id);

      setTimeout(() => {
        setHighlightedId(null);
      }, 1100);
    }
  }

  return (
    <ProtectedRoute>
    <DashboardLayout>

      <div className="space-y-7">

        {/* Statistiques */}
        <StatGrid
          alerts={alerts}
          availableFirefighters={8}
          totalFirefighters={14}
        />

        {/* Contenu principal */}
        <div className="grid grid-cols-[1fr_410px] gap-6 max-[1180px]:grid-cols-1">

          {/* Liste des alertes */}
          <section
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-[0_8px_28px_rgba(15,23,42,0.06)]
              transition-all
              hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)]
            "
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Alertes en cours
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Toutes les alertes reçues en temps réel
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                {alerts.length} alertes
              </span>
            </div>

            <div className="p-6">
              <AlertList
                alerts={alerts}
                searchQuery={searchQuery}
                onViewDetails={setSelectedId}
                highlightedId={highlightedId}
                cardRefs={cardRefs}
              />
            </div>
          </section>

          {/* Carte */}
          <section
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-[0_8px_28px_rgba(15,23,42,0.06)]
              transition-all
              hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)]
            "
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Carte des interventions
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Localisation des alertes
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Temps réel
              </span>
            </div>

            <div className="p-5">
              <LiveMap
                alerts={alerts}
                onSelectAlert={focusAlertFromMap}
              />
            </div>
          </section>

        </div>

      </div>

      <AlertDetailDrawer
        alert={selectedAlert}
        onClose={() => setSelectedId(null)}
        onAccept={(id) => updateStatus(id, "encours")}
        onRefuse={(id) => updateStatus(id, "terminee")}
        onTransfer={() => setSelectedId(null)}
      />

    </DashboardLayout>
    </ProtectedRoute>
  );
}