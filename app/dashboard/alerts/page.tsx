"use client";

import { useState } from "react";
import { EmergencyAlert } from "@/types/alert";
import TransferModal from "@/components/dashboard/TransferModal";

export default function AlertsList({ alerts }: { alerts: EmergencyAlert[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  const handleOpenModal = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };

  const handleConfirmTransfer = async (alertId: number, targetCaserne: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // Appel API pour transférer l'alerte
    const res = await fetch(`${baseUrl}/api/alertes/${alertId}/transferer`, {
      method: "PUT", // ou POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caserne: targetCaserne }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors du transfert");
    }

    // Optionnel : Mettre à jour l'état local ou recharger les données
    console.log(`Alerte #${alertId} transférée vers la caserne : ${targetCaserne}`);
  };

  return (
    <div>
      {/* Exemple sur un item d'alerte */}
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-center justify-between p-4 border-b">
          <div>
            <p className="font-semibold">{alert.location}</p>
            <p className="text-xs text-slate-500">
              Caserne actuelle: {alert.caserne || "Non assignée"}
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(alert)}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Transférer
          </button>
        </div>
      ))}

      {/* Intégration de la Modale */}
      <TransferModal
        isOpen={modalOpen}
        alertId={selectedAlert?.id ?? null}
        currentCaserne={selectedAlert?.caserne || ""}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmTransfer}
      />
    </div>
  );
}