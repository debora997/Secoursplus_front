"use client";

import { useState, useEffect } from "react";
import { X, ArrowRightLeft, Building2, Check, AlertCircle } from "lucide-react";
import { CaserneItem } from "@/types/alert";

interface TransferModalProps {
  isOpen: boolean;
  alertId: number | null;
  currentCaserne?: string;
  onClose: () => void;
  onConfirm: (alertId: number, targetCaserne: string) => Promise<void>;
}

export default function TransferModal({
  isOpen,
  alertId,
  currentCaserne = "",
  onClose,
  onConfirm,
}: TransferModalProps) {
  const [casernes, setCasernes] = useState<CaserneItem[]>([]);
  const [selectedCaserne, setSelectedCaserne] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCasernes = async () => {
      setLoading(true);
      setError(null);
      setSelectedCaserne("");

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${baseUrl}/api/casernes`);

        if (!res.ok) {
          throw new Error(`Erreur serveur (${res.status})`);
        }

        const data = await res.json();

        // Extraction selon la structure JSON renvoyée par le backend
        let list: CaserneItem[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.content)) {
          list = data.content;
        } else if (Array.isArray(data.casernes)) {
          list = data.casernes;
        } else if (Array.isArray(data.data)) {
          list = data.data;
        }

        setCasernes(list);
      } catch (err) {
        console.error("Erreur lors de la récupération des casernes :", err);
        setError("Impossible de charger la liste des casernes depuis le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchCasernes();
  }, [isOpen]);

  if (!isOpen || !alertId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaserne) return;

    setSubmitting(true);
    try {
      await onConfirm(alertId, selectedCaserne);
      onClose();
    } catch (err) {
      console.error("Erreur lors du transfert :", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Exclut la caserne actuelle (compare avec le nom de la caserne 'caserne' ou 'nom')
  const availableCasernes = casernes.filter((c: any) => {
    const stationName = c.caserne || c.nom || "";
    return stationName.toLowerCase() !== currentCaserne.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Entête */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transférer l'intervention #{alertId}
              </h3>
              <p className="text-xs font-normal text-slate-500">
                Sélectionnez la caserne réceptrice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Casernes disponibles (Backend)
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-xs font-medium text-slate-500">
                Chargement des casernes...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : availableCasernes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Aucune autre caserne disponible sur le serveur.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1 max-h-60 overflow-y-auto pr-1">
                {availableCasernes.map((caserneItem: any) => {
                  // 'caserne' = Nom de la caserne (ex: Sogoniko)
                  // 'nomComplet' = Chef de caserne (ex: Capitaine Diallo)
                  const stationName =
                    caserneItem.caserne ||
                    caserneItem.nom ||
                    "Caserne sans nom";
                  const chefName = caserneItem.nomComplet;
                  const isSelected = selectedCaserne === stationName;

                  return (
                    <button
                      key={caserneItem.id}
                      type="button"
                      onClick={() => setSelectedCaserne(stationName)}
                      className={`relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2
                          className={`h-4 w-4 ${
                            isSelected ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <div>
                          {/* Nom de la caserne */}
                          <span className="block text-xs font-semibold text-slate-800">
                            {stationName}
                          </span>
                          {/* Nom du chef de caserne en sous-titre */}
                          {chefName && (
                            <span className="block text-[10px] text-slate-400">
                              Chef: {chefName}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCaserne}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? "Transfert en cours..." : "Confirmer le transfert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}