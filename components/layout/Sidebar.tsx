"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  BarChart3,
  History,
  User,
  Settings,
  Menu,
  Siren,
  VolumeX,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  href: string;
}

interface SidebarProps {
  active?: string;
  onNavigate?: (key: string) => void;
  onLogout?: () => void;
  hasNewAlert?: boolean;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

const MAIN_ITEMS: NavItem[] = [
  { key: "accueil", label: "Tableau de bord", icon: Home, href: "/dashboard" },
  { key: "carte", label: "Carte des interventions", icon: Map, href: "/dashboard/map" },
  { key: "stats", label: "Statistiques", icon: BarChart3, href: "/dashboard/statistics" },
  { key: "historique", label: "Historique", icon: History, href: "/dashboard/history" },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { key: "profil", label: "Profil", icon: User, href: "/dashboard/profile" },
  { key: "parametres", label: "Paramètres", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar({
  active = "accueil",
  onNavigate,
  hasNewAlert = false,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = useState(active);
  const [isMuted, setIsMuted] = useState(false);

  // Synchronise la sélection de la sidebar directement avec l'URL
  useEffect(() => {
    const allItems = [...MAIN_ITEMS, ...ACCOUNT_ITEMS];
    const matchedItem = allItems.find((item) => item.href === pathname);
    if (matchedItem) {
      setActiveKey(matchedItem.key);
    }
  }, [pathname]);

  // Déclenchement du son si une alerte arrive et que le son n'est pas coupé
  useEffect(() => {
    if (hasNewAlert && !isMuted) {
      const audio = new Audio("/sounds/alert.mp3");
      audio.play().catch(() => {});
    }
  }, [hasNewAlert, isMuted]);

  function handleClick(key: string) {
    setActiveKey(key);
    onNavigate?.(key);
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-[#111827] text-white shadow-xl transition-all duration-300 ${
        collapsed ? "w-[82px]" : "w-[260px]"
      }`}
    >
      {/* HEADER */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-3 overflow-visible">
        <div className={`flex items-center overflow-visible transition-all duration-300 ${collapsed ? "w-10" : "w-32"}`}>
          <img
            src="/images/logo.png"
            alt="Secours+"
            className="h-28 w-auto max-w-none object-contain"
          />
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/10"
          aria-label="Réduire / agrandir le menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* MENU */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] uppercase tracking-wider text-gray-500">
            Interventions
          </p>
        )}

        {MAIN_ITEMS.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            active={activeKey === item.key}
            collapsed={collapsed}
            onClick={handleClick}
          />
        ))}

        {!collapsed && (
          <p className="mb-3 mt-6 px-3 text-[11px] uppercase tracking-wider text-gray-500">
            Administration
          </p>
        )}

        {ACCOUNT_ITEMS.map((item) => (
          <NavRow
            key={item.key}
            item={item}
            active={activeKey === item.key}
            collapsed={collapsed}
            onClick={handleClick}
          />
        ))}
      </nav>

      {/* CONTROLES SONORES & ALERTES */}
      <div className="flex items-center justify-center border-t border-white/10 p-4">
        <button
          type="button"
          onClick={toggleMute}
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
            isMuted
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
              : hasNewAlert
              ? "bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse"
              : "bg-white/10 text-red-500 hover:bg-white/20"
          }`}
          title={isMuted ? "Activer le son" : "Couper le son"}
          aria-label={isMuted ? "Activer le son des alertes" : "Couper le son des alertes"}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Siren className="h-6 w-6" />
          )}

          {hasNewAlert && !isMuted && (
            <span className="absolute right-1 top-1 h-3 w-3 animate-ping rounded-full bg-white" />
          )}
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}

function NavRow({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: (key: string) => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={() => onClick(item.key)}
      className={`relative mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
      {item.badge && !collapsed && (
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-red-600">
          {item.badge}
        </span>
      )}
    </Link>
  );
}