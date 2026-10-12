"use client";

import { useState } from "react";
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
  Users,
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

import TransferModal from "./TransferModal";

// =========================================================
// CARTE MINIATURE
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
  isOpen?: boolean;
  onClose: () => void;
  onAccept: (id: number) => void;
  onTransfer: (id: number, targetCaserne: string) => Promise<void>;
  onRefuse: (id: number) => void;
  onTerminate?: (id: number) => void;
  currentCaserne?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// =========================================================
// COMPOSANT PRINCIPAL
// =========================================================

export default function AlertDetailDrawer({
  alert,
  isOpen = true,
  onClose,
  onAccept,
  onTransfer,
  onRefuse,
  onTerminate,
  currentCaserne = "",
}: AlertDetailDrawerProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  if (!isOpen || !alert) {
    return null;
  }

  const Icon = TYPE_ICON[alert.type];

  // Récupération sécurisée du nombre de victimes
  const victimCount =
    (alert as any).victims ??
    (alert as any).nombreVictimes ??
    (alert as any).victimsCount ??
    0;

  // Récupération des données de transfert (émetteur & destinataire)
  const isTransferred =
    alert.status === "TRANSFERRED" || alert.status === "transferee";
  const caserneEmetteur = alert.caserneTransfertPar || currentCaserne;
  const caserneDestinataire =
    alert.caserneTransfertA || (alert as any).caserneDestinataire || "Inconnue";

  // =========================================================
  // COORDONNÉES GPS
  // =========================================================

  const parseCoordinates = (): [number, number] => {
    const latitude = (alert as any).latitude;
    const longitude = (alert as any).longitude;

    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return [lat, lng];
      }
    }

    if (alert.gps) {
      const parts = alert.gps
        .split(",")
        .map((part) => parseFloat(part.trim()));

      if (
        parts.length === 2 &&
        !Number.isNaN(parts[0]) &&
        !Number.isNaN(parts[1])
      ) {
        return [parts[0], parts[1]];
      }
    }

    return [12.6392, -8.0029];
  };

  const coords = parseCoordinates();
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;

  return (
    <>
      <AnimatePresence>
        {/* OVERLAY / BACKDROP */}
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm"
        />

        {/* DRAWER */}
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
          {/* EN-TÊTE */}
          <div className="relative border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                    TYPE_ICON_CLASSES[alert.type] ??
                    "bg-red-600/20 text-red-500"
                  }`}
                >
                  {Icon && <Icon className="h-6 w-6" strokeWidth={2} />}
                </div>

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

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* BADGES */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  STATUS_BADGE_CLASSES[alert.status] ??
                  "bg-slate-800 text-slate-300"
                }`}
              >
                {STATUS_LABEL[alert.status] ?? alert.status}
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-bold ${
                  PRIORITY_TEXT_CLASSES[alert.priority] ?? "text-slate-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    PRIORITY_DOT_CLASSES[alert.priority] ?? "bg-slate-400"
                  }`}
                />
                Priorité : {PRIORITY_LABEL[alert.priority] ?? alert.priority}
              </span>
            </div>
          </div>

          {/* CONTENU */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto bg-slate-50/50">
            {/* AFFICHAGE EN-TÊTE DE TRANSFERT */}
            {isTransferred && (
              <div className="m-4 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-blue-900 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  <span>Alerte transférée</span>
                </div>
                
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  <p className="text-slate-700">
                    Transférée par :{" "}
                    <strong className="font-semibold text-slate-900">
                      {caserneEmetteur}
                    </strong>
                  </p>
                  <p className="text-slate-700">
                    Transférée à :{" "}
                    <strong className="font-semibold text-blue-700">
                      {caserneDestinataire}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            <Section label="Nature de l'incident">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs leading-relaxed text-slate-800 shadow-sm">
                {alert.description || "Aucune description fournie."}
              </div>
            </Section>

            {/* REQUÉRANT */}
            <Section label="Requérant / Signalement">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">
                      {alert.reporterName || "Anonyme"}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {alert.reporterPhone || "Numéro non communiqué"}
                    </div>
                  </div>
                </div>

                {alert.reporterPhone && (
                  <a
                    href={`tel:${alert.reporterPhone.replace(/\s/g, "")}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                    title="Appeler le requérant"
                  >
                    <Phone className="h-4 w-4" strokeWidth={2} />
                  </a>
                )}
              </div>
            </Section>

            {/* LOCALISATION & VICTIMES */}
            <Section label="Localisation & Bilan humain">
              <div className="mb-3 grid grid-cols-3 gap-2">
                <InfoCard
                  icon={MapPin}
                  label="Adresse"
                  value={alert.location || "Non précisée"}
                />

                <InfoCard
                  icon={Crosshair}
                  label="GPS"
                  value={`${coords[0].toFixed(3)}, ${coords[1].toFixed(3)}`}
                  mono
                />

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span>Victimes</span>
                  </div>
                  <div className="mt-1 font-mono text-xs font-extrabold text-amber-900">
                    {victimCount > 0 ? `${victimCount} victime(s)` : "Aucune"}
                  </div>
                </div>
              </div>

              {/* Carte Leaflet MiniMap */}
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

            {/* PHOTOS */}
            <Section
              label={`Photos jointes ${
                alert.photosCount ? `(${alert.photosCount})` : ""
              }`}
            >
              {alert.photoPaths && alert.photoPaths.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {alert.photoPaths.map((photoPath, index) => {
                    const filename = photoPath.split(/[\\/]/).pop();
                    const photoUrl = `${API_BASE_URL}/api/alerts/photos/${filename}`;

                    return (
                      <a
                        key={index}
                        href={photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={photoUrl}
                          alt={`Photo ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  <span>Aucune photo transmise avec cette alerte.</span>
                </div>
              )}
            </Section>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onAccept(alert.id)}
                className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Engager</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
              >
                <ArrowRightLeft className="h-5 w-5 text-slate-600" />
                <span>Transférer</span>
              </button>

              <button
                onClick={() => onRefuse(alert.id)}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Refuser</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MODAL DE TRANSFERT */}
      <TransferModal
        isOpen={isTransferModalOpen}
        alertId={alert.id}
        currentCaserne={currentCaserne}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={async (id: number, target: string) => {
          await onTransfer(id, target);
          setIsTransferModalOpen(false);
        }}
      />
    </>
  );
}

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