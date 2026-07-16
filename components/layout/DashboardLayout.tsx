"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  activeRoute?: string;
  onSearch?: (query: string) => void;
}

/**
 * Assembles the fixed Sidebar + sticky Topbar around any page content.
 * Sidebar only knows about navigation; Topbar only knows about page
 * context/actions (search, notifications, user) — the page itself
 * (e.g. Dashboard.tsx) owns the actual data and state.
 */
export default function DashboardLayout({ children, title, activeRoute, onSearch }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar active={activeRoute} />
      <div className="ml-[236px] flex flex-1 flex-col min-w-0 max-[900px]:ml-[76px]">
        <Topbar title={title} onSearch={onSearch} />
        <div className="px-7 pb-16 pt-6 max-[640px]:px-3.5 max-[640px]:pt-4">{children}</div>
      </div>
    </div>
  );
}
