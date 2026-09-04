"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  User,
  Clock,
  AlertTriangle,
  Flame,
  Car,
  Camera,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Siren,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { alertService, Alert } from "@/services/AlertService";

interface Props {
  currentCaserneName?: string; // Nom de la caserne connectée
}

export default function AlertesPage({ currentCaserneName = "Caserne Centrale" }: Props) {
  const [alertes, setAlertes] = useState<Alert[]>([]);
  const [filteredAlertes, setFilteredAlertes] = useState<Alert[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("TOUS");
  const [filterSeverity, setFilterSeverity] = useState("TOUTES");
  const [filterStatus, setFilterStatus] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // =========================================================
  // CHARGER LES ALERTES
  // =========================================================

  const loadAlertes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await alertService.getAll();

      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setAlertes(sortedData);
      setFilteredAlertes(sortedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement des alertes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertes();
  }, []);

  // =========================================================
  // ACCEPTER UNE ALERTE (ANTI-CONCURRENCE)
  // =========================================================

  const handleAcceptAlert = async (alertId: number) => {
    try {
      setActionLoading(alertId);
      setActionError(null);

      // Appel avec transmission de la caserne
      await alertService.updateStatus(alertId, "ACCEPTED", currentCaserneName);
      
      // Recharger pour mettre à jour la liste
      await loadAlertes();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setActionError(err.response.data || "Cette alerte a déjà été prise en charge par une autre caserne.");
      } else {
        setActionError("Erreur lors de l'acceptation de l'alerte.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // FILTRES
  // =========================================================

  useEffect(() => {
    let result = [...alertes];

    const value = search.toLowerCase().trim();

    if (value) {
      result = result.filter(
        (alert) =>
          alert.citoyenNom?.toLowerCase().includes(value) ||
          alert.citoyenTelephone?.toLowerCase().includes(value) ||
          alert.description?.toLowerCase().includes(value) ||
          alert.type?.toLowerCase().includes(value) ||
          alert.caserne?.toLowerCase().includes(value) ||
          String(alert.id).includes(value)
      );
    }

    if (filterType !== "TOUS") {
      result = result.filter(
        (alert) => alert.type?.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (filterSeverity !== "TOUTES") {
      result = result.filter(
        (alert) =>
          alert.severity?.toLowerCase() === filterSeverity.toLowerCase()
      );
    }

    if (filterStatus !== "TOUS") {
      result = result.filter(
        (alert) =>
          alert.status?.toUpperCase() === filterStatus.toUpperCase()
      );
    }

    setFilteredAlertes(result);
  }, [search, filterType, filterSeverity, filterStatus, alertes]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "incendie":
        return "Incendie";
      case "accidentroute":
      case "accident":
        return "Accident";
      default:
        return type || "Urgence";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "incendie":
        return <Flame className="h-4 w-4" />;
      case "accidentroute":
      case "accident":
        return <Car className="h-4 w-4" />;
      default:
        return <Siren className="h-4 w-4" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critique":
        return "bg-red-50 text-red-700 border-red-200";
      case "grave":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "moderee":
      case "modérée":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "RECEIVED":
        return "Reçue";
      case "PENDING":
        return "En attente";
      case "IN_PROGRESS":
        return "En cours";
      case "ACCEPTED":
      case "ACCEPTEE":
        return "Acceptée";
      case "ENGAGED":
        return "Engagée";
      case "TRANSFERRED":
      case "TRANSFER":
      case "TRANSFEREE":
      case "TRANSFERED":
        return "Transférée";
      case "TERMINATED":
        return "Terminée";
      case "REJECTED":
      case "REFUSED":
      case "REFUSEE":
        return "Refusée";
      case "CANCELLED":
        return "Annulée";
      default:
        return status || "Inconnu";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "RECEIVED":
      case "PENDING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
      case "ACCEPTED":
      case "ACCEPTEE":
      case "ENGAGED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "TRANSFERRED":
      case "TRANSFER":
      case "TRANSFEREE":
      case "TRANSFERED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "TERMINATED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
      case "REFUSED":
      case "REFUSEE":
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Date inconnue";

    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 space-y-6">

      {/* EN-TÊTE EN BLANC */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shrink-0">
            <Bell className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Journal des Alertes
            </h1>

            <p className="text-xs text-gray-500 mt-0.5">
              Historique centralisé des signalements d'urgence transmis par les citoyens
            </p>
          </div>
        </div>

        <button
          onClick={loadAlertes}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin text-red-600" : ""}`}
          />
          Actualiser
        </button>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="flex flex-col lg:flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
        
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par citoyen, téléphone, type, caserne, ID..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-700 font-medium outline-none focus:border-red-500 focus:bg-white"
          >
            <option value="TOUS">Tous les types</option>
            <option value="incendie">Incendie</option>
            <option value="accident">Accident</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-700 font-medium outline-none focus:border-red-500 focus:bg-white"
          >
            <option value="TOUTES">Toutes les gravités</option>
            <option value="critique">Critique</option>
            <option value="grave">Grave</option>
            <option value="moderee">Modérée</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-700 font-medium outline-none focus:border-red-500 focus:bg-white"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="RECEIVED">Reçue</option>
            <option value="PENDING">En attente</option>
            <option value="ACCEPTED">Acceptée</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="TRANSFERRED">Transférée</option>
            <option value="TERMINATED">Terminée</option>
            <option value="REFUSED">Refusée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>

      </div>

      {/* MESSAGE D'ERREUR ACTION */}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold underline text-red-800">Fermer</button>
        </div>
      )}

      {/* ERREUR GLOBALE */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* CHARGEMENT */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
            <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
            <span>Chargement du journal des alertes...</span>
          </div>
        </div>
      )}

      {/* AUCUNE ALERTE TROUVÉE */}
      {!loading && !error && filteredAlertes.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <Bell className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            Aucune alerte trouvée
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {search
              ? "Aucune alerte ne correspond à vos critères de recherche."
              : "Aucune alerte n'a été enregistrée pour le moment."}
          </p>
        </div>
      )}

      {/* LISTE HORIZONTALE DES ALERTES */}
      {!loading && filteredAlertes.length > 0 && (
        <div className="space-y-3">
          {filteredAlertes.map((alert) => {
            const isExpanded = expandedId === alert.id;
            const isTaken = Boolean(alert.caserne);
            const isMyCaserne = isTaken && alert.caserne === currentCaserneName;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border bg-white shadow-sm transition overflow-hidden ${
                  isTaken ? "border-gray-200 bg-gray-50/30" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Ligne Horizontale Principale */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                  
                  {/* Type d'Alerte */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-100">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">
                        {getTypeLabel(alert.type)}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">
                        ID: #{alert.id}
                      </p>
                    </div>
                  </div>

                  {/* Citoyen Émetteur */}
                  <div className="flex items-center gap-2.5 md:w-1/5">
                    <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Citoyen émetteur</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {alert.citoyenNom || "Inconnu"}
                      </p>
                      {alert.citoyenTelephone && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {alert.citoyenTelephone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Victimes */}
                  <div className="flex items-center gap-2.5 md:w-1/5">
                    <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Date & Victimes</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {formatDate(alert.createdAt)}
                      </p>
                      <p className="text-[10px] text-orange-600 font-medium">
                        {alert.victims} victime(s)
                      </p>
                    </div>
                  </div>

                  {/* Badges : Gravité & Caserne / Statut */}
                  <div className="flex items-center gap-2 md:w-1/4 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityStyle(alert.severity)}`}>
                      {alert.severity || "Modérée"}
                    </span>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(alert.status)}`}>
                      {getStatusLabel(alert.status)}
                    </span>

                    {/* Badge de Caserne Affectée */}
                    {isTaken ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isMyCaserne 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}>
                        {isMyCaserne ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {alert.caserne}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Disponible
                      </span>
                    )}
                  </div>

                  {/* Bouton Flèche Déroulante */}
                  <div className="flex items-center justify-end md:w-12 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <button
                      onClick={() => toggleExpand(alert.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                      title="Voir les détails de l'alerte"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                </div>

                {/* Tiroir de Détails Rétractable */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-4 animate-in fade-in duration-150">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Description */}
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Description des faits</p>
                        <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200/70 leading-relaxed">
                          {alert.description || "Aucune description fournie par l'émetteur."}
                        </p>
                      </div>

                      {/* Coordonnées & GPS + Actions */}
                      <div className="space-y-3 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Localisation GPS</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                            <span className="text-xs font-mono font-medium text-gray-800">
                              {alert.latitude != null && alert.longitude != null
                                ? `${alert.latitude}, ${alert.longitude}`
                                : "Position non transmise"}
                            </span>
                          </div>

                          {alert.latitude != null && alert.longitude != null && (
                            <div className="mt-2">
                              <a
                                href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                              >
                                <span>Ouvrir dans Google Maps</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Bouton d'Acceptation de l'Intervention */}
                        <div className="pt-2">
                          <button
                            onClick={() => handleAcceptAlert(alert.id)}
                            disabled={isTaken || actionLoading === alert.id}
                            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 ${
                              isTaken
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
                                : "bg-red-600 text-white hover:bg-red-700 active:scale-95"
                            }`}
                          >
                            {actionLoading === alert.id ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Prise en charge...</span>
                              </>
                            ) : isTaken ? (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                <span>Prise en charge par {alert.caserne}</span>
                              </>
                            ) : (
                              <>
                                <Siren className="h-3.5 w-3.5" />
                                <span>Accepter l'intervention</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                    </div>

                    {/* Galerie de Photos */}
                    {alert.photoPaths && alert.photoPaths.length > 0 && (
                      <div className="pt-3 border-t border-gray-200/60">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="h-4 w-4 text-gray-500" />
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">
                            Photos transmises ({alert.photoPaths.length})
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {alert.photoPaths.map((photo, index) => (
                            <div
                              key={index}
                              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                              <img
                                src={photo}
                                alt={`Photo d'urgence ${index + 1}`}
                                className="h-28 w-full object-cover hover:scale-105 transition duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Compteur bas de page */}
      {!loading && !error && alertes.length > 0 && (
        <div className="text-xs font-medium text-gray-500 text-right">
          <span className="font-bold text-gray-800">{filteredAlertes.length}</span> alerte(s) sur <span className="font-bold text-gray-800">{alertes.length}</span> au total
        </div>
      )}

    </div>
  );
}