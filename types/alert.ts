export type EmergencyType = "accident" | "incendie" | "inondation" | "malaise" | "gaz";

export type AlertStatus = "nouvelle" | "encours" | "terminee";

export type Priority = "eleve" | "moyen" | "faible";

export interface MapPosition {
  /** position in % relative to the map canvas, 0-100 */
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
  location: string;
  position: MapPosition;
  description: string;
  reporterName: string;
  reporterPhone: string;
  gps: string;
  photosCount: number;
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
  eleve: "Priorité élevée",
  moyen: "Priorité moyenne",
  faible: "Priorité faible",
};

export type AlertFilter = "toutes" | AlertStatus;
