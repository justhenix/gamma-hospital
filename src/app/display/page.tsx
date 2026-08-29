"use client";

import React, { useEffect, useState } from "react";
import { maskName } from "@/lib/utils";
import { getStatusLabel, getItemTypeLabel, type PrescriptionStatus } from "@/lib/constants";
import * as m from "@/paraglide/messages.js";

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
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {m.app_subtitle()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {m.display_title()}
          </h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-sans tabular-nums font-bold text-slate-900">
            {currentTime || "--:--:--"}
          </div>
          <div className="text-xs text-slate-500">
            {m.display_auto_update()}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Ready vs Preparing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ready for Pickup Column (Left - 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-emerald-600 rounded-lg p-5 bg-emerald-50/40">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
              <h2 className="text-lg font-bold tracking-tight text-emerald-950">
                {m.display_ready_heading()}
              </h2>
              <span className="font-sans tabular-nums text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-900">
                {data?.readyForPickup.length || 0} Antrean
              </span>
            </div>

            {(!data || data.readyForPickup.length === 0) && (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada obat yang siap diambil saat ini.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.readyForPickup.map((item) => (
                <div
                  key={item.queueCode}
                  className="border border-emerald-400 rounded-lg p-5 bg-white shadow-sm space-y-2 text-center"
                >
                  <div className="text-xs text-slate-500 font-medium">
                    Nomor Antrean
                  </div>
                  <div className="text-5xl font-bold font-sans tabular-nums tracking-tight text-emerald-900">
                    {item.queueCode}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 border-t pt-2">
                    {maskName(item.patientName)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.department || "Farmasi Rawat Jalan"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Completed Row */}
          <div className="border rounded-lg p-4 bg-white space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              {m.display_recent_completed()}
            </div>
            <div className="flex flex-wrap gap-2">
              {(!data || data.completed.length === 0) && (
                <span className="text-xs text-slate-400">- Belum ada -</span>
              )}
              {data?.completed.map((item) => (
                <span
                  key={item.queueCode}
                  className="px-3 py-1 border rounded-md bg-slate-100 font-sans tabular-nums text-xs font-medium text-slate-700"
                >
                  {item.queueCode} ({maskName(item.patientName)})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preparing Column (Right - 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border rounded-lg p-5 bg-white">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                {m.display_preparing_heading()}
              </h2>
              <span className="font-sans tabular-nums text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {data?.preparing.length || 0} Resep
              </span>
            </div>

            {(!data || data.preparing.length === 0) && (
              <div className="p-8 text-center text-slate-400 text-sm">
                Tidak ada resep dalam proses penyiapan.
              </div>
            )}

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {data?.preparing.map((item) => (
                <div
                  key={item.queueCode}
                  className="border rounded-md p-3.5 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-sans tabular-nums font-bold text-lg text-slate-900">
                      {item.queueCode}
                    </div>
                    <div className="font-semibold text-slate-800 text-sm">
                      {maskName(item.patientName)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.department}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block px-2.5 py-1 border rounded bg-white font-semibold text-xs text-slate-800">
                      {getStatusLabel(item.status)}
                    </span>
                    {item.hasCompounded && (
                      <div className="text-xs text-amber-700 font-semibold">
                        {getItemTypeLabel("COMPOUNDED")}
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
