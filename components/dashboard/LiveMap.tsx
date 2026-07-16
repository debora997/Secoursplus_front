"use client";

import { Map, Maximize2, Crosshair, MapPin, Siren } from "lucide-react";
import { EmergencyAlert } from "@/types/alert";
import { MARKER_CLASSES } from "@/lib/alertStyles";

interface LiveMapProps {
  alerts: EmergencyAlert[];
  onSelectAlert: (id: number) => void;
  centerLabel?: string;
}

export default function LiveMap({ alerts, onSelectAlert, centerLabel = "12.6392° N, -8.0029° W" }: LiveMapProps) {
  return (
    <div className="sticky top-[92px] rounded-lg border border-brand-line bg-white shadow-sm max-[1180px]:static">
      <div className="flex items-center justify-between px-[18px] pb-3 pt-4">
        <div className="flex items-center gap-2 font-display text-[15.5px] font-bold">
          <Map className="h-4 w-4 text-brand-red" strokeWidth={2} />
          Carte en temps réel
        </div>
        <button className="flex items-center gap-1 text-[11.5px] font-semibold text-brand-red">
          Plein écran <Maximize2 className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 px-[18px] pb-3">
        <Legend color="bg-brand-red" label="Élevée" />
        <Legend color="bg-brand-blue" label="En cours" />
        <Legend color="bg-brand-green" label="Traitée" />
        <Legend color="bg-brand-ink" label="Caserne" />
      </div>

      <div className="relative mx-3.5 mb-3.5 h-[420px] overflow-hidden rounded-md border border-brand-line bg-gradient-to-b from-[#F0F3F8] to-[#E8ECF3]">
        {/* Faint tactical grid */}
        <svg className="absolute inset-0 opacity-55" viewBox="0 0 400 420" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="#D7DCE4" strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="400" height="420" fill="url(#grid)" />
        </svg>

        {/* Soft zone tints, purely decorative */}
        <svg className="absolute inset-0" viewBox="0 0 400 420" width="100%" height="100%">
          <circle cx="220" cy="190" r="70" fill="#E4EEF6" opacity={0.7} />
          <circle cx="90" cy="320" r="50" fill="#E9F3EC" opacity={0.6} />
        </svg>

        {/* Radar sweep — the signature "command center" flourish */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-px">
          <div className="absolute -left-px -top-[260px] h-[260px] w-0.5 origin-bottom animate-sweep bg-gradient-to-b from-brand-red/35 to-transparent" />
          <div
            className="absolute -left-[260px] -top-[260px] h-[520px] w-[520px] origin-center animate-sweep rounded-full"
            style={{ background: "conic-gradient(from 0deg, rgba(229,57,53,.14), transparent 55deg)" }}
          />
        </div>

        {/* Fire station */}
        <div
          className="absolute z-[3] flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink shadow-[0_0_0_5px_rgba(27,33,48,.12)]"
          style={{ top: "52%", left: "47%" }}
          title="Caserne Centrale"
        >
          <Siren className="h-[15px] w-[15px] text-white" strokeWidth={2} />
        </div>

        {/* Alert markers */}
        {alerts.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelectAlert(a.id)}
            title={`${a.location}`}
            className={`absolute z-[2] h-4 w-4 -translate-x-1/2 -translate-y-full ${MARKER_CLASSES[a.status]}`}
            style={{ top: `${a.position.y}%`, left: `${a.position.x}%` }}
          >
            <MapPin className="h-full w-full fill-current drop-shadow" strokeWidth={0} />
            {a.status !== "terminee" && (
              <span className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1.5 animate-markerPulse rounded-full bg-current" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-[18px] pb-4">
        <div className="font-mono text-[10.5px] text-brand-muted">{centerLabel}</div>
        <button className="flex items-center gap-1 text-[11.5px] font-semibold text-brand-red">
          Recentrer <Crosshair className="h-3 w-3" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-brand-muted">
      <span className={`h-[7px] w-[7px] rounded-full ${color}`} />
      {label}
    </div>
  );
}
