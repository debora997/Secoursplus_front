"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { EmergencyAlert, TYPE_LABEL, PRIORITY_LABEL } from "@/types/alert";
import { TYPE_ICON, TYPE_ICON_CLASSES } from "@/lib/alertStyles";

interface NewAlertPopupProps {
  alert: EmergencyAlert | null;
  onClose: () => void;
  onDetails: (id: number) => void;
}

export default function NewAlertPopup({
  alert,
  onClose,
  onDetails,
}: NewAlertPopupProps) {
  if (!alert) return null;

  const Icon = TYPE_ICON[alert.type];

  // Gestion des indicateurs visuels selon la priorité/gravité
  const getPriorityBadge = (priority: EmergencyAlert["priority"]) => {
    switch (priority) {
      case "moyen":
        return {
          label: PRIORITY_LABEL.moyen || "MODÉRÉE",
          dotColor: "bg-amber-500",
          textColor: "text-amber-700",
          bgColor: "bg-amber-50 border-amber-200/60",
        };
      case "eleve":
        return {
          label: PRIORITY_LABEL.eleve || "GRAVE",
          dotColor: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50 border-orange-200/60",
        };
      case "critique":
      default:
        return {
          label: PRIORITY_LABEL.critique || "CRITIQUE",
          dotColor: "bg-red-600",
          textColor: "text-red-700",
          bgColor: "bg-red-50 border-red-200/60",
        };
    }
  };

  const priorityStyle = getPriorityBadge(alert.priority);

  return (
    <AnimatePresence>
      <motion.div
        key={alert.id}
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed top-5 right-5 z-[100] w-[calc(100vw-32px)] sm:w-[360px] overflow-hidden rounded-xl border border-red-200 bg-white shadow-xl"
      >
        {/* Ligne décorative supérieure rouge pour accentuer l'urgence */}
        <div className="h-1 w-full bg-red-600" />

        <div className="p-3.5">
          {/* Ligne 1 : En-tête + Bouton Fermer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Voyant lumineux rouge avec animation de pulsation */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-600">
                NOUVELLE ALERTE
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Fermer la notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Ligne 2 & 3 : Type d'urgence & Gravité */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  TYPE_ICON_CLASSES[alert.type] ?? "bg-red-100 text-red-600"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" strokeWidth={2.2} />}
              </div>
              <span className="truncate text-sm font-bold text-slate-900">
                {TYPE_LABEL[alert.type] ?? alert.type}
              </span>
            </div>

            {/* Badge Gravité */}
            <div
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${priorityStyle.bgColor} ${priorityStyle.textColor}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dotColor}`} />
              <span>{priorityStyle.label}</span>
            </div>
          </div>

          {/* Ligne 4 : Citoyen + Heure */}
          <div className="mt-2 text-xs font-medium text-slate-500 truncate">
            <span>{alert.reporterName || "Anonyme"}</span>
            <span className="mx-1 text-slate-300">•</span>
            <span className="font-mono text-slate-600">{alert.time}</span>
          </div>

          {/* Action : Voir les détails */}
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5">
            <button
              onClick={() => onDetails(alert.id)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-sm"
            >
              <span>Voir les détails</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}