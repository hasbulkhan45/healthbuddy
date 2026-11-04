import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthBuddy — Personal Healthcare & Preventive Intelligence",
  description:
    "A clean, intelligent personal health companion for tracking vitals, understanding medical reports, and proactive care.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <MobileBottomNav />
        <Toaster />
      </body>
    </html>
  );
}
