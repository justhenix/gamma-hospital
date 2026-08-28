import type { Metadata } from "next";
import Link from "next/link";
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
              <Link href="/" className="font-bold text-base tracking-tight hover:opacity-80">
                🏥 Pharmacy Workbench
              </Link>
              <nav className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <Link href="/" className="hover:text-slate-900">
                  Workbench Queue
                </Link>
                <Link href="/display" target="_blank" className="hover:text-slate-900">
                  TV Display ↗
                </Link>
                <Link href="/track/A-002" target="_blank" className="hover:text-slate-900">
                  Sample Tracker (A-002) ↗
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
