"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AlertDetailDrawer from "@/components/dashboard/AlertDetailDrawer";
import { connectWebSocket } from "@/services/websocket";
import { EmergencyAlert, TYPE_LABEL } from "@/types/alert";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  RefreshCw,
  Building2,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/alerts";

type PeriodFilter = "today" | "week" | "month" | "year" | "all";
type StatusFilter = "all" | "nouvelle" | "encours" | "terminee";

export default function HistoryPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nom de la caserne actuellement connectée (Ex: Sogoniko)
  const [currentCaserne, setCurrentCaserne] = useState<string>("Sogoniko");

  useEffect(() => {
    // Récupération dynamique depuis le stockage local ou AuthContext si disponible
    const userCaserne = localStorage.getItem("caserneNom");
    if (userCaserne) setCurrentCaserne(userCaserne);
  }, []);

  // Filtres
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sélection pour le Drawer de détails
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  // =========================================================
  // MAPPER L'ALERTE BACKEND EN EmergencyAlert
  // =========================================================
  function normalizeSeverity(severity: any): string {
    return String(severity ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function mapSeverityToPriority(severity: any): EmergencyAlert["priority"] {
    const norm = normalizeSeverity(severity);
    if (norm === "grave" || norm === "critique") return "eleve";
    return "moyen";
  }

  const formatAlert = useCallback((alert: any): EmergencyAlert => {
    let mappedStatus: EmergencyAlert["status"] = "nouvelle";
    if (alert.status === "RECEIVED") mappedStatus = "nouvelle";
    else if (
      alert.status === "IN_PROGRESS" ||
      alert.status === "ACCEPTED" ||
      alert.status === "ENGAGED"
    )
      mappedStatus = "encours";
    else if (
      alert.status === "TERMINATED" ||
      alert.status === "REJECTED" ||
      alert.status === "REFUSED"
    )
      mappedStatus = "terminee";

    return {
      id: alert.id,
      type: alert.type ? alert.type.toLowerCase() : "accident",
      status: mappedStatus,
      priority: mapSeverityToPriority(alert.severity),
      caserne: alert.caserne ?? alert.caserneNom ?? null, // Mappage de la caserne
      date: alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("fr-FR") : "",
      time: alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "",
      createdAt: alert.createdAt ?? new Date().toISOString(),
      location: "Position GPS",
      latitude: alert.latitude ?? null,
      longitude: alert.longitude ?? null,
      position: { x: 50, y: 50 },
      description: alert.description ?? "",
      reporterName: alert.citoyenNom ?? "Citoyen",
      reporterPhone: alert.citoyenTelephone ?? "Non disponible",
      gps:
        alert.latitude != null && alert.longitude != null
          ? `${alert.latitude}, ${alert.longitude}`
          : "Position non disponible",
      photosCount: alert.photoPaths?.length ?? 0,
      photoPaths: alert.photoPaths ?? [],
    };
  }, []);

  // =========================================================
  // CHARGEMENT INITIAL EN BASE DE DONNÉES
  // =========================================================
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erreur lors de la récupération de l'historique");
      const data = await response.json();
      const formatted = data.map(formatAlert);
      setAlerts(formatted);
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  }, [formatAlert]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // =========================================================
  // WEBSOCKET EN TEMPS RÉEL
  // =========================================================
  useEffect(() => {
    const unsubscribe: (() => void) | void = connectWebSocket((nouvelleAlerte) => {
      const alertFormatted = formatAlert(nouvelleAlerte);

      setAlerts((prevAlerts) => {
        const exists = prevAlerts.some((a) => a.id === alertFormatted.id);
        if (exists) {
          return prevAlerts.map((a) => (a.id === alertFormatted.id ? alertFormatted : a));
        }
        return [alertFormatted, ...prevAlerts];
      });
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [formatAlert]);

  // =========================================================
  // LOGIQUE DE FILTRAGE TEMPOREL ET RECHERCHE
  // =========================================================
  const filteredAlerts = useMemo(() => {
    const now = new Date();

    return alerts.filter((alert) => {
      const alertDate = new Date(alert.createdAt);
      if (isNaN(alertDate.getTime())) return false;

      let matchesPeriod = true;
      if (period === "today") {
        matchesPeriod =
          alertDate.getDate() === now.getDate() &&
          alertDate.getMonth() === now.getMonth() &&
          alertDate.getFullYear() === now.getFullYear();
      } else if (period === "week") {
        const startOfWeek = new Date(now);
        const day = now.getDay() || 7;
        startOfWeek.setDate(now.getDate() - day + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        matchesPeriod = alertDate >= startOfWeek;
      } else if (period === "month") {
        matchesPeriod =
          alertDate.getMonth() === now.getMonth() &&
          alertDate.getFullYear() === now.getFullYear();
      } else if (period === "year") {
        matchesPeriod = alertDate.getFullYear() === now.getFullYear();
      }

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = alert.status === statusFilter;
      }

      let matchesSearch = true;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          alert.reporterName.toLowerCase().includes(query) ||
          alert.reporterPhone.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query) ||
          (alert.caserne ?? "").toLowerCase().includes(query) ||
          alert.id.toString().includes(query) ||
          (TYPE_LABEL[alert.type] ?? "").toLowerCase().includes(query);
      }

      return matchesPeriod && matchesStatus && matchesSearch;
    });
  }, [alerts, period, statusFilter, searchQuery]);

  // =========================================================
  // STATISTIQUES EN TÊTE
  // =========================================================
  const stats = useMemo(() => {
    const total = filteredAlerts.length;
    const terminees = filteredAlerts.filter((a) => a.status === "terminee").length;
    const encours = filteredAlerts.filter((a) => a.status === "encours").length;
    const nouvelles = filteredAlerts.filter((a) => a.status === "nouvelle").length;
    return { total, terminees, encours, nouvelles };
  }, [filteredAlerts]);

  const getStatusBadge = (status: EmergencyAlert["status"]) => {
    switch (status) {
      case "nouvelle":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            Nouvelle
          </span>
        );
      case "encours":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            En cours
          </span>
        );
      case "terminee":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Terminée
          </span>
        );
    }
  };

  const getCaserneBadge = (caserne?: string) => {
    if (!caserne) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
          Non assignée
        </span>
      );
    }

    const isOurCaserne = caserne.toLowerCase() === currentCaserne.toLowerCase();

    if (isOurCaserne) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          {caserne} (Notre caserne)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
        <Building2 className="h-3.5 w-3.5 text-purple-600" />
        {caserne}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* TÊTE DE PAGE */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Historique des Alertes</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Temps réel
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Consultez et filtrez l'ensemble des interventions enregistrées en base de données.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>

          {/* INDICATEURS KPI */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total affiché</span>
                <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Terminées</span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-600">{stats.terminees}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">En cours</span>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-amber-600">{stats.encours}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Nouvelles / Non traitées</span>
                <div className="rounded-lg bg-red-50 p-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-red-600">{stats.nouvelles}</p>
            </div>
          </div>

          {/* BARRE DE FILTRES ET RECHERCHE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* FILTRE DE PÉRIODE */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-100 p-1">
                {[
                  { id: "today", label: "Aujourd'hui" },
                  { id: "week", label: "Cette semaine" },
                  { id: "month", label: "Ce mois" },
                  { id: "year", label: "Cette année" },
                  { id: "all", label: "Tout l'historique" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPeriod(item.id as PeriodFilter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      period === item.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* RECHERCHE & STATUT */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2 pr-8 text-sm font-medium text-gray-700 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="nouvelle">Nouvelles</option>
                    <option value="encours">En cours</option>
                    <option value="terminee">Terminées</option>
                  </select>
                  <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher (nom, type, caserne)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU HISTORIQUE */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-red-600" />
                <p className="mt-2 text-sm text-gray-500">Chargement de l'historique...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm font-semibold text-gray-900">{error}</p>
                <button
                  onClick={fetchHistory}
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <h3 className="mt-2 text-base font-semibold text-gray-900">Aucune alerte trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun enregistrement ne correspond à vos critères de filtrage actuels.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">ID & Date</th>
                      <th className="px-6 py-4">Type d'urgence</th>
                      <th className="px-6 py-4">Citoyen / Contact</th>
                      <th className="px-6 py-4">Prise en charge par</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAlerts.map((alert) => (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className="hover:bg-gray-50/80 cursor-pointer transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">#ALERT-{alert.id}</div>
                          <div className="text-xs text-gray-500">
                            {alert.date} à {alert.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 capitalize">
                            {TYPE_LABEL[alert.type] ?? alert.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{alert.reporterName}</div>
                          <div className="text-xs text-gray-500">{alert.reporterPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCaserneBadge(alert.caserne)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(alert.status)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlert(alert);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                          >
                            Détails
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* DRAWER CONSULTATION HISTORIQUE */}
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAccept={() => {}}
          onRefuse={() => {}}
          onTransfer={() => {}}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}