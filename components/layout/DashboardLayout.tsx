"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  activeRoute?: string;
  onSearch?: (query: string) => void;
}

export default function DashboardLayout({
  children,
  title,
  activeRoute,
  onSearch,
}: DashboardLayoutProps) {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-bg">

      <Sidebar
        active={activeRoute}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`
          flex
          flex-1
          flex-col
          min-w-0
          transition-all
          duration-300
          ${collapsed ? "ml-[82px]" : "ml-[260px]"}
        `}
      >
        <Topbar
          title={title}
          onSearch={onSearch}
        />

        <div className="px-7 pt-6 pb-16 max-[640px]:px-4">
          {children}
        </div>
      </div>

    </div>
  );
}