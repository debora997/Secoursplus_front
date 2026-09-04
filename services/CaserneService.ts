export interface Caserne {
  id: number;
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
  latitude?: number;
  longitude?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/super-admin";

const SUPER_ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "X-Admin-Role": "SUPER_ADMIN",
};

export const caserneService = {
  async getAll(): Promise<Caserne[]> {
    const res = await fetch(`${API_URL}/casernes`, {
      method: "GET",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!res.ok) {
      throw new Error("Erreur lors du chargement des casernes");
    }

    return await res.json();
  },
};