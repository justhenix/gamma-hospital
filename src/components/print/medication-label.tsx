"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, calculateAge } from "@/lib/utils";
import { recordPrintAction } from "@/server/actions/prescription-actions";
import type { PrescriptionItem, Patient, Prescription } from "@/db/schema";
import Link from "next/link";
import { ArrowLeft, Printer, FileDown } from "lucide-react";

import * as m from "@/paraglide/messages.js";

interface MedicationLabelPrintProps {
  prescription: Prescription & {
    patient: Patient;
    items: PrescriptionItem[];
    queueEntry: { queueCode: string; displayNumber: string } | null;
  };
}

export function MedicationLabelPrint({ prescription }: MedicationLabelPrintProps) {
  const handlePrint = async () => {
    // Record audit event
    await recordPrintAction(prescription.id);
    window.print();
  };

  const patientAge = calculateAge(prescription.patient.birthDate);

  return (
    <div className="space-y-6">
      {/* Control bar (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 bg-card p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/prescriptions/${prescription.id}`} className="flex items-center gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{m.action_back_prescription()}</span>
            </Link>
          </Button>
          <span className="text-sm font-medium text-foreground font-sans tabular-nums">
            Pratinjau Cetak: {prescription.prescriptionNumber} ({prescription.items.length} etiket)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={`/api/prescriptions/${prescription.id}/label/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>{m.action_download_pdf()}</span>
            </a>
          </Button>
          <Button onClick={handlePrint} size="sm" className="flex items-center gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span>{m.action_print_labels()}</span>
          </Button>
        </div>
      </div>

      {/* Printable Stickers / Labels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1 print:gap-4 print:m-0 print:p-0">
        {prescription.items.map((item, idx) => (
          <div
            key={item.id}
            className="border-2 border-black p-4 rounded-md bg-white text-black font-sans text-xs space-y-2.5 print:border-black print:p-3 print:break-inside-avoid print:page-break-inside-avoid"
            style={{ minHeight: "190px" }}
          >
            {/* Header */}
            <div className="border-b border-black pb-1.5 flex justify-between items-start">
              <div>
                <div className="font-bold text-sm tracking-tight uppercase">
                  RS INDRIATI BOYOLALI
                </div>
                <div className="text-xs text-slate-600">
                  Instalasi Farmasi • Telp: (0276) 328-9999
                </div>
              </div>
              <div className="text-right">
                <div className="font-sans tabular-nums font-bold text-sm">
                  {prescription.queueEntry?.queueCode || "-"}
                </div>
                <div className="text-xs font-sans tabular-nums text-slate-600">{formatDate(prescription.createdAt)}</div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-1.5 border-b border-black pb-1.5 text-xs">
              <div>
                <span className="text-slate-600">Pasien:</span>{" "}
                <strong>{prescription.patient.name}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-600">No. RM:</span>{" "}
                <strong className="font-sans tabular-nums">{prescription.patient.mrn}</strong>
              </div>
              <div>
                <span className="text-slate-600">Umur:</span> <span className="font-sans tabular-nums">{patientAge} th ({prescription.patient.birthDate})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-600">Dokter:</span> {prescription.doctorName}
              </div>
            </div>

            {/* Drug Info & Signa */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-baseline font-bold text-sm">
                <span>{item.itemName}</span>
                <span className="font-sans tabular-nums text-xs">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {/* SIGNA BOX */}
              <div className="bg-slate-100 print:bg-slate-100 border border-slate-300 p-2.5 rounded text-center">
                <div className="text-xs font-semibold uppercase text-slate-600">
                  ATURAN PAKAI / PETUNJUK PENGGUNAAN
                </div>
                <div className="font-bold text-sm mt-1 text-black">
                  {item.signa}
                </div>
              </div>

              {item.notes && (
                <div className="text-xs italic text-slate-600">
                  Catatan: {item.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-1.5 flex justify-between text-xs text-slate-600">
              <span>Jenis: {item.type === "COMPOUNDED" ? "RACIKAN" : "OBAT JADI"}</span>
              <span className="font-sans tabular-nums">Label #{idx + 1}/{prescription.items.length}</span>
              <span>Exp: Sesuai Kemasan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
