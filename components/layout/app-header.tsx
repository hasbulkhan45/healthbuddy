"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Search,
  User,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DemoModeBadge } from "@/components/shared/demo-mode-badge";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { CommandPalette } from "@/components/layout/command-palette";
import { mockUser } from "@/data/mock/users";

export function AppHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/home" },
    { label: "Records", href: "/records" },
    { label: "Prescriptions", href: "/prescriptions" },
    { label: "AI Buddy", href: "/ai-buddy" },
    { label: "Care", href: "/care" },
    { label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/" || pathname === "/home";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <Link href="/home" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/25 transition-transform group-hover:scale-105">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 text-base leading-none">
                  HealthBuddy
                </span>
                <span className="text-[10px] font-semibold text-blue-600 leading-tight">
                  Intelligence Platform
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation */}
            <nav className="hidden md:flex items-center space-x-1 pl-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "text-blue-700 bg-blue-50/80 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs text-slate-500 hover:bg-blue-50/50 hover:border-blue-200 hover:text-blue-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
            >
              <Search className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Search records & vitals</span>
              <kbd className="hidden sm:inline-flex rounded bg-white px-1.5 py-0.2 text-[10px] font-mono text-slate-400 border border-slate-200">
                ⌘K
              </kbd>
            </button>

            <DemoModeBadge className="hidden lg:inline-flex" />

            <NotificationDropdown />

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <Avatar className="h-8 w-8 border-2 border-indigo-100 shadow-2xs ring-1 ring-blue-500/20">
                    <AvatarImage src={mockUser.avatarUrl} alt={mockUser.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                      AM
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900">
                      {mockUser.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {mockUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-3.5 w-3.5 text-blue-600" />
                    <span>Personal Health Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                    <span>AI Permissions</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/doctor-summary" className="cursor-pointer">
                    <Sparkles className="mr-2 h-3.5 w-3.5 text-purple-600" />
                    <span>Doctor Visit Summary</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-slate-400 text-[11px]" disabled>
                  <span>HealthBuddy v1.0 • Demo User</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
