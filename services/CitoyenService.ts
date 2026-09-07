export interface Citoyen {
  id: number;
  nomComplet: string;
  telephone: string;
  latitude?: number | null;
  longitude?: number | null;
  role: string;
  statut: "ACTIF" | "SUSPENDU";
  dateCreation?: string;
}

// 🟢 1. On récupère la base "/api" (ex: http://192.168.1.17:8080/api)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// 🟢 2. On définit l'URL exacte de l'endpoint des citoyens
const CITOYENS_API_URL = `${BASE_URL}/super-admin/citoyens`;

const SUPER_ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "X-Admin-Role": "SUPER_ADMIN",
};

export const citoyenService = {
  async getAll(): Promise<Citoyen[]> {
    // 🟢 Appelle : http://192.168.1.17:8080/api/super-admin/citoyens
    const response = await fetch(CITOYENS_API_URL, {
      method: "GET",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des citoyens.");
    }

    return await response.json();
  },

  async toggleStatus(id: number): Promise<Citoyen> {
    // 🟢 Appelle : http://192.168.1.17:8080/api/super-admin/citoyens/{id}/toggle-status
    const response = await fetch(`${CITOYENS_API_URL}/${id}/toggle-status`, {
      method: "PATCH",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        message || "Impossible de modifier le statut du citoyen."
      );
    }

    return await response.json();
  },
};