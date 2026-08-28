import type { Metadata } from "next";
import Link from "next/link";
import { Hospital, ExternalLink } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hospital Pharmacy Workbench Scaffold",
  description: "Raw functional MVP workbench scaffold for RS Indriati Boyolali pharmacy operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Header Navigation (hidden in print) */}
          <header className="no-print border-b bg-white px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-base tracking-tight hover:opacity-80 flex items-center gap-2">
                <Hospital className="h-5 w-5 text-slate-900" />
                <span>Pharmacy Workbench</span>
              </Link>
              <nav className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <Link href="/" className="hover:text-slate-900">
                  Workbench Queue
                </Link>
                <Link href="/display" target="_blank" className="hover:text-slate-900 flex items-center gap-1">
                  <span>TV Display</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link href="/track/A-002" target="_blank" className="hover:text-slate-900 flex items-center gap-1">
                  <span>Sample Tracker (A-002)</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </nav>
            </div>
            <div className="text-xs font-mono text-slate-500">
              RS Indriati Boyolali • Prototype
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
