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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/super-admin";

const SUPER_ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "X-Admin-Role": "SUPER_ADMIN",
};

export const citoyenService = {
  async getAll(): Promise<Citoyen[]> {
    const response = await fetch(`${API_URL}/citoyens`, {
      method: "GET",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des citoyens.");
    }

    return await response.json();
  },

  async toggleStatus(id: number): Promise<Citoyen> {
    const response = await fetch(
      `${API_URL}/citoyens/${id}/toggle-status`,
      {
        method: "PATCH",
        headers: SUPER_ADMIN_HEADERS,
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        message || "Impossible de modifier le statut du citoyen."
      );
    }

    return await response.json();
  },
};