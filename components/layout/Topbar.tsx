"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock3,
  User,
  Pencil,
  Lock,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface TopbarProps {
  title?: string;
}

interface UserData {
  nomComplet: string;
  telephone: string;
  caserne: string;
  role: string;
}

export default function Topbar({
  title = "Centre de Commandement",
}: TopbarProps) {
  const router = useRouter();

  const [now, setNow] = useState<Date | null>(null);

  const [user, setUser] = useState<UserData | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Horloge
  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fermeture du menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
function handleLogout() {
  localStorage.removeItem("user");
  router.push("/login");
}

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const userName = user?.nomComplet || "Utilisateur";

  const userRole = user?.role || "SECOURISTE";

  const initials = userName
    .replace(/^Cap\.\s*/, "")
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    {
      label: "Mon profil",
      icon: User,
      action: () => router.push("/dashboard/profil"),
    },
    {
      label: "Modifier mes informations",
      icon: Pencil,
      action: () => router.push("/dashboard/profil/modifier"),
    },
    {
      label: "Changer le mot de passe",
      icon: Lock,
      action: () => router.push("/dashboard/profil/password"),
    },
  ];

  return (
    <header className=" sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-7 shadow-sm max-[640px]:px-4 ">
      {/* TITRE */}

      <div>
        <div
          className="
flex
items-center
gap-2
"
        >
          <h1 className=" text-xl font-bold tracking-tight text-gray-900 ">
            {title}
          </h1>

          <span className=" h-2 w-2 rounded-full bg-red-600 animate-pulse " />
        </div>

        <p className="mt-1 text-xs text-gray-500">
          Surveillance des interventions en temps réel
        </p>
      </div>

      {/* SYSTEME */}

      <div className="hidden md:flex items-center gap-3 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute h-full w-full rounded-full bg-green-500 animate-ping" />

          <span className="relative h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>

        Système opérationnel
      </div>

      {/* DROITE */}

      <div className="flex items-center gap-4">
        {/* HORLOGE */}

        {now && (
          <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 pr-5">
            <Clock3
              className="
h-4
w-4
text-red-600
"
            />

            <div className="text-right">
              <p className="font-mono text-sm font-bold text-gray-900">
                {now.toLocaleTimeString("fr-FR")}
              </p>

              <p className=" text-[11px] capitalize text-gray-500">
                {now.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        )}

        {/* PROFIL */}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className=" flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition hover:border-red-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 font-bold text-white shadow-md shadow-red-600/30">
              {initials}
            </div>

            <div className="hidden md:block leading-tight text-left">
              <p className="text-sm font-bold text-gray-900">{userName}</p>

              <p className="flex items-center gap-1 text-xs text-gray-500">
                <ShieldCheck className=" h-3.5 w-3.5 text-red-600" />

                {userRole}
              </p>

              <p className="text-[11px] text-gray-400">{user?.caserne}</p>
            </div>

            <ChevronDown
              className={`hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* MENU DEROULANT */}

          <div
            className={`absolute right-0 top-[calc(100%+10px)] w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10 transition-all duration-200 ease-out ${
              isMenuOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            {/* En-tête du menu */}

            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 font-bold text-white shadow-md shadow-red-600/30">
                {initials}
              </div>

              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-bold text-gray-900">
                  {userName}
                </p>

                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                  {userRole}
                </p>

                <p className="truncate text-[11px] text-gray-400">
                  {user?.caserne}
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="py-2">
              {menuItems.map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    action();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                  {label}
                </button>
              ))}
            </div>

            {/* Déconnexion */}

            <div className="border-t border-gray-100 py-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}