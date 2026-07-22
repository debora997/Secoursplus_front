import { type ReactNode } from "react";
import Link from "next/link";
import { Siren } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* PANNEAU GAUCHE — identité command center (masqué en mobile) */}
      <div className="relative hidden w-[42%] flex-col overflow-hidden bg-[#111827] px-12 py-10 text-white lg:flex">
        {/* Grille technique en fond, discrète */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Secours+"
            className="h-28 w-auto object-contain"
          />
        </div>

        {/* Bloc central — signature de la marque */}
        <div className="relative z-10 mt-10 space-y-8">
          <div className="flex items-center gap-2 text-red-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Système opérationnel
            </span>
          </div>

          <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            Centre de commandement des sapeurs-pompiers
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-gray-400">
            Coordination des interventions, suivi des alertes et gestion des
            équipes en temps réel.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex items-center gap-2 pt-10 text-xs text-gray-500">
          <Siren className="h-4 w-4" />
          <span>Secours+ — Plateforme de gestion des interventions</span>
        </div>
      </div>

      {/* PANNEAU DROIT — formulaire */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-md animate-auth-in">
          {/* Logo visible uniquement en mobile / tablette */}
          <div className="mb-8 flex justify-center lg:hidden">
            <img
              src="/images/logo.png"
              alt="Secours+"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_20px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                {title}
              </h2>
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            </div>

            {children}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="font-medium text-red-600 transition-colors hover:text-red-700"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}