"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/workbench/status-badge";
import { formatTimeOnly } from "@/lib/utils";
import { type PrescriptionStatus } from "@/lib/constants";
import { AlertTriangle, CheckCircle2, Check } from "lucide-react";
import * as m from "@/paraglide/messages.js";
import type { PublicTrackerPayload } from "../public-tracker-model";

export default function PatientTrackerPage() {
  const params = useParams();
  const queueCode = typeof params.queueCode === "string" ? params.queueCode : "";

  const [data, setData] = useState<PublicTrackerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const flowSteps: { status: PrescriptionStatus; title: string; desc: string }[] = [
    { status: "WAITING", title: m.status_waiting(), desc: m.step_waiting_desc() },
    { status: "VERIFIED", title: m.status_verified(), desc: m.step_verified_desc() },
    { status: "PREPARING", title: m.status_preparing(), desc: m.step_preparing_desc() },
    { status: "READY_FOR_PICKUP", title: m.status_ready_for_pickup(), desc: m.step_ready_desc() },
    { status: "COMPLETED", title: m.status_completed(), desc: m.step_completed_desc() },
  ];

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
    ? flowSteps.findIndex((s) => s.status === data.status)
    : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-xl space-y-6 px-6 py-8 sm:py-10">
        <div className="space-y-1 border-b border-border pb-4 text-center">
          <div className="text-sm font-semibold text-muted-foreground">
            {m.app_subtitle()}
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {m.tracker_title()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {m.tracker_subtitle()}
          </p>
        </div>

      {loading && !data && (
        <div className="text-center p-8 border rounded-lg text-sm text-slate-500">
          Memuat status antrean {queueCode}...
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Queue Card */}
          <div className="rounded-md border border-border bg-card p-6 text-center shadow-sm space-y-3">
            <div className="text-xs text-slate-500 font-medium">
              {m.tracker_your_number()}
            </div>
            <div className="text-5xl font-bold font-sans tabular-nums tracking-tight text-slate-900">
              {data.queueCode}
            </div>
            <div className="pt-2">
              <StatusBadge status={data.status} />
            </div>

            <div className="border-t border-border pt-4 text-sm text-muted-foreground">
              Pasien: <strong className="text-foreground">{data.patientName}</strong>
            </div>
          </div>

          {/* Clarification Alert if needed */}
          {data.status === "NEEDS_CLARIFICATION" && (
            <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <span>{m.tracker_clarification_title()}</span>
              </div>
              <p>
                {m.tracker_clarification_desc()}
              </p>
            </div>
          )}

          {/* Pickup Banner if Ready */}
          {data.status === "READY_FOR_PICKUP" && (
            <div className="p-4 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-950 text-center space-y-1">
              <div className="font-bold text-base flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <span>{m.tracker_ready_banner_title()}</span>
              </div>
              <p className="text-xs">
                {m.tracker_ready_banner_desc()}
              </p>
            </div>
          )}

          {/* Workflow Progress Steps */}
          <div className="border rounded-lg p-5 bg-white space-y-3">
            <div className="text-xs font-semibold text-slate-500">
              {m.tracker_steps_heading()}
            </div>

            <div className="space-y-3">
              {flowSteps.map((step, idx) => {
                const isPassed = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step.status}
                    className={`flex items-start gap-3 p-3 rounded-md border text-xs ${
                      isCurrent
                        ? "border-slate-900 bg-slate-100 font-semibold"
                        : isPassed
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : "border-slate-100 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-sans tabular-nums text-xs font-bold ${
                        isCurrent
                          ? "bg-slate-900 text-white"
                          : isPassed
                          ? "bg-slate-300 text-slate-800"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-semibold text-slate-900">{step.title}</div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Polling Footer Info */}
          <div className="text-center font-sans tabular-nums text-xs text-muted-foreground">
            Terakhir diperbarui: {formatTimeOnly(lastChecked)}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
