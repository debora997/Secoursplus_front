"use client";

import { useMemo, useState } from "react";
import { EmergencyAlert, AlertFilter } from "@/types/alert";
import AlertCard from "./AlertCard";

interface AlertListProps {
  alerts: EmergencyAlert[];
  searchQuery: string;
  onViewDetails: (id: number) => void;
  onTerminate?: (id: number) => void; // 👈 Prop ajoutée pour gérer la fin d'intervention
  highlightedId?: number | null;
  cardRefs?: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
}

const FILTERS: AlertFilter[] = ["toutes", "nouvelle", "encours", "terminee"];

const FILTER_LABEL: Record<AlertFilter, string> = {
  toutes: "Toutes",
  nouvelle: "Nouvelles",
  encours: "En cours",
  terminee: "Terminées",
};

export default function AlertList({
  alerts,
  searchQuery,
  onViewDetails,
  onTerminate, // 👈 Destructuration ici
  highlightedId,
  cardRefs,
}: AlertListProps) {
  const [filter, setFilter] = useState<AlertFilter>("toutes");

  const counts = useMemo(() => {
    return {
      toutes: alerts.length,
      nouvelle: alerts.filter((a) => a.status === "nouvelle").length,
      encours: alerts.filter((a) => a.status === "encours").length,
      terminee: alerts.filter((a) => a.status === "terminee").length,
    };
  }, [alerts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return alerts.filter((a) => {
      const matchesFilter = filter === "toutes" || a.status === filter;
      const matchesSearch =
        q === "" ||
        `${a.location ?? ""} ${a.description ?? ""} ${a.reporterName ?? ""}`
          .toLowerCase()
          .includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [alerts, filter, searchQuery]);

  return (
    <div className="w-full space-y-3">
      {/* --- EN-TÊTE & FILTRES POMPIERS --- */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Titre & Indicateur Rouge */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Alertes reçues
          </h2>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-200/60">
            {filtered.length}
          </span>
        </div>

        {/* Barre d'onglets compacte (RÉPARTITION ÉGALE SANS SCROLL) */}
        <div className="grid w-full grid-cols-4 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 sm:w-auto sm:flex sm:items-center">
          {FILTERS.map((f) => {
            const isActive = filter === f;
            const count = counts[f];

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                <span>{FILTER_LABEL[f]}</span>
                {count > 0 && (
                  <span
                    className={`rounded px-1 py-0.2 text-[9px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- LISTE DES ALERTES COMPACTE --- */}
      <div className="flex flex-col gap-2">
        {filtered.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onViewDetails={onViewDetails}
            onTerminate={onTerminate} // 👈 TRANSMIS À ALERTCARD
            highlighted={highlightedId === alert.id}
            ref={
              cardRefs
                ? (el) => {
                    if (cardRefs.current) {
                      cardRefs.current[alert.id] = el;
                    }
                  }
                : undefined
            }
          />
        ))}

        {/* --- ÉTAT VIDE (EMPTY STATE) --- */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/20 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-800">
              Aucun signalement dans cette catégorie
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : "Les nouvelles urgences apparaîtront ici en temps réel."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}