export interface Caserne {
  id: number;
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
  latitude?: number;
  longitude?: number;
}

// 🟢 1. Récupération de l'URL de base (ex: http://192.168.1.17:8080/api)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// 🟢 2. Route complète pour les casernes sous super-admin
const CASERNES_API_URL = `${BASE_URL}/super-admin/casernes`;

const SUPER_ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "X-Admin-Role": "SUPER_ADMIN",
};

export const caserneService = {
  async getAll(): Promise<Caserne[]> {
    // 🟢 Appelle : http://192.168.1.17:8080/api/super-admin/casernes
    const res = await fetch(CASERNES_API_URL, {
      method: "GET",
      headers: SUPER_ADMIN_HEADERS,
    });

    if (!res.ok) {
      throw new Error("Erreur lors du chargement des casernes");
    }

    return await res.json();
  },
};