"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const LiveMapClient = dynamic(() => import("@/components/SuperAdminLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-140px)] w-full items-center justify-center rounded-2xl border border-gray-800 bg-[#14171d]">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
        <span className="text-sm font-medium">Chargement de la cartographie...</span>
      </div>
    </div>
  ),
});

export default function SuperAdminMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-800 bg-[#14171d]/90 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Carte Opérationnelle en Direct</h1>
            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20 animate-pulse">
              SIG LIVE
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Supervision géolocalisée des casernes et interventions
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all w-fit"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Seul le composant client doit être rendu ici */}
      <LiveMapClient />
    </div>
  );
}