"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  X,
  MapPin,
  Crosshair,
  Phone,
  CheckCircle2,
  ArrowRightLeft,
  XCircle,
  User,
  Image as ImageIcon,
  ExternalLink,
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

// =========================================================
// CARTE LEAFLET
// =========================================================

const MiniMap = dynamic(() => import("../MiniMapDrawer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-36 w-full items-center justify-center rounded-xl bg-slate-900 font-mono text-xs text-slate-400">
      Chargement du signal GPS...
    </div>
  ),
});

// =========================================================
// PROPS
// =========================================================

interface AlertDetailDrawerProps {
  alert: EmergencyAlert | null;
  onClose: () => void;
  onAccept: (id: number) => void;
  onTransfer: (id: number) => void;
  onRefuse: (id: number) => void;
}

// =========================================================
// API
// =========================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// =========================================================
// FONCTION POUR NORMALISER LA PRIORITÉ
// =========================================================
// Même si une ancienne donnée contient "modere", "modéré",
// "grave", "critique", etc., on obtient toujours une valeur
// compatible avec EmergencyAlert["priority"].
// =========================================================

function normalizePriority(
  priority: string | undefined | null
): EmergencyAlert["priority"] {
  if (!priority) {
    return "moyen";
  }

  const normalized = priority
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  switch (normalized) {
    // -------------------------------------------------------
    // PRIORITÉ ÉLEVÉE
    // -------------------------------------------------------

    case "eleve":
    case "élevé":
    case "grave":
    case "critique":
    case "urgent":
    case "urgence":
      return "eleve";

    // -------------------------------------------------------
    // PRIORITÉ MOYENNE
    // -------------------------------------------------------

    case "moyen":
    case "moyenne":
    case "modere":
    case "modéré":
    case "moderé":
      return "moyen";

    // -------------------------------------------------------
    // PRIORITÉ FAIBLE
    // -------------------------------------------------------

    case "faible":
    case "bas":
    return "faible";

    default:
      return "moyen";
  }
}

// =========================================================
// COMPONENT
// =========================================================

