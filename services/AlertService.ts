export interface Alert {
  id: number;
  type: string;
  severity: string;
  victims: number;
  description: string;
  latitude?: number;
  longitude?: number;
  photoPaths: string[];
  status: string;
  caserne?: string; // 👈 Champ ajouté pour stocker la caserne affectée
  createdAt: string;
  citoyenId?: number;
  citoyenNom?: string;
  citoyenTelephone?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/super-admin";

const SUPER_ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "X-Admin-Role": "SUPER_ADMIN",
};

export const alertService = {

  async getAll(): Promise<Alert[]> {
    const response = await fetch(`${API_URL}/alertes`, {
      method: "GET",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!response.ok) {
      throw new Error(
        "Erreur lors du chargement des alertes."
      );
    }

    return await response.json();
  },

  // 👈 Nouvelle méthode d'acceptation / mise à jour du statut
  async updateStatus(id: number, status: string, caserne?: string): Promise<Alert> {
    let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/alerts/${id}/status?status=${status}`;

    if (caserne) {
      url += `&caserne=${encodeURIComponent(caserne)}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // On lève un objet contenant la réponse HTTP pour intercepter le code 409 dans le Front
      throw {
        response: {
          status: response.status,
          data: errorText || "Erreur lors de la mise à jour du statut."
        }
      };
    }

    return await response.json();
  },

};