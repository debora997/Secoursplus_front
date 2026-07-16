import { Siren, Zap, CheckCircle2, Users } from "lucide-react";
import StatCard from "./StatCard";
import { EmergencyAlert } from "@/types/alert";

interface StatGridProps {
  alerts: EmergencyAlert[];
  availableFirefighters: number;
  totalFirefighters: number;
}

export default function StatGrid({
  alerts,
  availableFirefighters,
  totalFirefighters
}: StatGridProps) {

  const nouvelles = alerts.filter((a) => a.status === "nouvelle").length;
  const encours = alerts.filter((a) => a.status === "encours").length;
  const terminees = alerts.filter((a) => a.status === "terminee").length;


  return (
    <div
      className="
      mb-6

      grid

      grid-cols-3

      gap-5

      max-[1100px]:grid-cols-2

      max-[640px]:grid-cols-1

      "
    >

      <StatCard
        icon={Siren}
        value={nouvelles}
        label="Nouvelles alertes"
        tone="red"
      />


      <StatCard
        icon={Zap}
        value={encours}
        label="Interventions en cours"
        tone="blue"
      />


      <StatCard
        icon={CheckCircle2}
        value={terminees}
        label="Interventions terminées"
        tone="green"
      />

    </div>
  );
}