"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/workbench/status-badge";
import { Button } from "@/components/ui/button";
import { maskName, formatTimeOnly } from "@/lib/utils";
import { PRESCRIPTION_STATUSES, type PrescriptionStatus } from "@/lib/constants";
import { AlertTriangle, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";

interface TrackerData {
  id: string;
  queueCode: string;
  displayNumber: string;
  status: PrescriptionStatus;
  calledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  prescription: {
    id: string;
    prescriptionNumber: string;
    doctorName: string;
    department: string;
    status: PrescriptionStatus;
    patient: {
      id: string;
      mrn: string;
      name: string;
      gender: string;
    };
    itemCount: number;
    hasCompounded: boolean;
  };
}

const FLOW_STEPS: { status: PrescriptionStatus; title: string; desc: string }[] = [
  { status: "WAITING", title: "Menunggu Antrean", desc: "Resep telah diterima sistem farmasi" },
  { status: "VERIFIED", title: "Diverifikasi", desc: "Apoteker sedang memeriksa resep & dosis" },
  { status: "PREPARING", title: "Sedang Disiapkan / Diracik", desc: "Obat sedang dikemas & diracik di meja farmasi" },
  { status: "READY_FOR_PICKUP", title: "Siap Diambil", desc: "Obat selesai! Silakan menuju loket penyerahan" },
  { status: "COMPLETED", title: "Selesai", desc: "Obat telah diserahkan kepada pasien" },
];

export default function PatientTrackerPage() {
  const params = useParams();
  const queueCode = typeof params.queueCode === "string" ? params.queueCode : "";

  const [data, setData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchData = async () => {
    if (!queueCode) return;
    try {
      const res = await fetch(`/api/track/${queueCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`Nomor antrean "${queueCode}" tidak ditemukan.`);
        } else {
          setError("Gagal memuat status antrean.");
        }
        return;
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setLastChecked(new Date());
    } catch (err) {
      setError("Koneksi terganggu. Mencoba menghubungkan kembali...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 4 seconds
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [queueCode]);

  const currentStepIndex = data
    ? FLOW_STEPS.findIndex((s) => s.status === data.status)
    : -1;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="text-center space-y-1 border-b pb-4">
        <div className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
          RS Indriati Boyolali • Instalasi Farmasi
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Status Antrean Resep Pasien
        </h1>
        <p className="text-xs text-slate-500">
          Halaman ini memperbarui status secara otomatis setiap 4 detik.
        </p>
      </div>

      {loading && !data && (
        <div className="text-center p-8 border rounded font-mono text-sm text-slate-500">
          Memuat status antrean {queueCode}...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-sm text-center">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Queue Card */}
          <div className="border-2 border-slate-900 rounded-lg p-6 bg-white text-center space-y-3">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Nomor Antrean Anda
            </div>
            <div className="text-5xl font-black font-mono tracking-tight text-slate-900">
              {data.queueCode}
            </div>
            <div className="pt-2">
              <StatusBadge status={data.status} />
            </div>

            <div className="pt-3 border-t grid grid-cols-2 gap-2 text-xs font-mono text-left text-slate-700">
              <div>
                <span className="text-slate-400">Pasien:</span>{" "}
                <strong>{maskName(data.prescription.patient.name)}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400">No. RM:</span>{" "}
                <strong>{data.prescription.patient.mrn}</strong>
              </div>
              <div>
                <span className="text-slate-400">Poli/Dokter:</span>{" "}
                {data.prescription.department}
              </div>
              <div className="text-right">
                <span className="text-slate-400">Jenis:</span>{" "}
                {data.prescription.hasCompounded ? "Racikan" : "Obat Jadi"}
              </div>
            </div>
          </div>

          {/* Clarification Alert if needed */}
          {data.status === "NEEDS_CLARIFICATION" && (
            <div className="p-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <span>Resep Sedang Dikonfirmasi</span>
              </div>
              <p>
                Apoteker sedang melakukan konfirmasi teknis ke dokter peresep. Anda tidak perlu khawatir, antrean Anda akan segera dilanjutkan setelah konfirmasi selesai.
              </p>
            </div>
          )}

          {/* Pickup Banner if Ready */}
          {data.status === "READY_FOR_PICKUP" && (
            <div className="p-4 rounded-md border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-center space-y-1">
              <div className="font-bold text-base flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <span>Obat Anda Sudah Siap!</span>
              </div>
              <p className="text-xs">
                Silakan menuju loket penyerahan obat farmasi dan tunjukkan nomor antrean <strong>{data.queueCode}</strong>.
              </p>
            </div>
          )}

          {/* Workflow Progress Steps */}
          <div className="border rounded-md p-4 bg-white space-y-3">
            <div className="text-xs font-bold font-mono uppercase text-slate-500">
              Tahapan Pengerjaan Resep
            </div>

            <div className="space-y-3">
              {FLOW_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step.status}
                    className={`flex items-start gap-3 p-2.5 rounded border text-xs ${
                      isCurrent
                        ? "border-slate-900 bg-slate-100 font-semibold"
                        : isPassed
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : "border-slate-100 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        isCurrent
                          ? "bg-slate-900 text-white"
                          : isPassed
                          ? "bg-slate-300 text-slate-800"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{step.title}</div>
                      <div className="text-[11px] text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Polling Footer Info */}
          <div className="text-center font-mono text-[11px] text-slate-400">
            Terakhir diperbarui: {formatTimeOnly(lastChecked)} (Polling aktif)
          </div>
        </div>
      )}
    </div>
  );
}
