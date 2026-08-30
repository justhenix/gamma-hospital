import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Hospital, ExternalLink } from "lucide-react";
import { StaffHeaderGuard } from "@/components/layout/staff-header-guard";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import * as m from "@/paraglide/messages.js";

export const metadata: Metadata = {
  title: "RS Indriati - Pharmacy Workbench",
  description: "Operational pharmacy workbench for RS Indriati Boyolali.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable}`} data-theme="light">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Header Navigation (hidden in print) */}
          <StaffHeaderGuard>
            <header className="no-print border-b border-border bg-card px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-heading font-bold text-base tracking-tight hover:opacity-85 flex items-center gap-2 text-foreground">
                  <Hospital className="h-5 w-5 text-foreground" />
                  <span>{m.app_title()}</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <Link href="/" className="hover:text-foreground transition-colors">
                    {m.nav_workbench()}
                  </Link>
                  <Link href="/display" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <span>{m.nav_tv_display()}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link href="/track/A-002" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <span>{m.nav_sample_tracker()}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </nav>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                {m.app_subtitle()}
              </div>
            </header>
          </StaffHeaderGuard>

          {/* Main Content Area */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
