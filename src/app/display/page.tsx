"use client";

import React, { useEffect, useState } from "react";
import { maskName, formatTimeOnly } from "@/lib/utils";
import { type PrescriptionStatus } from "@/lib/constants";

interface DisplayItem {
  queueCode: string;
  displayNumber: string;
  status: PrescriptionStatus;
  patientName: string;
  doctorName?: string;
  department?: string;
  calledAt?: string | null;
  hasCompounded?: boolean;
}

interface DisplayPayload {
  preparing: DisplayItem[];
  readyForPickup: DisplayItem[];
  completed: DisplayItem[];
  timestamp: string;
}

export default function DisplayPage() {
  const [data, setData] = useState<DisplayPayload | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling data every 3 seconds
  useEffect(() => {
    const fetchDisplay = async () => {
      try {
        const res = await fetch("/api/display");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Display poll error:", err);
      }
    };

    fetchDisplay();
    const interval = setInterval(fetchDisplay, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* TV Display Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            RS INDRIATI BOYOLALI
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            PAPAN ANTREAN INSTALASI FARMASI
          </h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-black text-slate-900">
            {currentTime || "--:--:--"}
          </div>
          <div className="text-xs font-mono text-slate-500">
            Update Otomatis (Setiap 3s)
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Ready vs Preparing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ready for Pickup Column (Left - 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-2 border-emerald-700 rounded-lg p-4 bg-emerald-50/50">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-3">
              <h2 className="text-lg font-black tracking-tight text-emerald-950 uppercase flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
                SIAP DIAMBIL / READY FOR PICKUP
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-800">
                {data?.readyForPickup.length || 0} Antrean
              </span>
            </div>

            {(!data || data.readyForPickup.length === 0) && (
              <div className="p-8 text-center text-slate-400 font-mono text-sm">
                Belum ada obat yang siap diambil saat ini.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.readyForPickup.map((item) => (
                <div
                  key={item.queueCode}
                  className="border-2 border-emerald-600 rounded-md p-4 bg-white shadow-sm space-y-2 text-center"
                >
                  <div className="text-xs font-mono text-slate-500 uppercase">
                    Nomor Antrean
                  </div>
                  <div className="text-4xl font-black font-mono tracking-tight text-emerald-900">
                    {item.queueCode}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 border-t pt-1">
                    {maskName(item.patientName)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {item.department || "Farmasi Rawat Jalan"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Completed Row */}
          <div className="border rounded-md p-4 bg-white space-y-2">
            <div className="text-xs font-bold font-mono uppercase text-slate-500">
              Selesai Diserahkan (Terakhir)
            </div>
            <div className="flex flex-wrap gap-2">
              {(!data || data.completed.length === 0) && (
                <span className="text-xs text-slate-400 font-mono">- Belum ada -</span>
              )}
              {data?.completed.map((item) => (
                <span
                  key={item.queueCode}
                  className="px-2.5 py-1 border rounded bg-slate-100 font-mono text-xs font-medium text-slate-700"
                >
                  {item.queueCode} ({maskName(item.patientName)})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preparing Column (Right - 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">
                SEDANG DISIAPKAN / RACIK
              </h2>
              <span className="font-mono text-xs font-bold text-slate-600">
                {data?.preparing.length || 0} Resep
              </span>
            </div>

            {(!data || data.preparing.length === 0) && (
              <div className="p-8 text-center text-slate-400 font-mono text-sm">
                Tidak ada resep dalam proses penyiapan.
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {data?.preparing.map((item) => (
                <div
                  key={item.queueCode}
                  className="border rounded p-3 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-base text-slate-900">
                      {item.queueCode}
                    </div>
                    <div className="font-medium text-slate-700">
                      {maskName(item.patientName)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.department}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="px-2 py-0.5 border rounded bg-white font-bold text-[10px] text-slate-700">
                      {item.status}
                    </span>
                    {item.hasCompounded && (
                      <div className="text-[10px] text-amber-700 mt-1 font-semibold">
                        [Racikan]
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
