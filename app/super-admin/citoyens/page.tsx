"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Phone,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Siren,
  Calendar,
} from "lucide-react";

import { citoyenService, Citoyen } from "@/services/CitoyenService";

// ==========================================
// 1. CONFIGURATION DES STATUTS
// ==========================================
const STATUT_CONFIG: Record<
  string,
  { label: string; style: string; icon: React.ReactNode }
> = {
  ACTIF: {
    label: "Actif",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  SUSPENDU: {
    label: "Suspendu",
    style: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

// ==========================================
// 2. PETITS COMPOSANTS HELPERS
// ==========================================

function StatutBadge({ statut }: { statut: string }) {
  const conf = STATUT_CONFIG[statut] || {
    label: statut,
    style: "bg-gray-50 text-gray-700 border-gray-200",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.style}`}
    >
      {conf.icon}
      {conf.label}
    </span>
  );
}

function ToggleStatusButton({
  statut,
  onToggle,
}: {
  statut: string;
  onToggle: () => void;
}) {
  // Convertit en majuscules pour éviter les problèmes de casse
  const normalizedStatus = statut?.toUpperCase() || "";
  const isActif = normalizedStatus === "ACTIF";

  const btnStyle = isActif
    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
    : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100";

  return (
    <button
      onClick={onToggle}
      className={`p-1.5 rounded-lg border text-xs font-semibold transition ${btnStyle}`}
      title={isActif ? "Suspendre le compte" : "Réactiver le compte"}
    >
      {isActif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
    </button>
  );
}

// ==========================================
// 3. COMPOSANT PRINCIPAL
// ==========================================
export default function CitoyensPage() {
  const [citoyens, setCitoyens] = useState<Citoyen[]>([]);
  const [filteredCitoyens, setFilteredCitoyens] = useState<Citoyen[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadCitoyens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citoyenService.getAll();
      setCitoyens(data);
      setFilteredCitoyens(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement des citoyens."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitoyens();
  }, []);

  useEffect(() => {
    let result = citoyens;

    if (filterStatut !== "TOUS") {
      result = result.filter((c) => c.statut === filterStatut);
    }

    const value = search.toLowerCase().trim();
    if (value) {
      result = result.filter(
        (c) =>
          c.nomComplet?.toLowerCase().includes(value) ||
          c.telephone?.toLowerCase().includes(value)
      );
    }

    setFilteredCitoyens(result);
  }, [search, filterStatut, citoyens]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 🔄 Adapté avec la nouvelle signature de toggleStatus(id)
  const handleToggleStatus = async (id: number, statutActuel: string) => {
    const actionText = statutActuel === "ACTIF" ? "suspendre" : "réactiver";

    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} ce compte citoyen ?`)) {
      return;
    }

    try {
      const updatedCitoyen = await citoyenService.toggleStatus(id);

      setCitoyens((prev) =>
        prev.map((c) => (c.id === id ? updatedCitoyen : c))
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la modification du statut du citoyen."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shrink-0">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Gestion des Citoyens
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registre des comptes citoyens et suivi de leurs statuts
            </p>
          </div>
        </div>

        <button
          onClick={loadCitoyens}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin text-red-600" : ""}`}
          />
          Actualiser
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou numéro de téléphone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-700 font-medium outline-none focus:border-red-500 focus:bg-white"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Comptes Actifs</option>
            <option value="SUSPENDU">Comptes Suspendus</option>
          </select>
        </div>
      </div>

      {/* Message d'Erreur */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Indicateur de Chargement */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
            <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
            <span>Chargement des comptes citoyens...</span>
          </div>
        </div>
      )}

      {/* État Vide */}
      {!loading && !error && filteredCitoyens.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            Aucun citoyen trouvé
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {search
              ? "Aucun citoyen ne correspond à vos critères de recherche."
              : "Aucun citoyen n'est inscrit pour le moment."}
          </p>
        </div>
      )}

      {/* Liste des Citoyens */}
      {!loading && filteredCitoyens.length > 0 && (
        <div className="space-y-3">
          {filteredCitoyens.map((citoyen) => {
            const isExpanded = expandedId === citoyen.id;

            return (
              <div
                key={citoyen.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                  {/* Nom & Avatar */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 shrink-0 border border-gray-200 font-bold text-xs">
                      {citoyen.nomComplet
                        ? citoyen.nomComplet.slice(0, 2).toUpperCase()
                        : "CI"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">
                        {citoyen.nomComplet}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">
                        ID: #CIT-{citoyen.id}
                      </p>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-center gap-2.5 md:w-1/5">
                    <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        Téléphone
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {citoyen.telephone || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="flex items-center gap-2.5 md:w-1/6">
                    <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 shrink-0">
                      <Siren className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        Rôle
                      </p>
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {citoyen.role || "CITOYEN"}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex items-center gap-2 md:w-1/6">
                    <StatutBadge statut={citoyen.statut} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2 md:w-1/6 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <ToggleStatusButton
                      statut={citoyen.statut}
                      onToggle={() =>
                        handleToggleStatus(citoyen.id, citoyen.statut)
                      }
                    />

                    <button
                      onClick={() => toggleExpand(citoyen.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                      title="Détails"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tiroir Rétractable pour Détails */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {citoyen.dateCreation && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">
                              Inscrit le
                            </p>
                            <p className="text-xs font-medium text-gray-800">
                              {citoyen.dateCreation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Compteur */}
      {!loading && !error && citoyens.length > 0 && (
        <div className="text-xs font-medium text-gray-500 text-right">
          <span className="font-bold text-gray-800">
            {filteredCitoyens.length}
          </span>{" "}
          citoyen(s) sur{" "}
          <span className="font-bold text-gray-800">{citoyens.length}</span>{" "}
          enregistré(s)
        </div>
      )}
    </div>
  );
}