"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Shield, 
  Building2, 
  Bell, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  RefreshCw,
  Share2,
  Filter
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface SuperAdminStats {
  totalCasernes: number;
  totalAlertes: number;
  totalCitoyens: number;
  alertesEnAttente: number;
  interventionsEnCours: number;
  interventionsTransferees: number;
  interventionsTerminees: number;
  alertesRefuseesOuAnnulees: number;
  alertesParType: Record<string, number>;
}

interface Caserne {
  id: number;
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
  latitude?: number;
  longitude?: number;
}

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [casernes, setCasernes] = useState<Caserne[]>([]);
  const [selectedCaserne, setSelectedCaserne] = useState<string>("ALL"); // 👈 État pour le filtre caserne
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userString);
    if (user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchData(user.role, selectedCaserne);
  }, [router, selectedCaserne]); // 👈 Recharge les données dès que la caserne sélectionnée change

  const fetchData = async (role: string, caserneFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Admin-Role": role,
      };

      // Construction de l'URL avec paramètre caserne si sélectionnée
      const statsUrl = caserneFilter !== "ALL"
        ? `http://localhost:8080/api/super-admin/stats?caserne=${encodeURIComponent(caserneFilter)}`
        : "http://localhost:8080/api/super-admin/stats";

      const [statsRes, casernesRes] = await Promise.all([
        fetch(statsUrl, { headers }),
        fetch("http://localhost:8080/api/super-admin/casernes", { headers }),
      ]);

      if (!statsRes.ok || !casernesRes.ok) {
        throw new Error("Erreur lors de la récupération des données d'administration.");
      }

      const statsData = await statsRes.json();
      const casernesData = await casernesRes.json();

      setStats(statsData);
      setCasernes(casernesData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Préparation des données graphiques
  const statusChartData = stats ? [
    { name: "En attente", valeur: stats.alertesEnAttente, color: "#f59e0b" },
    { name: "En cours", valeur: stats.interventionsEnCours, color: "#3b82f6" },
    { name: "Transférées", valeur: stats.interventionsTransferees, color: "#8b5cf6" },
    { name: "Terminées", valeur: stats.interventionsTerminees, color: "#10b981" },
    { name: "Refusées/Annulées", valeur: stats.alertesRefuseesOuAnnulees, color: "#ef4444" },
  ] : [];

  const typeChartData = stats?.alertesParType 
    ? Object.entries(stats.alertesParType).map(([type, count]) => ({
        name: type,
        value: count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-6 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header Sombre avec Logo + Dropdown Filtre */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-800 bg-[#14171d]/90 p-6 backdrop-blur-md overflow-visible">
          <div className="flex items-center gap-4">
            <div className="-my-6 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Secours+ Logo"
                width={110}
                height={110}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Supervision Nationale</h1>
              </div>
              <p className="text-xs text-gray-400">Centre de commandement global — Secours+</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 🔽 Dropdown Sélection de Caserne */}
            <div className="relative flex items-center">
              <Building2 className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCaserne}
                onChange={(e) => setSelectedCaserne(e.target.value)}
                className="appearance-none rounded-xl border border-gray-700 bg-gray-900/80 pl-9 pr-8 py-2.5 text-xs font-semibold text-gray-200 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">Toutes les casernes (Vue Globale)</option>
                {casernes.map((c) => (
                  <option key={c.id} value={c.caserne}>
                    {c.caserne}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton Actualiser */}
            <button
              onClick={() => {
                const userString = localStorage.getItem("user");
                if (userString) fetchData(JSON.parse(userString).role, selectedCaserne);
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Métriques */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {selectedCaserne === "ALL" ? "Casernes Actives" : "Filtre Actif"}
                </span>
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-white truncate">
                {selectedCaserne === "ALL" ? stats.totalCasernes : selectedCaserne}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Alertes Enregistrées</span>
                <Bell className="h-5 w-5 text-red-400" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-white">{stats.totalAlertes}</p>
            </div>

            <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Citoyens Inscrits</span>
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-white">{stats.totalCitoyens}</p>
            </div>

            <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Interventions En Cours</span>
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-amber-400">{stats.interventionsEnCours}</p>
            </div>
          </div>
        )}

        {/* Section Graphiques */}
        {stats && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Graphique 1: Répartition par statut */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-800/80 bg-[#14171d] p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                Répartition Opérationnelle des Alertes
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "12px", color: "#fff" }}
                    />
                    <Bar dataKey="valeur" radius={[6, 6, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique 2: Alertes par Type */}
            <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                Alertes par Catégorie
              </h2>
              <div className="h-64 w-full flex items-center justify-center">
                {typeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "12px", color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">Aucune donnée disponible</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tableau Réseau des Casernes */}
        <div className="rounded-2xl border border-gray-800/80 bg-[#14171d] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Réseau des Casernes
            </h2>
            <span className="text-xs text-gray-500">{casernes.length} enregistrée(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-black/30 text-xs uppercase text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Caserne / Affectation</th>
                  <th className="px-4 py-3">Rôle System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {casernes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-200">{c.nomComplet}</td>
                    <td className="px-4 py-3 text-gray-400">{c.telephone}</td>
                    <td className="px-4 py-3 text-gray-300">{c.caserne}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-950/60 border border-blue-800/50 px-2.5 py-1 text-xs font-semibold text-blue-400">
                        {c.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}