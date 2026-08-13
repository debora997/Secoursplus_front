"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Filter,
  ArrowLeft,
  Loader2,
  XCircle,
  Forward,
  Check,
} from "lucide-react";
import { connectWebSocket, disconnectWebSocket } from "@/services/websocket";

type Period = "24h" | "7d" | "30d" | "1y";

interface SectorStat {
  sectorName: string;
  count: number;
  avgDelay: string;
  mainCause: string;
  trend: string;
}

interface StatusDistribution {
  accepted?: number;
  rejected?: number;
  transferred?: number;
}

interface StatsData {
  totalInterventions: number;
  averageResponseTime: string;
  resolutionRate?: number;
  activeVehicles: string;
  statusDistribution?: StatusDistribution;
  incidentsByNature: Record<string, number>;
  topSectors: SectorStat[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fonction de chargement des statistiques avec useCallback
  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/alerts/stats?period=${period}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: StatsData = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error("Erreur de récupération des statistiques :", err);
      setError("Impossible de charger les statistiques depuis le serveur.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  // 2. Recharger les données quand la période sélectionnée change
  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [fetchStats]);

  // 3. Écoute WebSocket en temps réel pour mettre à jour les graphiques
  useEffect(() => {
    connectWebSocket((newAlert) => {
      console.log("🚨 Nouvelle alerte reçue via WebSocket, mise à jour des statistiques...", newAlert);
      fetchStats();
    });

    return () => {
      disconnectWebSocket();
    };
  }, [fetchStats]);

  // --- CALCULS SÉCURISÉS DES DÉCISIONS ET POURCENTAGES ---
  const acceptedCount = Number(stats?.statusDistribution?.accepted ?? 0);
  const transferredCount = Number(stats?.statusDistribution?.transferred ?? 0);
  const rejectedCount = Number(stats?.statusDistribution?.rejected ?? 0);

  // Total des alertes ayant fait l'objet d'une décision
  const totalDecisions = acceptedCount + transferredCount + rejectedCount;
  
  // Utiliser totalInterventions si disponible, sinon basculer sur totalDecisions
  const totalForPercent = (stats?.totalInterventions && stats.totalInterventions > 0)
    ? stats.totalInterventions
    : (totalDecisions || 1);

  // Calculs des pourcentages par rapport au total global
  const pctAccepted = Math.round((acceptedCount / totalForPercent) * 100);
  const pctTransferred = Math.round((transferredCount / totalForPercent) * 100);
  const pctRejected = Math.round((rejectedCount / totalForPercent) * 100);

  return (
    <div className="min-h-screen bg-slate-100/60 p-4 sm:p-6 lg:p-8">
      
      {/* BOUTON RETOUR À L'ACCUEIL */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>

      {/* --- EN-TÊTE AVEC LE LOGO --- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
            <img
              src="/images/logo.png"
              alt="Logo Secours+"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Analyse & Statistiques Opérationnelles
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Centre de Traitement de l'Alerte — SecoursPlus
            </p>
          </div>
        </div>

        {/* Sélecteur de Période */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <Calendar className="ml-2 h-4 w-4 text-slate-400" />
          {(["24h", "7d", "30d", "1y"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                period === p
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p === "24h" ? "24h" : p === "7d" ? "7j" : p === "30d" ? "30j" : "1 an"}
            </button>
          ))}
        </div>
      </div>

      {/* ETAT DE CHARGEMENT OU D'ERREUR */}
      {loading ? (
        <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="text-xs font-bold text-slate-500">
            Chargement des données backend...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs font-bold text-red-600">
          {error}
        </div>
      ) : stats ? (
        <>
          {/* --- KPI TOPS --- */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Alertes Reçues"
              value={(stats.totalInterventions ?? 0).toLocaleString()}
              periodText="sur la période sélectionnée"
              icon={Activity}
              color="text-red-600 bg-red-50"
            />
            <KpiCard
              title="Temps Moyen de Réponse"
              value={stats.averageResponseTime || "N/A"}
              periodText="temps moyen de prise en charge"
              icon={Clock}
              color="text-amber-600 bg-amber-50"
            />
            <KpiCard
              title="Taux d'Acceptation"
              value={`${pctAccepted}%`}
              periodText={`${acceptedCount} alertes validées`}
              icon={CheckCircle2}
              color="text-emerald-600 bg-emerald-50"
            />
            <KpiCard
              title="Engins Mobilisés"
              value={stats.activeVehicles || "0"}
              periodText="disponibilité opérationnelle"
              icon={ShieldAlert}
              color="text-blue-600 bg-blue-50"
            />
          </div>

          {/* --- TRAITEMENT DES ALERTES (ACCEPTÉES / TRANSFÉRÉES / REFUSÉES) --- */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Traitement et Décisions sur les Alertes
                </h2>
                <p className="text-xs text-slate-500">
                  Répartition des alertes acceptées, transférées vers d'autres services ou rejetées.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Total : {totalDecisions} décisions enregistrées
              </span>
            </div>

            {/* Barre Visuelle Segmentée */}
            <div className="mb-4 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctAccepted}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-l-full bg-emerald-500"
                title={`Acceptées: ${pctAccepted}%`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctTransferred}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-blue-500"
                title={`Transférées: ${pctTransferred}%`}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctRejected}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full rounded-r-full bg-rose-500"
                title={`Refusées: ${pctRejected}%`}
              />
            </div>

            {/* Cartes de Détails des Statuts */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* ACCEPTÉES */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Acceptées</div>
                    <div className="text-[10px] text-slate-500">Interventions déclenchées</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-700">
                    {acceptedCount}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">{pctAccepted}%</div>
                </div>
              </div>

              {/* TRANSFÉRÉES */}
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                    <Forward className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Transférées</div>
                    <div className="text-[10px] text-slate-500">Autres casernes / services</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-blue-700">
                    {transferredCount}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600">{pctTransferred}%</div>
                </div>
              </div>

              {/* REFUSÉES */}
              <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Refusées / Rejetées</div>
                    <div className="text-[10px] text-slate-500">Fausse alerte, hors compétence</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-rose-700">
                    {rejectedCount}
                  </div>
                  <div className="text-[10px] font-bold text-rose-600">{pctRejected}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RÉPARTITIONS PAR NATURE & HOTSPOTS --- */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Répartition des Incidents par Nature
                  </h2>
                </div>
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  <Filter className="h-3 w-3" /> Filtré
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {Object.entries(stats.incidentsByNature || {}).map(
                  ([nature, count]) => {
                    const total = stats.totalInterventions || 1;
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <ProgressBarCategory
                        key={nature}
                        label={nature}
                        count={count}
                        percentage={percentage}
                        color="bg-red-600"
                      />
                    );
                  }
                )}
              </div>
            </div>

            {/* SECTEURS CHAUDS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-900">
                Hotspots Géographiques
              </h2>
              <div className="space-y-3">
                {stats.topSectors?.map((sec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {sec.sectorName}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {sec.mainCause}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-700">
                        {sec.count} alertes
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sec.avgDelay}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

{/* Composants réutilisables */}
function KpiCard({ title, value, periodText, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-900">{value}</span>
      </div>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{periodText}</p>
    </div>
  );
}

function ProgressBarCategory({ label, count, percentage, color }: any) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">{label}</span>
        <span className="font-mono font-semibold text-slate-500">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}