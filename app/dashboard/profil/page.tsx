"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Building2,
  ShieldCheck,
  MapPin,
  Navigation,
  KeyRound,
  Pencil,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface UserData {
  id: string | number;
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
  latitude?: number | null;
longitude?: number | null;
}

export default function ProfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const initials = (user?.nomComplet || "Utilisateur")
    .replace(/^Cap\.\s*/, "")
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

  <button
    type="button"
    onClick={() => router.back()}
    className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-600">
    <ArrowLeft className="h-4 w-4" />
    Retour
  </button>

      <div className="mx-auto max-w-4xl">
        {/* EN-TETE DE PAGE */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Mon Profil
          </h1>
          
          <p className="mt-1 text-sm text-gray-500">
            Informations personnelles et sécurité du compte
          </p>
        </div>

        <div className="space-y-6">
          {/* CARTE PRINCIPALE : PROFIL */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center gap-6 border-b border-gray-100 pb-6 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-3xl font-bold text-white shadow-lg shadow-red-600/30">
                {initials}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.nomComplet || "—"}
                </h2>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 sm:justify-start">
                  <ShieldCheck className="h-4 w-4" />
                  {user?.role || "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <User className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Nom complet
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {user?.nomComplet || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Téléphone
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {user?.telephone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Caserne
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {user?.caserne || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Rôle
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">
                    {user?.role || "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CARTE LOCALISATION */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <h3 className="text-base font-bold text-gray-900">
                Localisation
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Latitude
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">
                    {user?.latitude ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Longitude
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-gray-900">
                    {user?.longitude ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Emplacement pour future intégration carte */}
            <div className="mt-5 flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <MapPin className="mx-auto h-6 w-6 text-gray-300" />
                <p className="mt-2 text-xs font-medium text-gray-400">
                  Carte interactive — bientôt disponible
                </p>
              </div>
            </div>
          </section>

          {/* CARTE SECURITE */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-red-600" />
              <h3 className="text-base font-bold text-gray-900">Sécurité</h3>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard/profil/modifier")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Modifier mes informations
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/profil/password")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/30 transition hover:bg-red-700"
              >
                <Lock className="h-4 w-4" />
                Changer mon mot de passe
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}