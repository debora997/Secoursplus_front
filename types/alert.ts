export type EmergencyType =
  | "accident"
  | "incendie"
  | "inondation"
  | "malaise"
  | "gaz";

export type AlertStatus =
  | "nouvelle"
  | "encours"
  | "terminee";

export type Priority =
  | "critique"
  | "eleve"
  | "moyen";

export type Caserne =
| "Sogoniko"
| "Bamako"
| "Quartier Mali";

export interface MapPosition {
  x: number;
  y: number;
}

export interface EmergencyAlert {
  id: number;
  type: EmergencyType;
  status: AlertStatus;
  priority: Priority;

  date: string;
  time: string;
  createdAt: string; // ISO String brute du backend (ex: "2026-08-17T14:30:00Z")

  location: string;

  // Coordonnées GPS réelles de l'incident
  latitude: number | null;
  longitude: number | null;

  position: MapPosition;

  description: string;

  caserne?: string; // Nom de la caserne qui a pris en charge l'alerte
  
  reporterName: string;
  reporterPhone: string;

  gps: string;

  photosCount: number;
  photoPaths: string[];
}

export const TYPE_LABEL: Record<EmergencyType, string> = {
  accident: "Accident de la route",
  incendie: "Incendie",
  inondation: "Inondation",
  malaise: "Malaise / urgence médicale",
  gaz: "Fuite de gaz",
};

export const STATUS_LABEL: Record<AlertStatus, string> = {
  nouvelle: "Nouvelle",
  encours: "En cours",
  terminee: "Terminée",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critique: "Priorité critique",
  eleve: "Priorité élevée",
  moyen: "Priorité moyenne",
};

export type AlertFilter = "toutes" | AlertStatus;