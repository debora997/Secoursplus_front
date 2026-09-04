"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  Users, 
  Bell, 
  LogOut, 
  ChevronRight,
  Menu,
  PanelLeftClose
} from "lucide-react";

interface UserInfo {
  nomComplet?: string;
  telephone?: string;
  role?: string;
}

const navigation = [
  { name: "Tableau de bord", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { name: "Carte en direct", href: "/super-admin/map", icon: Map },
  { name: "Casernes & Chefs", href: "/super-admin/casernes", icon: Building2 },
  { name: "Citoyens", href: "/super-admin/citoyens", icon: Users },
  { name: "Journal des alertes", href: "/super-admin/alertes", icon: Bell },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur parsing user storage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside 
      className={`sticky top-0 flex h-screen flex-col justify-between border-r border-gray-800/80 bg-[#14171d] p-3 text-gray-200 shadow-xl select-none transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="space-y-6">
        
        {/* En-tête : Logo Agrandit & Bouton Toggle */}
        <div className="flex items-center justify-between px-1 py-1">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Secours+ Logo"
                width={52}
                height={52}
                className="object-contain shrink-0 -my-2"
                priority
              />
              <div className="flex flex-col">
                <h2 className="text-base font-bold tracking-tight text-white leading-none">
                  Secours<span className="text-red-500">+</span>
                </h2>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  Super Admin
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto my-1">
              <Image
                src="/images/logo.png"
                alt="Secours+ Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Bouton Hamburger / Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/60 text-gray-400 hover:bg-gray-800 hover:text-white transition-all ${
              isCollapsed ? "mt-3" : ""
            }`}
            title={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

        {/* Navigation principale */}
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group relative flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? "justify-center px-0" : "justify-between px-3.5"
                } ${
                  isActive
                    ? "bg-red-500/10 text-red-500 font-semibold border border-red-500/20"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100"
                }`}
              >
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-red-500" />
                )}

                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>

                {!isCollapsed && (
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isActive
                        ? "text-red-500 opacity-100 translate-x-0"
                        : "text-gray-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pied de page : Profil Utilisateur & Déconnexion */}
      <div className="border-t border-gray-800/80 pt-4">
        <div className="rounded-xl border border-gray-800/80 bg-gray-900/40 p-2 space-y-2">
          {!isCollapsed && <div className="h-px w-full bg-gray-800/60" />}

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Déconnexion" : undefined}
            className={`group flex w-full items-center rounded-lg py-2 text-xs font-medium text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 ${
              isCollapsed ? "justify-center px-0" : "gap-2.5 px-2"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-red-500" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>

        </div>
      </div>
    </aside>
  );
}