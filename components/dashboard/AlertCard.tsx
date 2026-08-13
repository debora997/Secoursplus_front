"use client";

import { forwardRef } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Car, Check } from "lucide-react"; // 👈 Ajout de Check
import { EmergencyAlert, TYPE_LABEL, STATUS_LABEL, PRIORITY_LABEL } from "@/types/alert";
import {
  TYPE_ICON,
  TYPE_ICON_CLASSES,
  STATUS_BADGE_CLASSES,
  PRIORITY_DOT_CLASSES,
  PRIORITY_TEXT_CLASSES,
} from "@/lib/alertStyles";

interface AlertCardProps {
  alert: EmergencyAlert;
  onViewDetails: (id: number) => void;
  onTerminate?: (id: number) => void; // 👈 Nouvelle prop ajoutée
  highlighted?: boolean;
}

const AlertCard = forwardRef<HTMLDivElement, AlertCardProps>(function AlertCard(
  { alert, onViewDetails, onTerminate, highlighted }, // 👈 Destructuration de onTerminate
  ref
) {
  const Icon = TYPE_ICON[alert.type] ?? Car;
  const isHighPriority = alert.priority === "eleve" && alert.status !== "terminee";

  return (
    <div
      ref={ref}
      onClick={() => onViewDetails(alert.id)}
      className={`group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-xl border bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        highlighted
          ? "border-red-500 ring-2 ring-red-500/20"
          : "border-slate-200/80 hover:border-red-200"
      }`}
    >
      {/* Barre latérale indiquant l'urgence (Style Pompier) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isHighPriority
            ? "bg-red-600"
            : alert.status === "terminee"
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />

      {/* --- ICONE & TYPE --- */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Conteneur d'icône d'urgence */}
        <div
          className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-100 ${
            TYPE_ICON_CLASSES[alert.type] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
          
          {/* Signal d'alerte animé si priorité élevée */}
          {isHighPriority && (
            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
          )}
        </div>

        {/* Détails principaux */}
        <div className="min-w-0 flex-1">
          {/* Ligne 1 : Type d'alerte, ID et Statut */}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              {TYPE_LABEL[alert.type] ?? alert.type}
            </h3>
            <span className="text-[11px] font-mono font-medium text-slate-400">
              #{alert.id}
            </span>
            <span
              className={`ml-auto sm:ml-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                STATUS_BADGE_CLASSES[alert.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {STATUS_LABEL[alert.status] ?? alert.status}
            </span>
          </div>

          {/* Ligne 2 : Description courte */}
          {alert.description && (
            <p className="truncate text-xs text-slate-600 mt-0.5">
              {alert.description}
            </p>
          )}

          {/* Ligne 3 : Métadonnées (Lieu, Date, Priorité) */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {alert.location && (
              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
                <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">{alert.location}</span>
              </span>
            )}

            {(alert.date || alert.time) && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3 text-slate-400" strokeWidth={2} />
                <span>
                  {alert.time} {alert.date ? `• ${alert.date}` : ""}
                </span>
              </span>
            )}

            {alert.priority && (
              <span
                className={`flex items-center gap-1 font-bold ${
                  PRIORITY_TEXT_CLASSES[alert.priority] ?? "text-slate-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    PRIORITY_DOT_CLASSES[alert.priority] ?? "bg-slate-400"
                  }`}
                />
                {PRIORITY_LABEL[alert.priority] ?? alert.priority}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- BOUTONS D'ACTION --- */}
      <div className="flex-shrink-0 self-center flex items-center gap-2">
        {/* 🟢 BOUTON TERMINER (S'affiche si l'alerte est "encours" et que onTerminate est fourni) */}
        {alert.status === "encours" && onTerminate && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Évite de déclencher le onViewDetails de la carte globale
              onTerminate(alert.id);
            }}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-700 hover:shadow-sm"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Terminer</span>
          </button>
        )}

        {/* Bouton Détails original */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(alert.id);
          }}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-600 hover:shadow-sm"
        >
          <span className="hidden sm:inline">Détails</span>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

export default AlertCard;