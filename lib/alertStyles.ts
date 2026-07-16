import { AlertStatus, EmergencyType, Priority } from "@/types/alert";
import { Car, Flame, Waves, HeartPulse, Wind, LucideIcon } from "lucide-react";

export const TYPE_ICON: Record<EmergencyType, LucideIcon> = {
  accident: Car,
  incendie: Flame,
  inondation: Waves,
  malaise: HeartPulse,
  gaz: Wind,
};

/** Tailwind classes for the round icon chip on an alert card */
export const TYPE_ICON_CLASSES: Record<EmergencyType, string> = {
  accident: "bg-brand-blueSoft text-brand-blue",
  incendie: "bg-brand-redSoft text-brand-red",
  inondation: "bg-cyan-50 text-cyan-700",
  malaise: "bg-brand-amberSoft text-amber-700",
  gaz: "bg-violet-50 text-violet-600",
};

export const STATUS_BADGE_CLASSES: Record<AlertStatus, string> = {
  nouvelle: "bg-brand-redSoft text-brand-redDark border border-brand-redBorder",
  encours: "bg-brand-blueSoft text-brand-blue border border-brand-blueBorder",
  terminee: "bg-brand-greenSoft text-brand-green border border-brand-greenBorder",
};

export const PRIORITY_DOT_CLASSES: Record<Priority, string> = {
  eleve: "bg-brand-red",
  moyen: "bg-brand-amber",
  faible: "bg-brand-muted",
};

export const PRIORITY_TEXT_CLASSES: Record<Priority, string> = {
  eleve: "text-brand-redDark",
  moyen: "text-amber-700",
  faible: "text-brand-muted",
};

/** Marker colour on the live map, driven by alert status (not priority) */
export const MARKER_CLASSES: Record<AlertStatus, string> = {
  nouvelle: "text-brand-red",
  encours: "text-brand-blue",
  terminee: "text-brand-green",
};
