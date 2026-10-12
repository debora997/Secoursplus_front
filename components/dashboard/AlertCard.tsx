"use client";

import { forwardRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Car,
  Check,
  Users,
  Building2,
  ArrowRightLeft,
} from "lucide-react";
import {
  EmergencyAlert,
  TYPE_LABEL,
  STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/types/alert";
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
  onTerminate?: (id: number) => void;
  highlighted?: boolean;
}

const AlertCard = forwardRef<HTMLDivElement, AlertCardProps>(function AlertCard(
  { alert, onViewDetails, onTerminate, highlighted },
  ref
) {
  const Icon = TYPE_ICON[alert.type] ?? Car;
  const isHighPriority =
    alert.priority === "eleve" && alert.status !== "terminee";

  // Extraction du nombre de victimes (avec fallback à 0)
  const victimsCount =
    alert.victims ??
    (alert as any).victimsCount ??
    (alert as any).nombreVictimes ??
    0;

  const isTransferred =
    alert.status === "TRANSFERRED" || alert.status === "transferee";

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
          {/* Ligne 1 : Type d'alerte, ID, Nombre de victimes & Statut */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              {TYPE_LABEL[alert.type] ?? alert.type}
            </h3>

            <span className="text-[11px] font-mono font-medium text-slate-400">
              #{alert.id}
            </span>

            {/* BADGE VICTIMES LIGNE 1 */}
            {victimsCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                <Users className="h-3 w-3 text-amber-600" />
                <span>
                  {victimsCount} {victimsCount > 1 ? "victimes" : "victime"}
                </span>
              </span>
            )}

            <span
              className={`ml-auto whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                STATUS_BADGE_CLASSES[alert.status] ??
                "bg-slate-100 text-slate-700"
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

          {/* Ligne 3 : Prise en charge par une caserne (Alerte En cours) */}
          {alert.status === "encours" && alert.caserne && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <Building2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>
                Prise en charge :{" "}
                <strong className="font-bold text-amber-950">
                  {alert.caserne}
                </strong>
              </span>
            </div>
          )}

          {/* Ligne 3 bis : Caserne émettrice / réceptrice si alerte transférée */}
          {isTransferred && alert.caserneTransfertPar && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>
                Transférée par :{" "}
                <strong className="font-bold text-blue-950">
                  {alert.caserneTransfertPar}
                </strong>
                {alert.caserneTransfertA && (
                  <>
                    {" ➔ "}
                    <strong className="font-bold text-blue-800">
                      {alert.caserneTransfertA}
                    </strong>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Ligne 4 : Métadonnées (Lieu, Date, Priorité) */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {alert.location && (
              <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
                <MapPin
                  className="h-3 w-3 text-red-500 flex-shrink-0"
                  strokeWidth={2}
                />
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
        {/* 🟢 BOUTON TERMINER */}
        {alert.status === "encours" && onTerminate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTerminate(alert.id);
            }}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-700 hover:shadow-sm"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Terminer</span>
          </button>
        )}

        {/* Bouton Détails */}
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