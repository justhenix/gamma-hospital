"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeOnly } from "@/lib/utils";
import type { PrescriptionListItem } from "@/server/data-access/prescriptions";
import {
  directUpdateStatusAction,
  updateClassificationAction,
} from "@/server/actions/prescription-actions";
import type { ClassificationType, PrescriptionStatus } from "@/lib/constants";
import {
  getNextSelectionIndex,
  getWorkbenchPrimaryTransition,
  getWorkbenchStatusLabel,
} from "./pharmacy-workbench-model";

interface PharmacyWorkbenchProps {
  initialItems: PrescriptionListItem[];
}

const statusClasses: Record<string, string> = {
  WAITING: "text-amber-700",
  VERIFIED: "text-slate-700",
  PREPARING: "text-slate-900",
  READY_FOR_PICKUP: "text-emerald-700",
  COMPLETED: "text-slate-500",
  NEEDS_CLARIFICATION: "text-red-700",
};

export function PharmacyWorkbench({ initialItems }: PharmacyWorkbenchProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const queueKey = useMemo(
    () => initialItems.map((item) => item.id).join("|"),
    [initialItems]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [queueKey]);

  const selectedItem = initialItems[selectedIndex] ?? null;

  useEffect(() => {
    setShowClarification(false);
    setClarificationNotes("");
    setActionError(null);
  }, [selectedItem?.id]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "j" || event.key === "J" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) =>
          getNextSelectionIndex(current, "next", initialItems.length)
        );
        return;
      }

      if (event.key === "k" || event.key === "K" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) =>
          getNextSelectionIndex(current, "previous", initialItems.length)
        );
        return;
      }

      if (event.key === "Enter" && selectedItem) {
        event.preventDefault();
        router.push(`/prescriptions/${selectedItem.id}`);
      }
    },
    [initialItems.length, router, selectedItem]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const medicationSummary = useMemo(() => {
    if (!selectedItem) return "";
    const ready = selectedItem.itemCounts.ready;
    const compounded = selectedItem.itemCounts.compounded;
    if (compounded === 0) return `${ready} obat jadi`;
    if (ready === 0) return `${compounded} racikan`;
    return `${ready} obat jadi · ${compounded} racikan`;
  }, [selectedItem]);

  const primaryTransition = selectedItem
    ? getWorkbenchPrimaryTransition(selectedItem.status)
    : null;

  const refreshAfterAction = () => {
    router.refresh();
  };

  const handleClassification = (classification: ClassificationType) => {
    if (!selectedItem) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateClassificationAction({
        prescriptionId: selectedItem.id,
        classification,
      });
      if (!result.success) {
        setActionError(
          typeof result.error === "string"
            ? result.error
            : "Klasifikasi tidak dapat disimpan."
        );
        return;
      }
      refreshAfterAction();
    });
  };

  const handleStatus = (status: PrescriptionStatus, notes?: string) => {
    if (!selectedItem) return;
    setActionError(null);
    startTransition(async () => {
      const result = await directUpdateStatusAction({
        prescriptionId: selectedItem.id,
        newStatus: status,
        notes,
      });
      if (!result.success) {
        setActionError(
          typeof result.error === "string"
            ? result.error
            : "Status resep tidak dapat diperbarui."
        );
        return;
      }
      setShowClarification(false);
      setClarificationNotes("");
      refreshAfterAction();
    });
  };

  if (initialItems.length === 0) {
    return (
      <div className="border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
        Tidak ada resep pada antrean ini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="grid min-h-[640px] grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-background/40 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">Antrean</h2>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                J/K untuk berpindah resep
              </p>
            </div>
            <div className="font-sans text-sm font-semibold tabular-nums text-muted-foreground">
              {selectedIndex + 1}/{initialItems.length}
            </div>
          </div>

          <div className="max-h-[590px] overflow-y-auto">
            {initialItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`grid w-full grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                    isSelected
                      ? "bg-card shadow-[inset_3px_0_0_var(--foreground)]"
                      : "bg-transparent hover:bg-card/70"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div>
                    <div className="font-heading text-lg font-extrabold tabular-nums tracking-tight text-foreground">
                      {item.queueEntry?.queueCode || "-"}
                    </div>
                    <div className="mt-1 font-sans text-xs font-medium tabular-nums text-muted-foreground">
                      {formatTimeOnly(item.createdAt)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {item.patient.name}
                    </div>
                    <div className="mt-1 truncate text-xs font-medium text-muted-foreground">
                      {item.department}
                    </div>
                    <div
                      className={`mt-1 truncate text-xs font-semibold ${
                        statusClasses[item.status] || "text-muted-foreground"
                      }`}
                    >
                      {getWorkbenchStatusLabel(item.status)}
                    </div>
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {selectedItem ? (
          <section className="min-w-0 bg-card">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-4 xl:flex-row xl:items-start xl:justify-between xl:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-heading text-xl font-bold tracking-tight text-foreground xl:text-2xl">
                    {selectedItem.patient.name}
                  </h2>
                  <span className="font-heading text-lg font-extrabold tabular-nums text-foreground">
                    {selectedItem.queueEntry?.queueCode || "-"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 text-sm font-medium text-muted-foreground">
                  <span>{selectedItem.patient.mrn}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedItem.department}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedItem.doctorName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      statusClasses[selectedItem.status] || "text-foreground"
                    }`}
                  >
                    {getWorkbenchStatusLabel(selectedItem.status)}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {medicationSummary}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/prescriptions/${selectedItem.id}`}>
                    Detail
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="px-5 py-4 xl:px-6">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">Obat pada resep</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    Periksa nama obat, jumlah, dosis, dan aturan pakai sebelum melanjutkan.
                  </p>
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  {selectedItem.itemCounts.total} item
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
                <div className="grid grid-cols-[minmax(12rem,1.5fr)_7rem_minmax(11rem,1fr)_minmax(12rem,1.2fr)] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                  <div>Obat</div>
                  <div>Jumlah</div>
                  <div>Dosis</div>
                  <div>Aturan pakai</div>
                </div>
                <div className="divide-y divide-border">
                  {selectedItem.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(12rem,1.5fr)_7rem_minmax(11rem,1fr)_minmax(12rem,1.2fr)] gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground">{item.itemName}</div>
                        <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                          {item.type === "COMPOUNDED" ? "Racikan" : "Obat Jadi"}
                        </div>
                      </div>
                      <div className="font-sans text-sm font-semibold tabular-nums text-foreground">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-sm font-medium text-foreground">{item.dosage}</div>
                      <div className="text-sm font-medium text-foreground">{item.signa}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                {actionError ? (
                  <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {actionError}
                  </div>
                ) : null}

                <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)]">
                  <section>
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      Klasifikasi resep
                    </h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Pisahkan alur obat jadi dan racikan sebelum penyiapan.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selectedItem.classification === "obat_jadi"
                            ? "default"
                            : "outline"
                        }
                        disabled={isPending}
                        onClick={() => handleClassification("obat_jadi")}
                      >
                        Obat Jadi
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selectedItem.classification === "racikan"
                            ? "default"
                            : "outline"
                        }
                        disabled={isPending}
                        onClick={() => handleClassification("racikan")}
                      >
                        Racikan
                      </Button>
                    </div>
                  </section>

                  <section className="border-t border-border pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          Tindakan farmasi
                        </h3>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          Lanjutkan resep atau minta klarifikasi tanpa meninggalkan antrean.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/prescriptions/${selectedItem.id}/label`}
                            target="_blank"
                          >
                            <Printer className="mr-1.5 h-3.5 w-3.5" />
                            Cetak etiket
                          </Link>
                        </Button>

                        {primaryTransition ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleStatus(primaryTransition.status)}
                          >
                            {primaryTransition.label}
                          </Button>
                        ) : null}

                        {selectedItem.status !== "COMPLETED" &&
                        selectedItem.status !== "NEEDS_CLARIFICATION" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setShowClarification((current) => !current)}
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                            Klarifikasi ke dokter
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {selectedItem.status === "NEEDS_CLARIFICATION" ? (
                      <div className="mt-3 border-l-2 border-red-500 bg-red-50/60 px-3 py-2 text-sm font-medium text-red-800">
                        Menunggu jawaban dokter. Resep tetap tersimpan di antrean klarifikasi.
                      </div>
                    ) : null}

                    {showClarification ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={clarificationNotes}
                          onChange={(event) => setClarificationNotes(event.target.value)}
                          placeholder="Contoh: mohon konfirmasi aturan pakai pada amoxicillin"
                          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isPending || !clarificationNotes.trim()}
                          onClick={() =>
                            handleStatus("NEEDS_CLARIFICATION", clarificationNotes.trim())
                          }
                        >
                          Kirim klarifikasi
                        </Button>
                      </div>
                    ) : null}
                  </section>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                <span>
                  Klasifikasi: {selectedItem.classification === "obat_jadi"
                    ? "Obat Jadi"
                    : selectedItem.classification === "racikan"
                      ? "Racikan"
                      : "Belum Diklasifikasi"}
                </span>
                <span>Enter membuka halaman detail</span>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
