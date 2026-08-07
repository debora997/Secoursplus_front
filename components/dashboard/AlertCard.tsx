import { forwardRef } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Car } from "lucide-react";
import { EmergencyAlert, TYPE_LABEL, STATUS_LABEL, PRIORITY_LABEL } from "@/types/alert";
import { TYPE_ICON, TYPE_ICON_CLASSES, STATUS_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_TEXT_CLASSES } from "@/lib/alertStyles";

interface AlertCardProps {
  alert: EmergencyAlert;
  onViewDetails: (id: number) => void;
  highlighted?: boolean;
}

const AlertCard = forwardRef<HTMLDivElement, AlertCardProps>(function AlertCard(
  { alert, onViewDetails, highlighted },
  ref
) {
  const Icon = TYPE_ICON[alert.type] ?? Car;

  return (
    <div
      ref={ref}
      onClick={() => onViewDetails(alert.id)}
      className={`flex cursor-pointer items-start gap-4 rounded-lg border border-brand-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-lineStrong hover:shadow-md max-[640px]:flex-col ${
        highlighted ? "ring-2 ring-brand-redBorder" : ""
      }`}
    >
      <div className={`relative flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[13px] ${TYPE_ICON_CLASSES[alert.type]}`}>
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
        {alert.priority === "eleve" && alert.status !== "terminee" && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-red">
            <span className="absolute inset-[-2px] animate-radarPing rounded-full border-2 border-brand-red" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2.5">
          <div className="font-display text-[15.5px] font-semibold tracking-tight">{TYPE_LABEL[alert.type]}</div>
          <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE_CLASSES[alert.status]}`}>
            {STATUS_LABEL[alert.status]}
          </span>
        </div>

        <div className="mb-2.5 line-clamp-1 text-[13px] leading-relaxed text-brand-inkSoft">{alert.description}</div>

        <div className="flex flex-wrap items-center gap-3.5">
          <span className="flex items-center gap-1.5 text-xs text-brand-inkSoft">
            <Calendar className="h-[13px] w-[13px] text-brand-muted" strokeWidth={1.9} />
            {alert.date}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11.5px] text-brand-inkSoft">
            <Clock className="h-[13px] w-[13px] text-brand-muted" strokeWidth={1.9} />
            {alert.time}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-brand-inkSoft">
            <MapPin className="h-[13px] w-[13px] text-brand-muted" strokeWidth={1.9} />
            {alert.location}
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${PRIORITY_TEXT_CLASSES[alert.priority]}`}>
            <span className={`h-[7px] w-[7px] rounded-full ${PRIORITY_DOT_CLASSES[alert.priority]}`} />
            {PRIORITY_LABEL[alert.priority]}
          </span>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-3 max-[640px]:w-full max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between">
        <span className="font-mono text-xs text-brand-muted">#{alert.id}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(alert.id);
          }}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-brand-lineStrong px-3.5 py-2 text-[12.5px] font-semibold transition-colors hover:border-brand-red hover:bg-brand-red hover:text-white"
        >
          Voir les détails
          <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2.3} />
        </button>
      </div>
    </div>
  );
});

export default AlertCard;