export default function AlertDetailDrawer({
  alert,
  onClose,
  onAccept,
  onTransfer,
  onRefuse,
}: AlertDetailDrawerProps) {
  const Icon = alert ? TYPE_ICON[alert.type] : null;

  // =========================================================
  // PRIORITÉ NORMALISÉE
  // =========================================================

  const normalizedPriority = alert
    ? normalizePriority(alert.priority)
    : "moyen";

  // =========================================================
  // COORDONNÉES GPS
  // =========================================================

  const parseCoordinates = (): [number, number] => {
    if (!alert) {
      return [12.6392, -8.0029];
    }

    // Si les coordonnées existent directement
    if (
      (alert as any).latitude != null &&
      (alert as any).longitude != null
    ) {
      return [
        Number((alert as any).latitude),
        Number((alert as any).longitude),
      ];
    }

    // Sinon on utilise alert.gps
    if (alert.gps) {
      const parts = alert.gps
        .split(",")
        .map((p) => parseFloat(p.trim()));

      if (
        parts.length === 2 &&
        !isNaN(parts[0]) &&
        !isNaN(parts[1])
      ) {
        return [parts[0], parts[1]];
      }
    }

    // Position par défaut : Bamako
    return [12.6392, -8.0029];
  };

  const coords = parseCoordinates();

  // =========================================================
  // GOOGLE MAPS
  // =========================================================

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

  // =========================================================
  // ACTION
  // =========================================================

  const handleAction = (action: (id: number) => void) => {
    if (!alert) return;

    action(alert.id);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AnimatePresence>
      {alert && (
        <>
          {/* =================================================
              BACKDROP
          ================================================= */}

          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm"
          />

          {/* =================================================
              DRAWER
          ================================================= */}

          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
            }}
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[520px] flex-col bg-white shadow-2xl"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="relative border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* ICÔNE TYPE */}

                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                      TYPE_ICON_CLASSES[alert.type] ??
                      "bg-red-600/20 text-red-500"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className="h-6 w-6"
                        strokeWidth={2}
                      />
                    )}
                  </div>

                  {/* TITRE */}

                  <div>
                    <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-slate-400">
                      <span>DOSSIER #{alert.id}</span>

                      <span>•</span>

                      <span>
                        {alert.time} ({alert.date})
                      </span>
                    </div>

                    <h2 className="text-lg font-bold tracking-tight text-white">
                      {TYPE_LABEL[alert.type] ?? alert.type}
                    </h2>
                  </div>
                </div>

                {/* FERMER */}

                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <X
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* =================================================
                  BADGES
              ================================================= */}

              <div className="mt-3 flex items-center gap-2">
                {/* STATUT */}

                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    STATUS_BADGE_CLASSES[alert.status] ??
                    "bg-slate-800 text-slate-300"
                  }`}
                >
                  {STATUS_LABEL[alert.status] ??
                    alert.status}
                </span>

                {/* PRIORITÉ */}

                <span
                  className={`flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-bold ${
                    PRIORITY_TEXT_CLASSES[
                      normalizedPriority
                    ] ?? "text-slate-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      PRIORITY_DOT_CLASSES[
                        normalizedPriority
                      ] ?? "bg-slate-400"
                    }`}
                  />

                  Priorité :{" "}
                  {PRIORITY_LABEL[normalizedPriority] ??
                    "Priorité moyenne"}
                </span>
              </div>
            </div>

            {/* =================================================
                CONTENU
            ================================================= */}

            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto bg-slate-50/50">
              {/* =================================================
                  NATURE INCIDENT
              ================================================= */}

              <Section label="Nature de l'incident">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs leading-relaxed text-slate-800 shadow-sm">
                  {alert.description ||
                    "Aucune description fournie."}
                </div>
              </Section>

              {/* =================================================
                  REQUÉRANT
              ================================================= */}

              <Section label="Requérant / Signalement">
                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-900">
                        {alert.reporterName ||
                          "Anonyme"}
                      </div>

                      <div className="font-mono text-[11px] text-slate-500">
                        {alert.reporterPhone ||
                          "Numéro non communiqué"}
                      </div>
                    </div>
                  </div>

                  {alert.reporterPhone && (
                    <a
                      href={`tel:${alert.reporterPhone.replace(
                        /\s/g,
                        ""
                      )}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                      title="Appeler le requérant"
                    >
                      <Phone
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </a>
                  )}
                </div>
              </Section>

              {/* =================================================
                  LOCALISATION
              ================================================= */}

              <Section label="Localisation exacte des secours">
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <InfoCard
                    icon={MapPin}
                    label="Adresse"
                    value={
                      alert.location ||
                      "Non précisée"
                    }
                  />

                  <InfoCard
                    icon={Crosshair}
                    label="Coordonnées GPS"
                    value={`${coords[0].toFixed(
                      4
                    )}, ${coords[1].toFixed(4)}`}
                    mono
                  />
                </div>

                {/* CARTE */}

                <div className="relative overflow-hidden rounded-xl border border-slate-300 shadow-sm">
                  <MiniMap coords={coords} />

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 z-[400] flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-slate-900"
                  >
                    <span>Itinéraire GPS</span>

                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Section>

              {/* =================================================
                  PHOTOS
              ================================================= */}

              <Section
                label={`Photos jointes ${
                  alert.photosCount
                    ? `(${alert.photosCount})`
                    : ""
                }`}
              >
                {alert.photoPaths &&
                alert.photoPaths.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {alert.photoPaths.map(
                      (photoPath, i) => {
                        const filename =
                          photoPath
                            .split(/[\\/]/)
                            .pop();

                        const photoUrl = `${API_BASE_URL}/api/alerts/photos/${filename}`;

                        return (
                          <a
                            key={i}
                            href={photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                          >
                            <img
                              src={photoUrl}
                              alt={`Photo ${
                                i + 1
                              }`}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </a>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    <ImageIcon className="h-4 w-4 text-slate-400" />

                    <span>
                      Aucune photo transmise avec
                      cette alerte.
                    </span>
                  </div>
                )}
              </Section>
            </div>

            {/* =================================================
                BOUTONS
            ================================================= */}

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-2">
                {/* ENGAGER */}

                <button
                  onClick={() =>
                    handleAction(onAccept)
                  }
                  className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
                >
                  <CheckCircle2 className="h-5 w-5" />

                  <span>Engager</span>
                </button>

                {/* TRANSFÉRER */}

                <button
                  onClick={() =>
                    handleAction(onTransfer)
                  }
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
                >
                  <ArrowRightLeft className="h-5 w-5 text-slate-600" />

                  <span>Transférer</span>
                </button>

                {/* REFUSER */}

                <button
                  onClick={() =>
                    handleAction(onRefuse)
                  }
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                >
                  <XCircle className="h-5 w-5 text-red-600" />

                  <span>Refuser</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =========================================================
// SECTION
// =========================================================

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </div>

      {children}
    </div>
  );
}

// =========================================================
// INFO CARD
// =========================================================

function InfoCard({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
        <Icon className="h-3 w-3 text-red-500" />

        <span>{label}</span>
      </div>

      <div
        className={`mt-1 truncate text-xs font-bold text-slate-800 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}