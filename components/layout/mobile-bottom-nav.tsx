"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Sparkles, HeartPulse, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Records", href: "/records", icon: FileText },
    { label: "AI Buddy", href: "/ai-buddy", icon: Sparkles, highlight: true },
    { label: "Care", href: "/care", icon: HeartPulse },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/" || pathname === "/home";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="grid h-14 grid-cols-5 items-center justify-around px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                active
                  ? "text-blue-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.highlight ? (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all shadow-sm ${
                    active
                      ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/30 scale-105"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              ) : (
                <Icon className={`h-4 w-4 mb-0.5 ${active ? "text-blue-600" : "text-slate-500"}`} />
              )}
              <span className={`text-[10px] leading-tight ${item.highlight ? "mt-0.5" : ""}`}>
                {item.label}
              </span>
              {active && !item.highlight && (
                <span className="absolute -top-[1px] h-0.5 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
