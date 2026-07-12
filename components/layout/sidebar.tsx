"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  Layers,
  Calendar,
  Wrench,
  FileSearch,
  FileText,
  Bell,
  Map,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Organization", href: "/organization", icon: Building },
  { title: "Assets", href: "/assets", icon: Package },
  { title: "Allocations", href: "/allocations", icon: Layers },
  { title: "Bookings", href: "/bookings", icon: Calendar },
  { title: "Maintenance", href: "/maintenance", icon: Wrench },
  { title: "Audits", href: "/audits", icon: FileSearch },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Office Map", href: "/office-map", icon: Map },
  { title: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && <span className="font-bold text-xl text-primary">AssetFlow</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
