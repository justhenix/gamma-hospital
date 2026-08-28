"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, calculateAge } from "@/lib/utils";
import { recordPrintAction } from "@/server/actions/prescription-actions";
import type { PrescriptionItem, Patient, Prescription } from "@/db/schema";
import Link from "next/link";

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
      <div className="no-print flex items-center justify-between border-b pb-4 bg-slate-50 p-4 rounded-md">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/prescriptions/${prescription.id}`}>
              &larr; Back to Prescription
            </Link>
          </Button>
          <span className="text-sm font-medium text-slate-700">
            Print Preview: {prescription.prescriptionNumber} ({prescription.items.length} labels)
          </span>
        </div>
        <Button onClick={handlePrint} size="sm">
          🖨 Print Labels (Browser Print)
        </Button>
      </div>

      {/* Printable Stickers / Labels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1 print:gap-4 print:m-0 print:p-0">
        {prescription.items.map((item, idx) => (
          <div
            key={item.id}
            className="border-2 border-black p-4 rounded bg-white text-black font-sans text-xs space-y-2 print:border-black print:p-3 print:break-inside-avoid print:page-break-inside-avoid"
            style={{ minHeight: "180px" }}
          >
            {/* Header */}
            <div className="border-b border-black pb-1.5 flex justify-between items-start">
              <div>
                <div className="font-bold text-sm tracking-tight uppercase">
                  RS INDRIATI BOYOLALI
                </div>
                <div className="text-[10px] text-slate-600">
                  Instalasi Farmasi • Telp: (0276) 328-9999
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm">
                  {prescription.queueEntry?.queueCode || "-"}
                </div>
                <div className="text-[9px] font-mono">{formatDate(prescription.createdAt)}</div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-1 border-b border-black pb-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">Pasien:</span>{" "}
                <strong>{prescription.patient.name}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">No. RM:</span>{" "}
                <strong>{prescription.patient.mrn}</strong>
              </div>
              <div>
                <span className="text-slate-500">Umur:</span> {patientAge} th ({prescription.patient.birthDate})
              </div>
              <div className="text-right">
                <span className="text-slate-500">Dokter:</span> {prescription.doctorName}
              </div>
            </div>

            {/* Drug Info & Signa */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between items-baseline font-bold text-sm">
                <span>{item.itemName}</span>
                <span className="font-mono text-xs">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {/* SIGNA BOX */}
              <div className="bg-slate-100 print:bg-slate-100 border border-slate-300 p-2 rounded text-center">
                <div className="text-[10px] font-semibold uppercase text-slate-500">
                  ATURAN PAKAI / PETUNJUK PENGGUNAAN
                </div>
                <div className="font-bold text-sm mt-0.5 text-black">
                  {item.signa}
                </div>
              </div>

              {item.notes && (
                <div className="text-[10px] italic text-slate-600">
                  Catatan: {item.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-1 flex justify-between text-[9px] text-slate-600">
              <span>Jenis: {item.type === "COMPOUNDED" ? "RACIKAN" : "OBAT JADI"}</span>
              <span>Label #{idx + 1}/{prescription.items.length}</span>
              <span>Exp: Sesuai Kemasan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
