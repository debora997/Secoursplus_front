  "use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Crosshair, Phone, Camera, Check, ArrowLeftRight, XCircle } from "lucide-react";
import { EmergencyAlert, TYPE_LABEL, STATUS_LABEL, PRIORITY_LABEL } from "@/types/alert";
import { TYPE_ICON, TYPE_ICON_CLASSES, STATUS_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_TEXT_CLASSES } from "@/lib/alertStyles";

interface AlertDetailDrawerProps {
  alert: EmergencyAlert | null;
  onClose: () => void;
  onAccept: (id: number) => void;
  onTransfer: (id: number) => void;
  onRefuse: (id: number) => void;
}

export default function AlertDetailDrawer({ alert, onClose, onAccept, onTransfer, onRefuse }: AlertDetailDrawerProps) {
  const Icon = alert ? TYPE_ICON[alert.type] : null;

  return (
    <AnimatePresence>
      {alert && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#11141e]/40 backdrop-blur-[2px]"
          />

          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[90] flex w-[560px] max-w-[94vw] flex-col bg-white shadow-lg"
          >
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-brand-line bg-white px-[26px] py-[22px]">
                <div className={`flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[14px] ${TYPE_ICON_CLASSES[alert.type]}`}>
                  {Icon && <Icon className="h-[25px] w-[25px]" strokeWidth={1.9} />}
                </div>
                <div>
                  <div className="mb-0.5 font-mono text-[11px] tracking-wide text-brand-muted">
                    SIGNALEMENT #{alert.id} · {alert.date} · {alert.time}
                  </div>
                  <div className="font-display text-[21px] font-bold tracking-tight">{TYPE_LABEL[alert.type]}</div>
                  <div className="mt-2 flex gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE_CLASSES[alert.status]}`}>
                      {STATUS_LABEL[alert.status]}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${PRIORITY_TEXT_CLASSES[alert.priority]}`}>
                      <span className={`h-[7px] w-[7px] rounded-full ${PRIORITY_DOT_CLASSES[alert.priority]}`} />
                      {PRIORITY_LABEL[alert.priority]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-bg hover:text-brand-ink"
                >
                  <X className="h-[17px] w-[17px]" strokeWidth={2} />
                </button>
              </div>

              {/* Description */}
              <Section label="Description complète">
                <p className="text-sm leading-relaxed text-brand-inkSoft">{alert.description}</p>
              </Section>

              {/* Reporter */}
              <Section label="Personne ayant signalé l'alerte">
                <div className="flex items-center gap-3 rounded-md bg-brand-bg px-4 py-3.5">
                  <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5A6479] to-[#33394A] font-display text-sm font-semibold text-white">
                    {alert.reporterName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{alert.reporterName}</div>
                    <div className="mt-0.5 font-mono text-[12.5px] text-brand-inkSoft">{alert.reporterPhone}</div>
                  </div>
                  <a
                    href={`tel:${alert.reporterPhone.replace(/\s/g, "")}`}
                    className="ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-greenSoft text-brand-green"
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.9} />
                  </a>
                </div>
              </Section>

              {/* Location */}
              <Section label="Localisation">
                <div className="mb-3.5 grid grid-cols-2 gap-3.5">
                  <InfoItem icon={MapPin} label="Adresse estimée" value={alert.location} />
                  <InfoItem icon={Crosshair} label="Coordonnées GPS" value={alert.gps} mono />
                </div>
                <div className="relative h-[150px] overflow-hidden rounded-md border border-brand-line bg-gradient-to-b from-[#F0F3F8] to-[#E8ECF3]">
                  <svg className="absolute inset-0 opacity-50" viewBox="0 0 300 150" width="100%" height="100%">
                    <defs>
                      <pattern id={`mgrid-${alert.id}`} width="22" height="22" patternUnits="userSpaceOnUse">
                        <path d="M22 0H0V22" fill="none" stroke="#D7DCE4" strokeWidth={1} />
                      </pattern>
                    </defs>
                    <rect width="300" height="150" fill={`url(#mgrid-${alert.id})`} />
                  </svg>
                  <div className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-full text-brand-red">
                    <MapPin className="h-full w-full fill-current drop-shadow" strokeWidth={0} />
                    <span className="absolute left-1/2 top-full h-[34px] w-[34px] -translate-x-1/2 -translate-y-1 animate-markerPulse rounded-full bg-brand-red/20" />
                  </div>
                </div>
              </Section>

              {/* Photos */}
              <Section label={`Photos envoyées ${alert.photosCount > 0 ? `(${alert.photosCount})` : "(aucune)"}`}>
                {alert.photosCount > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: alert.photosCount }).map((_, i) => (
                      <div
                        key={i}
                        className="flex aspect-square items-center justify-center rounded-sm bg-gradient-to-br from-[#EDEFF3] to-[#DFE2E8] text-brand-muted"
                      >
                        <Camera className="h-[22px] w-[22px]" strokeWidth={1.9} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] text-brand-muted">Aucune photo n&rsquo;a été jointe à ce signalement.</div>
                )}
              </Section>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 flex gap-2.5 border-t border-brand-line bg-white px-[26px] pb-6 pt-[18px]">
              <ActionButton
                icon={Check}
                label="Accepter"
                className="border-brand-green bg-brand-green text-white hover:bg-[#128a3e]"
                onClick={() => onAccept(alert.id)}
              />
              <ActionButton
                icon={ArrowLeftRight}
                label="Transférer"
                className="border-brand-lineStrong text-brand-blue hover:border-brand-blueBorder hover:bg-brand-blueSoft"
                onClick={() => onTransfer(alert.id)}
              />
              <ActionButton
                icon={XCircle}
                label="Refuser"
                className="border-brand-lineStrong text-brand-red hover:border-brand-redBorder hover:bg-brand-redSoft"
                onClick={() => onRefuse(alert.id)}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-brand-line px-[26px] py-[22px] last:border-b-0">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted">{label}</div>
      {children}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-muted" strokeWidth={1.9} />
      <div>
        <div className="text-[10.5px] text-brand-muted">{label}</div>
        <div className={mono ? "font-mono text-[13px] font-medium" : "text-[13.5px] font-semibold"}>{value}</div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  className,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[12.5px] font-semibold transition-colors ${className}`}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
      {label}
    </button>
  );
}
