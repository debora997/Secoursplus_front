"use client";

import { EmergencyAlert, TYPE_LABEL } from "@/types/alert";
import {
  X,
  Check,
  MapPin,
  Phone,
  UserRound,
  AlertTriangle,
  ArrowLeftRight,
  Minus,
  FileText,
} from "lucide-react";

interface NewAlertModalProps {
  alert: EmergencyAlert | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onTransfer: (id: number) => void;
  onDetails: (id: number) => void;
  onMinimize: () => void;
}

export default function NewAlertModal({
  alert,
  onAccept,
  onReject,
  onTransfer,
  onDetails,
  onMinimize,
}: NewAlertModalProps) {
  if (!alert) return null;

  // Helper pour exécuter l'action et s'assurer d'interrompre l'action/son
  const handleAction = (action: (id: number) => void) => {
    action(alert.id);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      {/* Conteneur principal - Modifié en Largeur Maximale (800px) */}
      <div className="relative w-full max-w-[820px] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        
        {/* =====================================================
            HEADER URGENCE (Barre supérieure compacte)
        ===================================================== */}
        <div className="relative overflow-hidden bg-red-600 px-6 py-4 text-white">
          {/* Effet clignotant subtil */}
          <div className="absolute inset-0 animate-pulse bg-red-500/20" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  NOUVELLE ALERTE ENTRANTE
                </h2>
                <p className="text-xs text-red-100">
                  Intervention immédiate requise
                </p>
              </div>
            </div>

            {/* Réduire */}
            <button
              onClick={onMinimize}
              title="Réduire"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>

        {/* =====================================================
            CONTENU EN 2 COLONNES (HORIZONTAL)
        ===================================================== */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          
          {/* --- COLONNE GAUCHE : DÉTAILS DE L'ALERTE & CITOYEN --- */}
          <div className="flex flex-col justify-between space-y-4">
            
            {/* Carte Type + Description */}
            <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-red-700">
                  {TYPE_LABEL[alert.type] || alert.type}
                </h3>
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Urgent
                </span>
              </div>

              <p className="line-clamp-3 text-xs leading-relaxed text-gray-700">
                {alert.description || "Aucune description fournie par le requérant."}
              </p>
            </div>

            {/* Carte Infos Citoyen & GPS */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Requérant & Localisation
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Nom */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200/80 text-gray-700">
                    <UserRound size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Nom</span>
                    <span className="font-semibold text-gray-800">{alert.reporterName}</span>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Phone size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Téléphone</span>
                    <span className="font-semibold text-gray-800">{alert.reporterPhone}</span>
                  </div>
                </div>

                {/* Position GPS */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Coordonnées GPS</span>
                    <span className="font-mono text-[11px] font-bold text-gray-800">{alert.gps}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- COLONNE DROITE : PANNEAU D'ACTIONS --- */}
          <div className="flex flex-col justify-center space-y-3 border-t border-gray-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            
            <div className="mb-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Prise de décision
              </span>
            </div>

            {/* ENGAGATION DE L'INTERVENTION */}
            <button
              onClick={() => handleAction(onAccept)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Check size={20} />
              Engager l'intervention
            </button>

            {/* TRANSFÉRER */}
            <button
              onClick={() => handleAction(onTransfer)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 py-3 font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
            >
              <ArrowLeftRight size={18} />
              Transférer l'alerte
            </button>

            {/* VOIR LES DÉTAILS */}
            <button
              onClick={() => handleAction(onDetails)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-[0.98]"
            >
              <FileText size={18} />
              Voir les détails
            </button>

            {/* REFUSER / REJETER */}
            <button
              onClick={() => handleAction(onReject)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/50 py-3 font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-[0.98]"
            >
              <X size={18} />
              Refuser l'alerte
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}