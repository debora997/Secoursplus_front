"use client";

import { useMemo, useState } from "react";
import { EmergencyAlert, AlertFilter } from "@/types/alert";
import AlertCard from "./AlertCard";

interface AlertListProps {
  alerts: EmergencyAlert[];
  searchQuery: string;
  onViewDetails: (id: number) => void;
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

export default function AlertList({ alerts, searchQuery, onViewDetails, highlightedId, cardRefs }: AlertListProps) {
  const [filter, setFilter] = useState<AlertFilter>("toutes");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return alerts.filter((a) => {
      const matchesFilter = filter === "toutes" || a.status === filter;
      const matchesSearch =
        q === "" ||
        `${a.location} ${a.description} ${a.reporterName}`.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [alerts, filter, searchQuery]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <div className="font-display text-[19px] font-bold tracking-tight">Alertes reçues</div>
          <div className="font-mono text-xs text-brand-muted">
            {filtered.length} signalement{filtered.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex gap-1 rounded-xl border border-brand-line bg-white p-1 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                filter === f ? "bg-brand-ink text-white" : "text-brand-muted hover:text-brand-ink"
              }`}
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onViewDetails={onViewDetails}
            highlighted={highlightedId === alert.id}
            ref={cardRefs ? (el) => (cardRefs.current[alert.id] = el) : undefined}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-brand-lineStrong bg-white py-16 text-center text-sm text-brand-muted">
            Aucune alerte ne correspond à ce filtre.
          </div>
        )}
      </div>
    </div>
  );
}
